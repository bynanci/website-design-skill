"""Validate both profile producers against the portable profile contract."""
import json
from pathlib import Path

import jsonschema

REPOSITORY = Path(__file__).resolve().parents[2]
SCHEMA = json.loads((REPOSITORY / "integrations/context-aware-ui/project-profile.schema.json").read_text())
FIXTURE = REPOSITORY / "examples/project-profile-vue"
OUTPUT = REPOSITORY / "integrations/vue-project-profile/artifacts/source-profile.json"
jsonschema.Draft202012Validator.check_schema(SCHEMA)
validator = jsonschema.Draft202012Validator(SCHEMA)
validator.validate(json.loads((FIXTURE / "expected-profile.json").read_text()))
actual = json.loads(OUTPUT.read_text())
validator.validate(actual["profile"])
expected = json.loads((FIXTURE / "expected-source-profile.json").read_text())
assert actual == expected, "Recorded source profile differs; review and regenerate its evidence."
print("Both portable project profiles conform to schema 0.1.")
