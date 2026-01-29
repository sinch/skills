# Best Practices for Writing Agent Skills

A research-backed guide to authoring effective SKILL.md files for AI coding agents. Compiled from Anthropic's official documentation, community insights, and practical experience.

---

## Core Principles

### 1. Conciseness Is Key

The context window is a shared resource. Your skill competes with the system prompt, conversation history, other skills' metadata, and the user's actual request.

**Default assumption: Claude is already very smart.** Only add context Claude doesn't already have.

Challenge each piece of information:

- "Does Claude really need this explanation?"
- "Can I assume Claude knows this?"
- "Does this paragraph justify its token cost?"

**Good** (~50 tokens):

```markdown
## Extract PDF text

Use pdfplumber for text extraction:

```python
import pdfplumber
with pdfplumber.open("file.pdf") as pdf:
    text = pdf.pages[0].extract_text()
```
```

**Bad** (~150 tokens):

```markdown
## Extract PDF text

PDF (Portable Document Format) files are a common file format that contains
text, images, and other content. To extract text from a PDF, you'll need to
use a library. There are many libraries available...
```

### 2. Progressive Disclosure

SKILL.md is a table of contents, not an encyclopedia. Show just enough to help agents decide what to do next, then reveal more details as needed.

**Three-level loading system:**

| Level | What loads | When | Token cost |
|-------|-----------|------|------------|
| Level 1: Metadata | name + description | Always (startup) | ~100 tokens |
| Level 2: SKILL.md body | Full instructions | On trigger | ~1,500-5,000 tokens |
| Level 3: Bundled resources | Scripts, references | As-needed | Unlimited |

**Pattern: High-level guide with references**

```markdown
# PDF Processing

## Quick start
[Core instructions here]

## Advanced features
**Form filling**: See [FORMS.md](FORMS.md) for complete guide
**API reference**: See [REFERENCE.md](REFERENCE.md) for all methods
**Examples**: See [EXAMPLES.md](EXAMPLES.md) for common patterns
```

Claude loads FORMS.md, REFERENCE.md, or EXAMPLES.md only when needed.

### 3. Set Appropriate Degrees of Freedom

Match specificity to task fragility:

- **High freedom** (text-based instructions): Multiple approaches are valid, decisions depend on context
- **Medium freedom** (pseudocode/parameterized scripts): A preferred pattern exists, some variation is acceptable
- **Low freedom** (exact scripts, no parameters): Operations are fragile, consistency is critical

Think of Claude as a robot exploring a path:
- **Narrow bridge with cliffs**: One safe way forward — provide exact instructions
- **Open field**: Many paths lead to success — give general direction

---

## SKILL.md Structure

### Directory Layout

```
my-skill/
├── SKILL.md              # Core prompt and instructions (required)
├── scripts/              # Executable Python/Bash scripts (optional)
├── references/           # Documentation loaded into context (optional)
└── assets/               # Templates, images, binary files (optional)
```

### Frontmatter

```yaml
---
name: processing-pdfs
description: Extracts text and tables from PDF files, fills forms, and merges documents. Use when working with PDF files or when the user mentions PDFs, forms, or document extraction.
---
```

**Name rules:**
- Max 64 characters
- Lowercase letters, numbers, and hyphens only
- Use gerund form (verb + -ing): `processing-pdfs`, `analyzing-spreadsheets`, `testing-code`
- Avoid vague names: `helper`, `utils`, `tools`
- No reserved words: `anthropic`, `claude`

**Description rules:**
- Max 1024 characters, non-empty
- Always write in **third person** (the description is injected into the system prompt)
  - Good: "Processes Excel files and generates reports"
  - Bad: "I can help you process Excel files"
  - Bad: "You can use this to process Excel files"
- Include **what** the skill does AND **when** to use it
- Be specific and include key terms — Claude uses this to choose from 100+ available skills

### Body Sections

Recommended structure:

1. **Overview** — What the product does and when to use it (2-3 sentences)
2. **Getting Started** — Authentication, SDK install, first API call
3. **Key Concepts** — Domain model and terminology
4. **Common Patterns** — Frequent use cases with code snippets
5. **Gotchas & Best Practices** — Non-obvious pitfalls, rate limits, quirks
6. **Links** — Documentation, API reference, dashboard

Keep the body under **500 lines**. Move detailed content to separate files.

---

## Writing Effective Content

### Focus on Procedures, Not Documentation

The body is a procedure, not a wiki. Focus on checklists and success criteria. If you have long reference docs, keep them in separate files and link to them.

### Use Consistent Terminology

Pick one term and stick with it:

- Always "API endpoint" (not mixing "URL", "API route", "path")
- Always "field" (not mixing "box", "element", "control")
- Always "extract" (not mixing "pull", "get", "retrieve")

### Avoid Time-Sensitive Information

```markdown
## Bad
If you're doing this before August 2025, use the old API.

## Good
## Current method
Use the v2 API endpoint: `api.example.com/v2/messages`

## Old patterns
<details>
<summary>Legacy v1 API (deprecated 2025-08)</summary>
The v1 API used: `api.example.com/v1/messages`
</details>
```

### Provide a Default, Not a Menu

```markdown
## Bad (confusing)
You can use pypdf, or pdfplumber, or PyMuPDF, or pdf2image, or...

## Good (clear default with escape hatch)
Use pdfplumber for text extraction.
For scanned PDFs requiring OCR, use pdf2image with pytesseract instead.
```

### Use Examples Over Explanations

Input/output pairs communicate expectations better than prose:

````markdown
## Commit message format

**Example 1:**
Input: Added user authentication with JWT tokens
Output:
```
feat(auth): implement JWT-based authentication

Add login endpoint and token validation middleware
```
````

---

## Progressive Disclosure Patterns

### Pattern 1: Domain-Specific Organization

```
bigquery-skill/
├── SKILL.md (overview and navigation)
└── reference/
    ├── finance.md (revenue, billing metrics)
    ├── sales.md (opportunities, pipeline)
    └── product.md (usage analytics)
```

When the user asks about revenue, Claude reads only `reference/finance.md`. Other files consume zero context tokens.

### Pattern 2: Conditional Details

```markdown
## Creating documents
Use docx-js for new documents. See [DOCX-JS.md](DOCX-JS.md).

## Editing documents
For simple edits, modify the XML directly.
**For tracked changes**: See [REDLINING.md](REDLINING.md)
```

### Keep References One Level Deep

All reference files should link directly from SKILL.md. Avoid deeply nested references — Claude may partially read files that are referenced from other referenced files.

```markdown
## Bad (too deep)
SKILL.md → advanced.md → details.md → actual info

## Good (one level)
SKILL.md → advanced.md
SKILL.md → reference.md
SKILL.md → examples.md
```

### Add Table of Contents to Long Reference Files

For files over 100 lines, include a TOC at the top so Claude can see the full scope even when previewing with partial reads.

---

## Workflows and Feedback Loops

### Use Checklists for Complex Tasks

```markdown
## Form filling workflow

Copy this checklist and track your progress:

- [ ] Step 1: Analyze the form (run analyze_form.py)
- [ ] Step 2: Create field mapping (edit fields.json)
- [ ] Step 3: Validate mapping (run validate_fields.py)
- [ ] Step 4: Fill the form (run fill_form.py)
- [ ] Step 5: Verify output (run verify_output.py)
```

### Implement Feedback Loops

The pattern **run validator → fix errors → repeat** greatly improves output quality.

```markdown
1. Make edits to document.xml
2. Validate immediately: `python scripts/validate.py unpacked_dir/`
3. If validation fails: fix issues, run validation again
4. Only proceed when validation passes
5. Rebuild the document
```

---

## Executable Scripts

### Solve, Don't Punt

Scripts should handle errors explicitly rather than failing and expecting Claude to figure it out.

```python
# Good: handles the error
def process_file(path):
    try:
        with open(path) as f:
            return f.read()
    except FileNotFoundError:
        print(f"File {path} not found, creating default")
        with open(path, 'w') as f:
            f.write('')
        return ''

# Bad: punts to Claude
def process_file(path):
    return open(path).read()
```

### No Magic Numbers

```python
# Good: self-documenting
REQUEST_TIMEOUT = 30  # HTTP requests typically complete within 30 seconds
MAX_RETRIES = 3       # Most intermittent failures resolve by the second retry

# Bad: voodoo constants
TIMEOUT = 47  # Why 47?
RETRIES = 5   # Why 5?
```

### Make Execution Intent Clear

Distinguish whether Claude should **run** or **read** a script:

- "Run `analyze_form.py` to extract fields" → execute
- "See `analyze_form.py` for the extraction algorithm" → read as reference

---

## Evaluation and Iteration

### Build Evaluations First

Create evaluations BEFORE writing extensive documentation:

1. **Identify gaps**: Run Claude on representative tasks without a skill. Document specific failures
2. **Create evaluations**: Build 3+ scenarios that test these gaps
3. **Establish baseline**: Measure Claude's performance without the skill
4. **Write minimal instructions**: Just enough content to address the gaps
5. **Iterate**: Execute evaluations, compare against baseline, refine

### Develop Iteratively with Claude

1. Complete a task with Claude A using normal prompting — notice what context you repeatedly provide
2. Ask Claude A to create a skill capturing the reusable pattern
3. Review for conciseness — remove unnecessary explanations
4. Test with Claude B (fresh instance with skill loaded) on similar tasks
5. Observe behavior and bring insights back to Claude A for refinement
6. Repeat the observe-refine-test cycle

### Watch How Claude Uses Your Skill

- **Unexpected exploration paths**: Structure may not be as intuitive as you thought
- **Missed connections**: Links need to be more explicit or prominent
- **Overreliance on certain sections**: Consider moving that content into SKILL.md
- **Ignored content**: May be unnecessary or poorly signaled

---

## Anti-Patterns to Avoid

| Anti-Pattern | Why It's Bad |
|---|---|
| Explaining what Claude already knows | Wastes context tokens |
| Windows-style paths (`scripts\helper.py`) | Breaks on Unix systems; always use forward slashes |
| Offering too many library options | Confuses rather than guides; provide a default |
| Deeply nested file references | Claude may only partially read nested files |
| Time-sensitive instructions | Will silently become wrong |
| Vague frontmatter description | Claude won't discover the skill when it's needed |
| First/second person in description | Causes discovery problems in system prompt injection |
| Over 500 lines in SKILL.md | Bloats context; split into reference files |
| Including sensitive credentials | Security risk; use placeholders |
| Adding README, CHANGELOG, etc. | Only SKILL.md and supporting resources belong in a skill |

---

## Checklist for Effective Skills

### Core Quality
- [ ] Description is specific, third-person, and includes key trigger terms
- [ ] Description includes both what the skill does and when to use it
- [ ] SKILL.md body is under 500 lines
- [ ] Additional details in separate files (if needed)
- [ ] No time-sensitive information
- [ ] Consistent terminology throughout
- [ ] Examples are concrete, not abstract
- [ ] File references are one level deep
- [ ] Progressive disclosure used appropriately
- [ ] Workflows have clear steps

### Code and Scripts
- [ ] Scripts solve problems rather than punt to Claude
- [ ] Error handling is explicit and helpful
- [ ] No magic numbers (all values justified)
- [ ] Required packages listed and verified
- [ ] All file paths use forward slashes
- [ ] Validation/verification steps for critical operations
- [ ] Feedback loops included for quality-critical tasks

### Testing
- [ ] At least three evaluation scenarios created
- [ ] Tested with real usage scenarios
- [ ] Iterated based on observed agent behavior
- [ ] Team feedback incorporated (if applicable)

---

## Sources

- [Skill Authoring Best Practices — Anthropic Official Docs](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices)
- [Extend Claude with Skills — Claude Code Docs](https://code.claude.com/docs/en/skills)
- [What Are Agent Skills? — Jeff Bailey](https://jeffbailey.us/blog/2026/01/24/what-are-agent-skills/)
- [Claude Agent Skills: A First Principles Deep Dive — Lee Han Chung](https://leehanchung.github.io/blogs/2025/10/26/claude-skills-deep-dive/)
- [How to Write a Good Spec for AI Agents — Addy Osmani](https://addyosmani.com/blog/good-spec/)
- [Equipping Agents for the Real World — Anthropic Engineering](https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills)
- [Agent Skills vs. Rules vs. Commands — Builder.io](https://www.builder.io/blog/agent-skills-rules-commands)
- [Skills Format Specification — Standards Repository](https://williamzujkowski.github.io/standards/guides/SKILL_FORMAT_SPEC/)
