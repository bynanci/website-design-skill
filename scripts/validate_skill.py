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
    "evals/ia-audit/case-001/input.md",
    "evals/ia-audit/case-001/expected.md",
]

CORE_SPECIFIC_PRODUCT_NAMES = [
    "Codex",
    "Claude",
    "Figma",
    "Cursor",
    "React",
    "Vue",
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


def main() -> None:
    validate_required_paths()
    skill = (ROOT / "SKILL.md").read_text(encoding="utf-8")
    validate_frontmatter(skill)
    validate_local_references(skill)
    validate_platform_agnostic_core(skill)
    validate_license_readme()
    print("Skill validation passed.")


if __name__ == "__main__":
    main()
