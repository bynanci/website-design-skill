"""Regression tests for the read-only project-profile inspector."""

import json
import shutil
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path


SCRIPT = Path(__file__).resolve().parents[1] / "scripts" / "inspect_project_profile.py"
FIXTURE_ROOT = Path(__file__).resolve().parents[1] / "examples" / "project-profile-vue"
FIXTURE_PROFILE = FIXTURE_ROOT / "expected-profile.json"
FIXTURE_ARGUMENTS = (
    "--task",
    "Inspect the dashboard status banner",
    "--affected-path",
    "src/components/StatusBanner.vue",
    "--required-alias",
    "@/components",
    "--required-alias",
    "@missing",
    "--required-token=--color-warning",
    "--required-token=--color-destructive",
    "--required-token=--missing-token",
)


def run_inspector(root, *arguments):
    return subprocess.run(
        [sys.executable, str(SCRIPT), str(root), *arguments],
        check=False,
        capture_output=True,
        text=True,
    )


class ProjectProfileInspectorTests(unittest.TestCase):
    def setUp(self):
        temporary = tempfile.TemporaryDirectory()
        self.addCleanup(temporary.cleanup)
        self.root = Path(temporary.name)
        (self.root / "package.json").write_text(
            '{"dependencies":{"vue":"^3"}}', encoding="utf-8"
        )
        source = self.root / "src" / "components"
        source.mkdir(parents=True)
        (source / "Card.vue").write_text(
            "<template><div /></template>\n"
            "<style>:root { --color-warning: #c90; }</style>\n",
            encoding="utf-8",
        )

    def profile(self, *arguments):
        result = run_inspector(self.root, *arguments)
        self.assertEqual(result.returncode, 0, result.stderr)
        return json.loads(result.stdout)

    def test_reads_jsonc_and_classifies_aliases(self):
        (self.root / "tsconfig.json").write_text(
            """
{
  // TypeScript accepts comments and trailing commas.
  /* Block comments are valid too. */
  "compilerOptions": {
    "baseUrl": ".",
    "explanation": "https://example.test",
    "paths": {
      "@/*": ["src/*"], // comments can contain URL text: "https://example.test"
    },
  },
}
""",
            encoding="utf-8",
        )

        profile = self.profile(
            "--required-alias",
            "@missing",
            "--required-token=--color-warning",
        )

        aliases = {alias["name"]: alias for alias in profile["aliases"]}
        self.assertEqual(aliases["@/*"]["status"], "resolved")
        self.assertEqual(aliases["@missing"]["status"], "missing")
        self.assertIn("--color-warning", {item["reference"] for item in profile["tokens"]})
        self.assertFalse(any("invalid JSON" in item for item in profile["unknowns"]))

    def test_inherited_alias_remains_unknown_until_base_is_inspected(self):
        (self.root / "tsconfig.json").write_text(
            '{"extends":"./base.json"}', encoding="utf-8"
        )
        (self.root / "base.json").write_text(
            '{"compilerOptions":{"paths":{"@shared/*":["src/*"]}}}',
            encoding="utf-8",
        )

        profile = self.profile("--required-alias", "@shared/components")

        self.assertEqual(profile["aliases"][0]["status"], "unknown")
        self.assertTrue(any("inherited compiler options" in item for item in profile["unknowns"]))

    def test_non_object_tsconfig_is_unknown_and_does_not_crash(self):
        (self.root / "tsconfig.json").write_text("[]", encoding="utf-8")

        profile = self.profile("--required-alias", "@missing")

        self.assertEqual(profile["aliases"][0]["status"], "unknown")
        self.assertTrue(any("JSON object" in item for item in profile["unknowns"]))

    def test_configuration_is_read_only_and_source_digest_is_recorded(self):
        config = self.root / "vite.config.js"
        config.write_text('throw new Error("must not execute");\n', encoding="utf-8")
        before = {
            path.relative_to(self.root): path.read_bytes()
            for path in self.root.rglob("*")
            if path.is_file()
        }

        profile = self.profile("--required-token=--color-warning")

        after = {
            path.relative_to(self.root): path.read_bytes()
            for path in self.root.rglob("*")
            if path.is_file()
        }
        self.assertEqual(before, after)
        config_record = next(
            source for source in profile["sources"] if source["path"] == "vite.config.js"
        )
        self.assertEqual(config_record["status"], "observed")
        self.assertEqual(len(config_record["sha256"]), 64)
        self.assertTrue(any("not executed" in item for item in profile["unknowns"]))

    def test_synthetic_vue_fixture_matches_recorded_profile(self):
        result = run_inspector(FIXTURE_ROOT, *FIXTURE_ARGUMENTS)
        self.assertEqual(result.returncode, 0, result.stderr)
        profile = json.loads(result.stdout)
        expected = json.loads(FIXTURE_PROFILE.read_text(encoding="utf-8"))

        self.assertEqual(profile, expected)
        aliases = {alias["name"]: alias for alias in profile["aliases"]}
        self.assertEqual(aliases["@/*"]["status"], "resolved")
        self.assertEqual(aliases["@missing"]["status"], "missing")
        tokens = {token["reference"]: token for token in profile["tokens"]}
        self.assertEqual(tokens["--color-warning"]["status"], "unknown")
        self.assertEqual(tokens["--color-destructive"]["status"], "unknown")
        self.assertEqual(tokens["--missing-token"]["status"], "missing")
        self.assertTrue(
            any(component["path"] == "src/components/StatusBanner.vue"
                for component in profile["components"])
        )
        self.assertTrue(
            any(owner["path"] == "src/stores/dashboard.ts"
                for owner in profile["stateOwners"])
        )

    def test_fixture_profile_refreshes_changed_source_digest(self):
        with tempfile.TemporaryDirectory() as temporary:
            copied_root = Path(temporary) / "project-profile-vue"
            shutil.copytree(FIXTURE_ROOT, copied_root)

            before_result = run_inspector(copied_root, *FIXTURE_ARGUMENTS)
            self.assertEqual(before_result.returncode, 0, before_result.stderr)
            before = json.loads(before_result.stdout)

            token_file = copied_root / "src" / "styles" / "tokens.scss"
            token_file.write_text(
                token_file.read_text(encoding="utf-8") + "\n// digest refresh probe\n",
                encoding="utf-8",
            )
            after_result = run_inspector(copied_root, *FIXTURE_ARGUMENTS)
            self.assertEqual(after_result.returncode, 0, after_result.stderr)
            after = json.loads(after_result.stdout)

        before_digests = {source["path"]: source.get("sha256") for source in before["sources"]}
        after_digests = {source["path"]: source.get("sha256") for source in after["sources"]}
        self.assertNotEqual(
            before_digests["src/styles/tokens.scss"],
            after_digests["src/styles/tokens.scss"],
        )
        self.assertEqual(
            before_digests["src/components/StatusBanner.vue"],
            after_digests["src/components/StatusBanner.vue"],
        )

    def test_external_manifest_symlink_is_not_read(self):
        with tempfile.TemporaryDirectory() as external_dir:
            external = Path(external_dir) / "package.json"
            external.write_text('{"dependencies":{"vue":"^999"}}', encoding="utf-8")
            (self.root / "package.json").unlink()
            (self.root / "package.json").symlink_to(external)

            profile = self.profile()

        record = next(source for source in profile["sources"] if source["path"] == "package.json")
        self.assertEqual(record["status"], "unsupported")
        self.assertEqual(profile["stack"], [])


if __name__ == "__main__":
    unittest.main()
