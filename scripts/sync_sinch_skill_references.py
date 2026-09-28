#!/usr/bin/env python3
"""Generate the self-contained shared-policy reference for each Sinch skill."""

from __future__ import annotations

import argparse
import hashlib
import re
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[1]
SKILLS_ROOT = REPO_ROOT / "skills"
DOCS_ROOT = REPO_ROOT / "docs"
POLICY_PATH = DOCS_ROOT / "SINCH_SHARED_POLICY.md"
GENERATED_NOTICE = "<!-- Generated from the Sinch catalog policy sources; do not edit directly. -->"
POLICY_ID = "sinch-shared-policy"
POLICY_VERSION = "5"
GATE_PATTERN = re.compile(r"(?m)^> \*\*(?:Policy gate|Mandatory preflight).*?$")
DIGEST_SOURCE_PATTERN = re.compile(r"(?ms)<!-- Digest: start -->\n(.*?)<!-- Digest: end -->")
DIGEST_BLOCK_PATTERN = re.compile(
    r"(?ms)^<!-- sinch-policy-digest: start[^>]*-->\n.*?\n<!-- sinch-policy-digest: end -->$"
)
CATALOG_ONLY_PATTERN = re.compile(
    r"(?ms)<!-- Catalog-only: start -->.*?<!-- Catalog-only: end -->\n?"
)


def policy_gate_markdown() -> str:
    fingerprint = policy_hash(POLICY_PATH.read_text(encoding="utf-8"))[:12]
    return (
        f"> **Policy gate `{POLICY_ID}@{POLICY_VERSION}` (`sha256:{fingerprint}`):** The policy digest below is binding as written. "
        "Before implementation or live execution, read [the full shared Sinch policy](references/shared-policy.md) once per conversation — "
        "skip it if this exact ID/version/fingerprint is already loaded; read it if the version is newer or the fingerprint differs. "
        "This skill's canonical operation routes live in its Agent Instructions and Links sections."
    )


def policy_digest_markdown() -> str:
    match = DIGEST_SOURCE_PATTERN.search(POLICY_PATH.read_text(encoding="utf-8"))
    if not match:
        raise ValueError(f"digest markers not found in {POLICY_PATH}")
    rules = match.group(1).strip()
    return (
        "<!-- sinch-policy-digest: start (generated; edit docs/SINCH_SHARED_POLICY.md and run scripts/sync_sinch_skill_references.py) -->\n"
        "**Sinch policy digest (binding):**\n\n"
        f"{rules}\n"
        "<!-- sinch-policy-digest: end -->"
    )


def policy_payload(source: str) -> str:
    return CATALOG_ONLY_PATTERN.sub("", source).rstrip() + "\n"


def policy_hash(source: str) -> str:
    return hashlib.sha256(policy_payload(source).encode("utf-8")).hexdigest()


def local_policy(source: str) -> str:
    digest = policy_hash(source)
    metadata = (
        f"{GENERATED_NOTICE}\n\n"
        f"- **Policy-ID:** `{POLICY_ID}`\n"
        f"- **Policy-Version:** `{POLICY_VERSION}`\n"
        f"- **Content-SHA256:** `{digest}`"
    )
    return policy_payload(source).replace(
        "# Sinch Skill Shared Policy",
        f"# Sinch Skill Shared Policy\n\n{metadata}",
        1,
    )


def expected_files() -> dict[Path, str]:
    generated_policy = local_policy(POLICY_PATH.read_text(encoding="utf-8"))
    expected: dict[Path, str] = {}
    for skill_dir in sorted(SKILLS_ROOT.glob("sinch-*")):
        if not (skill_dir / "SKILL.md").exists():
            continue
        expected[skill_dir / "references" / "shared-policy.md"] = generated_policy
    return expected


def sync(check: bool) -> int:
    stale: list[Path] = []
    for path, content in expected_files().items():
        current = path.read_text(encoding="utf-8") if path.exists() else None
        if current == content:
            continue
        stale.append(path)
        if not check:
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text(content, encoding="utf-8")

    gate = policy_gate_markdown()
    digest = policy_digest_markdown()
    for skill_path in sorted(SKILLS_ROOT.glob("sinch-*/SKILL.md")):
        current = skill_path.read_text(encoding="utf-8")
        if len(GATE_PATTERN.findall(current)) != 1:
            raise ValueError(f"expected exactly one policy gate in {skill_path}")
        updated = GATE_PATTERN.sub(gate, current, count=1)
        digest_blocks = len(DIGEST_BLOCK_PATTERN.findall(updated))
        if digest_blocks > 1:
            raise ValueError(f"expected at most one policy digest in {skill_path}")
        if digest_blocks == 1:
            updated = DIGEST_BLOCK_PATTERN.sub(digest, updated, count=1)
        else:
            updated = updated.replace(gate, f"{gate}\n\n{digest}", 1)
        if updated == current:
            continue
        stale.append(skill_path)
        if not check:
            skill_path.write_text(updated, encoding="utf-8")

    if stale:
        action = "stale" if check else "updated"
        for path in stale:
            print(f"{action}: {path.relative_to(REPO_ROOT)}")
    else:
        print("generated references: current")
    return 1 if check and stale else 0


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true", help="fail if generated files are stale")
    args = parser.parse_args()
    return sync(check=args.check)


if __name__ == "__main__":
    sys.exit(main())
