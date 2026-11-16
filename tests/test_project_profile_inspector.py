"""Regression tests for the read-only project-profile inspector."""

import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path


SCRIPT = Path(__file__).resolve().parents[1] / "scripts" / "inspect_project_profile.py"


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
