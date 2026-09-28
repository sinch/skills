#!/usr/bin/env python3
"""Validate the Sinch skill catalog without requiring third-party packages."""

from __future__ import annotations

import argparse
import json
import re
import shutil
import sys
import tempfile
import urllib.error
import urllib.request
from dataclasses import dataclass
from pathlib import Path
from urllib.parse import unquote

# Resolve the sibling generator whether this file is run as a path or as `-m scripts.…`.
sys.path.insert(0, str(Path(__file__).resolve().parent))

from sync_sinch_skill_references import (  # noqa: E402
    POLICY_ID,
    POLICY_VERSION,
    expected_files,
    policy_digest_markdown,
    policy_gate_markdown,
)

REPO_ROOT = Path(__file__).resolve().parents[1]
ROOT = REPO_ROOT / "skills"
DOCS_ROOT = REPO_ROOT / "docs"
POLICY = DOCS_ROOT / "SINCH_SHARED_POLICY.md"
# Deliberate tripwire: adding or removing a skill must be an explicit edit here,
# so an accidentally dropped or half-added skill folder fails the build.
EXPECTED_SKILL_COUNT = 28
CONVERSATION_OPENAPI_URL = "https://developers.sinch.com/_bundle/docs/conversation/api-reference/conversation.yaml?download"
SMS_PROPERTIES_URL = "https://developers.sinch.com/docs/conversation/channel-support/sms/properties.md"
LEGACY_PATTERNS = {
    "forced separate questions": "separate, open-ended question",
    "unsafe client-secret choice": "Can the Application Secret be embedded",
    "unbounded polling": "**Always poll**",
    "per-field citation overload": "cite only URLs you have fetched in **this session**",
    "bundled scripts as payload authority": "Payload shapes are in the bundled scripts",
    "bundled script as field reference": "(see `scripts/",
    "bundled script inventory as reference": "references/scripts.md",
    "bundled scripts link in skill": "[Bundled runnable scripts]",
    "messages overview used as direct API schema": "refer to the Messages API Reference linked in Links for request/response schemas",
}


@dataclass
class Finding:
    level: str
    path: Path
    message: str


class CatalogValidator:
    def __init__(self, check_remote: bool) -> None:
        self.check_remote = check_remote
        self.findings: list[Finding] = []
        self.json_checked = 0
        self.json_skipped = 0
        self.shell_checked = 0
        self.generated_checked = 0
        self.policy_gates_checked = 0
        self.policy_digests_checked = 0
        self.standalone_checked = 0

    def error(self, path: Path, message: str) -> None:
        self.findings.append(Finding("ERROR", path, message))

    def warning(self, path: Path, message: str) -> None:
        self.findings.append(Finding("WARN", path, message))

    def validate(self) -> int:
        skill_files = sorted(ROOT.glob("sinch-*/SKILL.md"))
        skill_names = {path.parent.name for path in skill_files}
        if len(skill_files) != EXPECTED_SKILL_COUNT:
            self.error(ROOT, f"expected {EXPECTED_SKILL_COUNT} skills, found {len(skill_files)}")

        if not POLICY.exists():
            self.error(POLICY, "shared policy is missing")

        generated = expected_files() if POLICY.exists() else {}
        for skill_file in skill_files:
            self.validate_skill(skill_file, generated, skill_names)

        if POLICY.exists():
            self.validate_relative_links(POLICY)

        for finding in self.findings:
            relative = finding.path.relative_to(REPO_ROOT) if finding.path.is_relative_to(REPO_ROOT) else finding.path
            print(f"{finding.level}: {relative}: {finding.message}")

        errors = sum(f.level == "ERROR" for f in self.findings)
        warnings = sum(f.level == "WARN" for f in self.findings)
        print(
            f"skills={len(skill_files)} errors={errors} warnings={warnings} "
            f"json_checked={self.json_checked} json_skipped={self.json_skipped} "
            f"shell_checked={self.shell_checked} generated_checked={self.generated_checked} "
            f"policy_gates_checked={self.policy_gates_checked} policy_digests_checked={self.policy_digests_checked} "
            f"standalone_checked={self.standalone_checked}"
        )
        return 1 if errors else 0

    def validate_skill(
        self,
        path: Path,
        generated: dict[Path, str],
        skill_names: set[str],
    ) -> None:
        text = path.read_text(encoding="utf-8")
        folder_name = path.parent.name
        frontmatter = self.parse_frontmatter(path, text)

        if frontmatter.get("name") != folder_name:
            self.error(path, f"frontmatter name must equal folder name {folder_name!r}")
        if not frontmatter.get("description"):
            self.error(path, "frontmatter description is missing")
        if not re.search(r"(?m)^\s+version:\s*\S+", text):
            self.error(path, "metadata.version is missing")

        if "references/shared-policy.md" not in text:
            self.error(path, "package-local shared-policy link is missing")
        gate = policy_gate_markdown()
        if text.count(gate) != 1:
            self.error(path, f"must contain exactly one policy gate for {POLICY_ID}@{POLICY_VERSION}")
        else:
            self.policy_gates_checked += 1
        digest = policy_digest_markdown()
        if text.count(digest) != 1:
            self.error(path, "must contain exactly one generated policy digest")
        elif f"{gate}\n\n{digest}" not in text:
            self.error(path, "policy digest must directly follow the policy gate")
        else:
            self.policy_digests_checked += 1
        if re.search(r"Mandatory preflight.*Read \[the shared Sinch policy\]", text):
            self.error(path, "unconditional shared-policy read remains")

        dependencies = self.parse_dependencies(path, text)
        for dependency in sorted(dependencies):
            if dependency == folder_name:
                self.error(path, "metadata.uses must not include the skill itself")
            elif dependency not in skill_names:
                self.error(path, f"metadata.uses names unavailable skill: {dependency}")

        for generated_path in (path.parent / "references" / "shared-policy.md",):
            expected = generated.get(generated_path)
            if expected is None:
                self.error(path, f"generator has no output for {generated_path.name}")
            elif not generated_path.exists():
                self.error(path, f"generated reference is missing: {generated_path.name}")
            elif generated_path.read_text(encoding="utf-8") != expected:
                self.error(path, f"generated reference is stale: {generated_path.name}")
            else:
                self.generated_checked += 1

        for label, pattern in LEGACY_PATTERNS.items():
            if pattern in text:
                self.error(path, f"legacy anti-pattern remains: {label}")

        if folder_name in {"sinch-conversation-api", "sinch-rcs"}:
            if "## Required Document Routes" not in text:
                self.error(path, "direct API skill is missing the required document-routes gate")
            if CONVERSATION_OPENAPI_URL not in text:
                self.error(path, "direct API skill is missing the authoritative Conversation OpenAPI route")
        if folder_name == "sinch-rcs" and "SMS_SENDER" in text and SMS_PROPERTIES_URL not in text:
            self.error(path, "RCS SMS_SENDER guidance is missing the exact SMS properties route")

        for line in text.splitlines():
            if (
                "Messages API Reference" in line
                and "request/response schemas" in line
                and "does not authorize" not in line
                and "no request-body schema" not in line
            ):
                self.error(path, "Messages API overview is presented as request-schema authority")

        self.validate_relative_links(path)
        self.validate_json_blocks(path, text)
        self.validate_shell_blocks(path, text)
        self.validate_standalone_skill(path.parent)
        if self.check_remote:
            self.validate_remote_links(path, text)

    def parse_frontmatter(self, path: Path, text: str) -> dict[str, str]:
        if not text.startswith("---\n"):
            self.error(path, "YAML frontmatter must start on line 1")
            return {}
        end = text.find("\n---\n", 4)
        if end < 0:
            self.error(path, "YAML frontmatter closing delimiter is missing")
            return {}

        values: dict[str, str] = {}
        for line in text[4:end].splitlines():
            match = re.match(r"^([A-Za-z][\w-]*):\s*(.*)$", line)
            if match:
                values[match.group(1)] = match.group(2).strip().strip('"\'')
        return values

    def parse_dependencies(self, path: Path, text: str) -> set[str]:
        frontmatter_end = text.find("\n---\n", 4)
        if frontmatter_end < 0:
            return set()
        frontmatter = text[4:frontmatter_end]
        match = re.search(r"(?m)^  uses:\s*\n((?: {4,}- [^\n]+\n?)*)", frontmatter)
        if not match:
            return set()
        dependencies = re.findall(r"(?m)^ {4,}- (sinch-[a-z0-9-]+)\s*$", match.group(1))
        declared_lines = [line for line in match.group(1).splitlines() if line.strip()]
        if len(dependencies) != len(declared_lines):
            self.error(path, "metadata.uses contains an invalid dependency entry")
        if len(dependencies) != len(set(dependencies)):
            self.error(path, "metadata.uses contains duplicate dependencies")
        return set(dependencies)

    def validate_relative_links(self, path: Path) -> None:
        text = path.read_text(encoding="utf-8")
        for target in re.findall(r"\[[^\]]*\]\(([^)]+)\)", text):
            if target.startswith(("http://", "https://", "mailto:", "#")):
                continue
            clean_target = unquote(target.split("#", 1)[0])
            if not clean_target:
                continue
            resolved = (path.parent / clean_target).resolve()
            if not resolved.exists():
                self.error(path, f"broken relative link: {target}")

    def validate_standalone_skill(self, skill_dir: Path) -> None:
        with tempfile.TemporaryDirectory(prefix=f"{skill_dir.name}-") as temp_dir:
            isolated = Path(temp_dir) / skill_dir.name
            shutil.copytree(skill_dir, isolated)
            broken: set[tuple[str, str]] = set()
            for markdown in isolated.rglob("*.md"):
                text = markdown.read_text(encoding="utf-8")
                for target in re.findall(r"\[[^\]]*\]\(([^)]+)\)", text):
                    if target.startswith(("http://", "https://", "mailto:", "#")):
                        continue
                    clean_target = unquote(target.split("#", 1)[0])
                    if clean_target and not (markdown.parent / clean_target).resolve().exists():
                        relative_markdown = str(markdown.relative_to(isolated))
                        broken.add((relative_markdown, target))
            for markdown, target in sorted(broken):
                self.error(skill_dir / markdown, f"not standalone; broken relative link: {target}")
            self.standalone_checked += 1

    def validate_json_blocks(self, path: Path, text: str) -> None:
        for block in re.findall(r"```json\s*\n(.*?)```", text, flags=re.DOTALL | re.IGNORECASE):
            if "..." in block or re.search(r"(?m)^\s*//", block):
                self.json_skipped += 1
                continue
            candidate = re.sub(r"\{\{[^{}]+\}\}", "PLACEHOLDER", block)
            try:
                json.loads(candidate)
                self.json_checked += 1
            except json.JSONDecodeError as exc:
                self.error(path, f"invalid JSON example at block line {exc.lineno}: {exc.msg}")

    def validate_shell_blocks(self, path: Path, text: str) -> None:
        for block in re.findall(r"```(?:bash|shell|curl)\s*\n(.*?)```", text, flags=re.DOTALL | re.IGNORECASE):
            lines = [line.rstrip() for line in block.splitlines() if line.strip()]
            if not lines:
                continue
            self.shell_checked += 1
            for index, line in enumerate(lines):
                if re.match(r"^\s+-(?:H|u|d|F|X|s|o)\b", line) and index > 0:
                    previous = lines[index - 1]
                    if not previous.endswith("\\"):
                        self.error(path, f"shell option line lacks continuation after: {previous.strip()}")
            if lines[-1].endswith("\\"):
                self.error(path, "shell example ends with a dangling continuation")

    def validate_remote_links(self, path: Path, text: str) -> None:
        for url in sorted(self.extract_urls(text)):
            request = urllib.request.Request(url, headers={"User-Agent": "sinch-skill-validator/1.0"})
            try:
                with urllib.request.urlopen(request, timeout=15) as response:
                    if response.status >= 400:
                        self.error(path, f"remote link returned HTTP {response.status}: {url}")
            except (urllib.error.URLError, TimeoutError) as exc:
                self.warning(path, f"remote link unavailable: {url} ({exc})")

    @staticmethod
    def extract_urls(text: str) -> set[str]:
        return set(re.findall(r"https://[^\s)>]+", text))


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--check-remote", action="store_true", help="check canonical links over HTTPS")
    args = parser.parse_args()
    return CatalogValidator(check_remote=args.check_remote).validate()


if __name__ == "__main__":
    sys.exit(main())
