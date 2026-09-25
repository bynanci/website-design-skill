#!/usr/bin/env python3

from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parents[1]

REQUIRED_PATHS = [
    "SKILL.md",
    "README.md",
    "LICENSE",
    "CONTRIBUTING.md",
    "CHANGELOG.md",
    "references/workflow.md",
    "references/information-architecture.md",
    "references/component-architecture.md",
    "templates/project-context.md",
    "templates/page-spec.md",
    "templates/navigation-comparison.md",
    "templates/content-coverage.md",
    "templates/component-contract.md",
    "examples/saas-analytics/input/current-sitemap.md",
    "examples/saas-analytics/output/navigation-comparison.md",
    "examples/saas-analytics/output/homepage-spec.md",
    "examples/end-to-end-b2b/input/project-context.md",
    "examples/end-to-end-b2b/input/current-site.md",
    "examples/end-to-end-b2b/input/component-inventory.md",
    "examples/end-to-end-b2b/output/site-audit.md",
    "examples/end-to-end-b2b/output/navigation.md",
    "examples/end-to-end-b2b/output/homepage-spec.md",
    "examples/end-to-end-b2b/output/component-mapping.md",
    "examples/end-to-end-b2b/output/implementation-plan.md",
    "examples/end-to-end-b2b/output/validation.md",
    "evals/ia-audit/case-001/input.md",
    "evals/ia-audit/case-001/expected.md",
    "evals/component-reuse/case-001/input.md",
    "evals/component-reuse/case-001/expected.md",
]

CORE_SPECIFIC_PRODUCT_NAMES = [
    "Codex",
    "Claude",
    "Figma",
    "Cursor",
    "React",
    "Vue",
]

END_TO_END_CHAIN = [
    "input/project-context.md",
    "input/current-site.md",
    "input/component-inventory.md",
    "output/site-audit.md",
    "output/navigation.md",
    "output/homepage-spec.md",
    "output/component-mapping.md",
    "output/implementation-plan.md",
    "output/validation.md",
]


def fail(message: str) -> None:
    print(f"ERROR: {message}")
    sys.exit(1)


def validate_required_paths() -> None:
    missing = [path for path in REQUIRED_PATHS if not (ROOT / path).exists()]
    if missing:
        fail("Missing required paths:\n- " + "\n- ".join(missing))


def validate_frontmatter(skill: str) -> None:
    if not skill.startswith("---\n"):
        fail("SKILL.md must start with YAML frontmatter.")

    parts = skill.split("---", 2)
    if len(parts) < 3:
        fail("SKILL.md frontmatter is not closed.")

    frontmatter = parts[1]
    if not re.search(r"(?m)^name:\s*\S+", frontmatter):
        fail("SKILL.md frontmatter must contain a non-empty name.")
    if not re.search(r"(?m)^description:\s*>?", frontmatter):
        fail("SKILL.md frontmatter must contain description.")


def validate_local_references(skill: str) -> None:
    refs = re.findall(
        r"`((?:references|templates)/[A-Za-z0-9_./-]+\.md)`",
        skill,
    )
    missing = sorted({ref for ref in refs if not (ROOT / ref).exists()})
    if missing:
        fail("SKILL.md references missing files:\n- " + "\n- ".join(missing))


def validate_platform_agnostic_core(skill: str) -> None:
    found = [name for name in CORE_SPECIFIC_PRODUCT_NAMES if name in skill]
    if found:
        fail(
            "SKILL.md core contains platform/tool-specific product names: "
            + ", ".join(found)
        )


def validate_license_readme() -> None:
    readme = (ROOT / "README.md").read_text(encoding="utf-8")
    license_text = (ROOT / "LICENSE").read_text(encoding="utf-8")
    if "MIT License" in license_text and "MIT" not in readme:
        fail("README license label is not aligned with LICENSE.")


def validate_eval_cases() -> None:
    eval_root = ROOT / "evals"
    case_dirs = sorted(path for path in eval_root.glob("*/case-*") if path.is_dir())
    if not case_dirs:
        fail("No evaluation cases found under evals/*/case-*.")

    errors = []
    for case_dir in case_dirs:
        for filename in ("input.md", "expected.md"):
            if not (case_dir / filename).exists():
                errors.append(str((case_dir / filename).relative_to(ROOT)))

    if errors:
        fail("Incomplete evaluation cases:\n- " + "\n- ".join(errors))


def validate_end_to_end_example() -> None:
    base = ROOT / "examples" / "end-to-end-b2b"
    missing = [path for path in END_TO_END_CHAIN if not (base / path).exists()]
    if missing:
        fail(
            "End-to-end example is incomplete:\n- "
            + "\n- ".join(f"examples/end-to-end-b2b/{path}" for path in missing)
        )

    validation = (base / "output" / "validation.md").read_text(encoding="utf-8")
    required_sections = [
        "## Evidence integrity",
        "## Information architecture",
        "## Content coverage",
        "## Component architecture",
        "## Implementation readiness",
    ]
    absent_sections = [section for section in required_sections if section not in validation]
    if absent_sections:
        fail(
            "End-to-end validation artifact is missing sections:\n- "
            + "\n- ".join(absent_sections)
        )


def main() -> None:
    validate_required_paths()
    skill = (ROOT / "SKILL.md").read_text(encoding="utf-8")
    validate_frontmatter(skill)
    validate_local_references(skill)
    validate_platform_agnostic_core(skill)
    validate_license_readme()
    validate_eval_cases()
    validate_end_to_end_example()
    print("Skill validation passed.")


if __name__ == "__main__":
    main()
