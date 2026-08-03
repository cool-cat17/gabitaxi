/**
 * Publish dist/ to the gh-pages branch.
 *
 * dist/ is gitignored in the source branch, so this makes a throwaway repo inside
 * it and force-pushes that single commit to gh-pages. The branch only ever holds
 * the current build — no history to prune.
 *
 * Usage: npm run deploy   (runs the production build first)
 */
import { execFileSync } from 'node:child_process'
import { existsSync, rmSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const dist = path.join(root, 'dist')

if (!existsSync(path.join(dist, 'index.html'))) {
  console.error('dist/index.html is missing — run `npm run build` first.')
  process.exit(1)
}

const git = (args, cwd = dist) => execFileSync('git', args, { cwd, stdio: 'inherit' })
const gitOut = (args, cwd = root) => execFileSync('git', args, { cwd, encoding: 'utf8' }).trim()

const remote = gitOut(['remote', 'get-url', 'origin'])
const sha = gitOut(['rev-parse', '--short', 'HEAD'])

// Tell GitHub Pages not to run the output through Jekyll.
writeFileSync(path.join(dist, '.nojekyll'), '')

// Fresh throwaway repo each time, so reruns can't inherit stale state.
rmSync(path.join(dist, '.git'), { recursive: true, force: true })

git(['init', '-q'])
git(['checkout', '-q', '-B', 'gh-pages'])
git(['add', '-A'])
git(['-c', 'user.name=deploy', '-c', 'user.email=deploy@local', 'commit', '-q', '-m', `deploy ${sha}`])
git(['push', '-q', '--force', remote, 'gh-pages'])

rmSync(path.join(dist, '.git'), { recursive: true, force: true })

console.log(`\nDeployed ${sha} to gh-pages.`)
console.log('Live at https://cool-cat17.github.io/gabitaxi/ (allow a minute on the first deploy).')
