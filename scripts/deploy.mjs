/**
 * Publish dist/ to the gh-pages branch.
 *
 * Uses a git worktree so each deploy is an ordinary commit on top of the previous
 * one. An earlier version force-pushed a fresh root commit every time; GitHub Pages
 * does not reliably rebuild when the branch history is rewritten underneath it, so
 * deploys silently kept serving the old build.
 *
 * Usage: npm run deploy   (runs the production build first)
 */
import { execFileSync } from 'node:child_process'
import { cpSync, existsSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const dist = path.join(root, 'dist')
const work = path.join(root, '.deploy')

if (!existsSync(path.join(dist, 'index.html'))) {
  console.error('dist/index.html is missing — run `npm run build` first.')
  process.exit(1)
}

const git = (args, opts = {}) => execFileSync('git', args, { cwd: root, stdio: 'inherit', ...opts })
const gitOut = (args) => execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim()
const tryGit = (args) => {
  try {
    execFileSync('git', args, { cwd: root, stdio: 'ignore' })
    return true
  } catch {
    return false
  }
}

const sha = gitOut(['rev-parse', '--short', 'HEAD'])

// Start from a clean worktree every run.
if (existsSync(work)) {
  tryGit(['worktree', 'remove', work, '--force'])
  rmSync(work, { recursive: true, force: true })
}
tryGit(['worktree', 'prune'])

const hasRemoteBranch = tryGit(['fetch', 'origin', 'gh-pages']) && tryGit(['rev-parse', '--verify', 'origin/gh-pages'])

if (hasRemoteBranch) {
  git(['worktree', 'add', '-B', 'gh-pages', work, 'origin/gh-pages'])
} else {
  git(['worktree', 'add', '--detach', work])
  git(['checkout', '--orphan', 'gh-pages'], { cwd: work })
  git(['rm', '-rf', '--quiet', '.'], { cwd: work })
}

// Replace the published tree with the new build.
for (const entry of readdirSync(work)) {
  if (entry !== '.git') rmSync(path.join(work, entry), { recursive: true, force: true })
}
cpSync(dist, work, { recursive: true })
writeFileSync(path.join(work, '.nojekyll'), '') // keep Pages from running Jekyll

// A stamp that changes every run. Vite reuses content hashes, so a rebuild of
// unchanged source produces an identical tree — and with nothing to commit there
// is no push, and Pages never republishes. This guarantees a real commit.
const stamp = `${sha} ${new Date().toISOString()}\n`
writeFileSync(path.join(work, 'version.txt'), stamp)

git(['add', '-A'], { cwd: work })
git(['-c', 'user.name=deploy', '-c', 'user.email=deploy@local', 'commit', '-q', '-m', `deploy ${sha}`], { cwd: work })
git(['push', '-q', 'origin', 'gh-pages'], { cwd: work })
console.log(`\nDeployed ${sha} to gh-pages.`)

git(['worktree', 'remove', work, '--force'])

console.log('Live at https://cool-cat17.github.io/gabitaxi/ — Pages takes a minute to publish.')
