#!/usr/bin/env python3
"""Build a read-only, evidence-bearing project profile.

This first adapter slice reads static manifests and source files. It does not
execute project configuration, install dependencies, run builds, or write files.
Its token, component, and state-owner results are candidates that require review.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import re
import sys
from pathlib import Path, PurePosixPath


EXCLUDED_DIRS = {
    ".git",
    ".next",
    ".nuxt",
    ".output",
    ".turbo",
    "build",
    "coverage",
    "dist",
    "node_modules",
    "out",
    "vendor",
}
SOURCE_ROOTS = ("src", "app", "apps", "packages", "components")
SOURCE_SUFFIXES = {".css", ".js", ".jsx", ".json", ".sass", ".scss", ".ts", ".tsx", ".vue"}
MAX_SOURCE_FILES = 1200
MAX_FILE_BYTES = 1_000_000
MAX_TOKEN_RECORDS = 500
CSS_CUSTOM_PROPERTY = re.compile(r"(--[A-Za-z0-9_-]+)\s*:\s*([^;{}\n]+)")
SCSS_VARIABLE = re.compile(r"(?m)^\s*\$([A-Za-z0-9_-]+)\s*:\s*([^;]+);")
STYLE_BLOCK = re.compile(r"<style\b[^>]*>(.*?)</style\s*>", re.IGNORECASE | re.DOTALL)
STATE_PATH_WORDS = {"api", "apis", "composable", "composables", "query", "queries", "service", "services", "store", "stores"}
STACK_PACKAGES = (
    "vue",
    "vite",
    "typescript",
    "sass",
    "tailwindcss",
    "pinia",
    "vuex",
    "@tanstack/vue-query",
    "echarts",
    "d3",
)


def relative_path(path, root):
    return path.relative_to(root).as_posix()


def read_source(path, root, sources, kind):
    rel = relative_path(path, root)
    try:
        resolved = path.resolve(strict=True)
        resolved.relative_to(root)
    except (OSError, ValueError):
        sources[rel] = {
            "path": rel,
            "kind": kind,
            "status": "unsupported",
            "detail": "Symlink target is missing or outside the approved workspace root.",
        }
        return None
    try:
        raw = path.read_bytes()
    except OSError as exc:
        sources[rel] = {"path": rel, "kind": kind, "status": "unavailable", "detail": str(exc)}
        return None

    if len(raw) > MAX_FILE_BYTES:
        sources[rel] = {
            "path": rel,
            "kind": kind,
            "status": "unsupported",
            "detail": "File exceeds the configured read limit.",
        }
        return None

    digest = hashlib.sha256(raw).hexdigest()
    try:
        text = raw.decode("utf-8")
    except UnicodeDecodeError:
        sources[rel] = {
            "path": rel,
            "kind": kind,
            "status": "unsupported",
            "sha256": digest,
            "detail": "File is not UTF-8 text.",
        }
        return None

    sources[rel] = {"path": rel, "kind": kind, "status": "observed", "sha256": digest}
    return text


def source_candidates(root):
    roots = [root / name for name in SOURCE_ROOTS if (root / name).is_dir()]
    if not roots:
        roots = [root]

    found = []
    seen = set()
    safe_roots = []
    for base in roots:
        try:
            base.resolve(strict=True).relative_to(root)
        except (OSError, ValueError):
            continue
        safe_roots.append(base)
    for base in safe_roots:
        for current, dirs, filenames in os.walk(base):
            dirs[:] = sorted(
                name
                for name in dirs
                if name not in EXCLUDED_DIRS and not name.startswith(".")
            )
            for filename in sorted(filenames):
                path = Path(current) / filename
                if path.suffix.lower() not in SOURCE_SUFFIXES:
                    continue
                if path.name in {"package.json", "tsconfig.json"}:
                    continue
                if path.is_symlink():
                    continue
                resolved = path.resolve()
                try:
                    resolved.relative_to(root)
                except ValueError:
                    continue
                if resolved in seen:
                    continue
                seen.add(resolved)
                found.append(path)
                if len(found) >= MAX_SOURCE_FILES:
                    return sorted(found)
    return sorted(found)


def package_metadata(root, sources, unknowns):
    path = root / "package.json"
    if not path.is_file():
        sources["package.json"] = {
            "path": "package.json",
            "kind": "package-manifest",
            "status": "unavailable",
            "detail": "No root package.json was found.",
        }
        unknowns.append("No root package.json was found; framework and package versions are unknown.")
        return {}

    text = read_source(path, root, sources, "package-manifest")
    if text is None:
        unknowns.append("The root package.json could not be read as supported UTF-8 text.")
        return {}

    try:
        package = json.loads(text)
    except json.JSONDecodeError as exc:
        unknowns.append("The root package.json is invalid JSON: " + str(exc))
        return {}
    if not isinstance(package, dict):
        unknowns.append("The root package.json must contain a JSON object.")
        return {}
    return package


def stack_inventory(package, sources):
    all_dependencies = {}
    for field in ("dependencies", "devDependencies", "peerDependencies", "optionalDependencies"):
        values = package.get(field, {})
        if isinstance(values, dict):
            all_dependencies.update(values)

    stack = []
    for name in STACK_PACKAGES:
        if name in all_dependencies:
            stack.append(
                {
                    "name": name,
                    "version": str(all_dependencies[name]),
                    "evidencePaths": ["package.json"],
                }
            )

    if any(item["name"] == "sass" for item in stack):
        return stack
    if any(path.endswith((".scss", ".sass")) for path in sources):
        stack.append({"name": "SCSS/Sass source present", "version": None, "evidencePaths": sorted(
            path for path in sources if path.endswith((".scss", ".sass"))
        )[:5]})
    return stack


def config_files(root, sources, unknowns):
    patterns = ("vite.config.*", "tailwind.config.*", "postcss.config.*")
    for pattern in patterns:
        for path in sorted(root.glob(pattern)):
            if not path.is_file():
                continue
            kind = "static-config-candidate"
            read_source(path, root, sources, kind)
            unknowns.append(
                relative_path(path, root)
                + " was inventoried but not executed or parsed; dynamic configuration values remain unknown."
            )


def static_aliases(root, sources, unknowns, required_aliases):
    path = root / "tsconfig.json"
    aliases = []
    config_available = False
    if not path.is_file():
        sources["tsconfig.json"] = {
            "path": "tsconfig.json",
            "kind": "typescript-config",
            "status": "unavailable",
            "detail": "No root tsconfig.json was found.",
        }
        unknowns.append("No root tsconfig.json was found; aliases were not resolved.")
    else:
        text = read_source(path, root, sources, "typescript-config")
        config = {}
        if text is not None:
            try:
                config = json.loads(text)
                config_available = isinstance(config, dict)
            except json.JSONDecodeError as exc:
                unknowns.append("The root tsconfig.json is invalid JSON: " + str(exc))
        else:
            unknowns.append("The root tsconfig.json could not be read as supported UTF-8 text.")

        if config.get("extends"):
            unknowns.append("tsconfig extends another file; inherited compiler options were not resolved.")
        options = config.get("compilerOptions", {}) if isinstance(config, dict) else {}
        paths = options.get("paths", {}) if isinstance(options, dict) else {}
        base_url = options.get("baseUrl", ".") if isinstance(options, dict) else "."
        if not isinstance(base_url, str):
            unknowns.append("tsconfig baseUrl is not a static string; aliases were not resolved against it.")
            base_url = "."
        if isinstance(paths, dict):
            for name, target_values in sorted(paths.items()):
                targets = target_values if isinstance(target_values, list) else []
                normalized_targets = []
                existing_targets = 0
                target_unknown = False
                for target in targets:
                    if not isinstance(target, str):
                        continue
                    combined = PurePosixPath(base_url, target)
                    normalized = str(combined)
                    if PurePosixPath(normalized).is_absolute() or ".." in PurePosixPath(normalized).parts:
                        normalized_targets.append("<target outside workspace omitted>")
                        target_unknown = True
                        unknowns.append("Alias " + name + " has a target outside the approved workspace; it was not inspected.")
                        continue
                    normalized_targets.append(normalized)
                    probe = normalized.split("*", 1)[0].rstrip("/")
                    candidate = (root / probe).resolve()
                    try:
                        candidate.relative_to(root)
                    except ValueError:
                        target_unknown = True
                        unknowns.append("Alias " + name + " resolves outside the approved workspace; it was not inspected.")
                        continue
                    if candidate.exists():
                        existing_targets += 1
                status = "unknown" if target_unknown else ("resolved" if normalized_targets and existing_targets else "missing")
                if len(normalized_targets) > 1 and existing_targets > 1:
                    status = "unknown"
                    unknowns.append(
                        "Alias " + name + " has multiple existing targets; resolution order was not evaluated."
                    )
                aliases.append(
                    {
                        "name": name,
                        "targets": normalized_targets,
                        "status": status,
                        "evidencePaths": ["tsconfig.json"],
                    }
                )

    def alias_matches(requested, candidate):
        if requested == candidate:
            return True
        if candidate.endswith("/*") and requested.startswith(candidate[:-1]):
            return True
        if requested.endswith("/*") and candidate.startswith(requested[:-1]):
            return True
        return False

    for required in required_aliases:
        if not any(alias_matches(required, item["name"]) for item in aliases):
            aliases.append(
                {
                    "name": required,
                    "targets": [],
                    "status": "missing" if config_available else "unknown",
                    "evidencePaths": ["tsconfig.json"],
                }
            )
    return sorted(aliases, key=lambda item: item["name"])


def token_inventory(root, paths, sources, required_tokens, unknowns):
    records = {}
    for path in paths:
        if path.suffix.lower() not in {".css", ".scss", ".sass", ".vue"}:
            continue
        text = read_source(path, root, sources, "style-source")
        if text is None:
            continue
        rel = relative_path(path, root)
        blocks = STYLE_BLOCK.findall(text) if path.suffix.lower() == ".vue" else [text]
        for block in blocks:
            for match in CSS_CUSTOM_PROPERTY.finditer(block):
                name = match.group(1)
                records.setdefault(("css", name), set()).add(rel)
            for match in SCSS_VARIABLE.finditer(block):
                name = "$" + match.group(1)
                records.setdefault(("scss", name), set()).add(rel)

    tokens = []
    for (syntax_key, name), evidence in sorted(records.items()):
        syntax = "CSS custom property" if syntax_key == "css" else "SCSS variable"
        tokens.append(
            {
                "role": "unmapped:" + name,
                "reference": name,
                "syntax": syntax,
                "status": "unknown",
                "themes": [],
                "evidencePaths": sorted(evidence),
            }
        )

    existing_references = {item["reference"] for item in tokens}
    for required in required_tokens:
        if required not in existing_references:
            tokens.append(
                {
                    "role": "requested:" + required,
                    "reference": required,
                    "syntax": None,
                    "status": "missing",
                    "themes": [],
                    "evidencePaths": [],
                }
            )

    if records:
        unknowns.append(
            "Token names are static candidates only. Semantic roles, imports, theme resolution, computed values, and contrast were not verified."
        )
    else:
        unknowns.append("No supported CSS/SCSS token declarations were detected in the scanned files.")
    if len(tokens) > MAX_TOKEN_RECORDS:
        unknowns.append("Token inventory reached the configured limit of " + str(MAX_TOKEN_RECORDS) + " records.")
    return sorted(tokens, key=lambda item: (item["reference"] or "", item["role"]))[:MAX_TOKEN_RECORDS]


def component_and_owner_candidates(paths, root, sources):
    components = []
    owners = []
    for path in paths:
        rel = relative_path(path, root)
        if path.suffix.lower() == ".vue":
            text = read_source(path, root, sources, "vue-component-candidate")
            if text is None:
                continue
            components.append(
                {
                    "responsibility": "Unclassified Vue component candidate: " + path.stem,
                    "path": rel,
                    "publicApi": [],
                    "states": [],
                    "evidencePaths": [rel],
                }
            )
        path_words = {Path(part).stem.lower() for part in PurePosixPath(rel).parts}
        if path_words.intersection(STATE_PATH_WORDS):
            read_source(path, root, sources, "state-api-owner-candidate")
            owners.append(
                {
                    "name": "Unconfirmed state/API owner candidate",
                    "kind": "path-name heuristic; not confirmed",
                    "path": rel,
                    "evidencePaths": [rel],
                }
            )
    return components[:300], owners[:300]


def main():
    parser = argparse.ArgumentParser(
        description="Create a read-only project profile from static manifests and source candidates."
    )
    parser.add_argument("root", nargs="?", default=".", help="Project root to inspect.")
    parser.add_argument("--task", default="Inspect project context", help="Short description of the requested UI task.")
    parser.add_argument(
        "--affected-path",
        action="append",
        default=[],
        help="Project-relative path affected by the task. Can be repeated.",
    )
    parser.add_argument(
        "--required-alias",
        action="append",
        default=[],
        help="Alias that must be checked against static TypeScript paths. Can be repeated.",
    )
    parser.add_argument(
        "--required-token",
        action="append",
        default=[],
        help="Exact CSS/SCSS token reference to check. Can be repeated; this does not assign semantic meaning.",
    )
    args = parser.parse_args()

    root = Path(args.root).expanduser().resolve()
    if not root.is_dir():
        print("ERROR: project root is not a directory.", file=sys.stderr)
        return 2

    unknowns = []
    sources = {}
    package = package_metadata(root, sources, unknowns)
    config_files(root, sources, unknowns)
    aliases = static_aliases(root, sources, unknowns, args.required_alias)
    paths = source_candidates(root)
    if len(paths) >= MAX_SOURCE_FILES:
        unknowns.append("Source inventory reached the configured limit of " + str(MAX_SOURCE_FILES) + " files.")
    tokens = token_inventory(root, paths, sources, args.required_token, unknowns)
    components, owners = component_and_owner_candidates(paths, root, sources)
    if components:
        unknowns.append("Vue file paths are component candidates only; props, events, slots, and public APIs were not parsed.")
    if owners:
        unknowns.append("State/API owner candidates were inferred from path names only and require source review.")
    if (root / "vite.config.ts").exists() or any(root.glob("vite.config.*")):
        unknowns.append("Vite aliases were not evaluated; only static tsconfig paths were inspected.")
    unknowns = list(dict.fromkeys(unknowns))

    affected_paths = []
    for value in args.affected_path:
        candidate = PurePosixPath(value)
        if candidate.is_absolute() or ".." in candidate.parts:
            unknowns.append("An affected path was absolute or escaped the workspace and was omitted.")
            continue
        affected_paths.append(str(candidate))

    profile = {
        "profileVersion": "0.1",
        "workspace": {"id": root.name or "workspace", "root": "."},
        "task": {
            "request": args.task,
            "affectedPaths": sorted(set(affected_paths)),
        },
        "revision": {"commit": None, "dirty": None},
        "sources": sorted(sources.values(), key=lambda item: item["path"]),
        "stack": stack_inventory(package, sources),
        "aliases": aliases,
        "tokens": tokens,
        "components": components,
        "stateOwners": owners,
        "capabilities": {
            "read": "available",
            "parse": "unknown",
            "patchProposal": "unknown",
            "patchWrite": "unavailable",
            "build": "unknown",
            "render": "unavailable",
            "imageReview": "unavailable",
            "nativeShell": "unknown",
        },
        "unknowns": unknowns,
    }
    print(json.dumps(profile, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
