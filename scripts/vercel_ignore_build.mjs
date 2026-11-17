/** Vercel exits 0 to skip, 1 to build. Uncertain evidence always builds. */
import { execFileSync } from 'node:child_process';

const sha = /^[a-f0-9]{40}$/i;
const git = args => execFileSync('git', args, {
  encoding: 'utf8', timeout: 10_000, maxBuffer: 1_000_000,
  stdio: ['ignore', 'pipe', 'pipe'],
});
let skip = false;
let reason = 'No verified previous deployment; build required.';
try {
  const previous = process.env.VERCEL_GIT_PREVIOUS_SHA ?? '';
  const requested = process.env.VERCEL_GIT_COMMIT_SHA ?? '';
  const current = git(['rev-parse', '--verify', 'HEAD']).trim();
  if (!sha.test(current) || !sha.test(previous)
      || (requested && (!sha.test(requested) || requested.toLowerCase() !== current.toLowerCase()))) {
    reason = 'Missing or inconsistent exact revisions; build required.';
  } else {
    // A shallow clone may lack the old object. Never treat that as no changes.
    git(['cat-file', '-e', `${previous}^{commit}`]);
    const changed = git(['diff', '--no-ext-diff', '--no-textconv', '--name-only', '-z', previous, current, '--',
      'site', 'vercel.json', '.gitattributes', 'scripts/vercel_ignore_build.mjs',
      'examples']);
    skip = changed.length === 0;
    reason = skip
      ? 'Verified deployment inputs unchanged; skip build.'
      : 'Deployment inputs changed; build required.';
  }
} catch {
  reason = 'Git comparison unavailable; build required.';
}
console.log(reason);
process.exitCode = skip ? 0 : 1;
