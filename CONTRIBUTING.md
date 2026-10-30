# Contributing to Qwik-Sonner

Thank you for considering contributing to Qwik-Sonner! This library provides toast notifications for seamless user feedback.

To contribute, please follow these guidelines:

## Getting Started

1. Fork the Qwik-Sonner repository on GitHub.
2. Clone the forked repository to your local machine.

```bash
git clone https://github.com/your-username/qwik-sonner.git
```

3. Create a new branch to work on. The branch name should briefly describe the changes you're making.

```bash
git checkout -b feature/your-change
```

## Making Changes

- If you are making general changes, describe them in the branch name.
- If you are working on the website, add "website" after the verb in the branch name.

Example:

- `feature/update-readme`
- `feature-website/add-new-feature`

### Commit Messages

For commit messages, use [Conventional Commits](https://www.conventionalcommits.org/) format. If you're making changes to the website, include the "website" scope.

### Visual Studio Code Setup

For an optimal development experience, use the extensions provided in the `.vscode` folder. Additionally, execute the Conventional Commits extension to follow the commit message conventions.

## Creating a Pull Request

1. Push your changes to your forked repository.

```bash
git push origin feature/your-change
```

2. Create a Pull Request (PR) on the original Qwik-Sonner repository.

Make sure to include:

- A descriptive title for your PR.
- Details about the changes made.
- Any relevant context or motivation.
- Mention if a package version update is needed and explain the reasons.

## Versioning

If your changes require a package version update, clearly state it in the PR. Provide reasons and justifications for the version update.

## Releases

Maintainers only. On an up-to-date `v2` (`main` once `v2` merges), `pnpm release` asks for the new
version (`2.0.0-beta.2`…), commits it, tags it and pushes. The tag runs
[`release.yml`](./.github/workflows/release.yml):

1. the CI, and a check that the tag matches the version in `package.json`;
2. it builds and packs the library, checks the package contents and **stages** it on npm through
   Trusted Publishing (a prerelease under its identifier, like `beta`; a plain version under
   `latest`);
3. it drafts a GitHub release with the changelog generated from the commits. Edit its notes while it
   waits: they are also the website's changelog for that version, and the generator only lists
   `feat`, `fix` and `perf` commits, and only marks a change as breaking when its commit has a `!` or
   a `BREAKING CHANGE:` footer.

Nothing is public until a maintainer approves the staged version with 2FA, with the repo's pnpm
(`pnpm stage`, logged in with `pnpm login`) or npm 11.15 or later (`npm stage`, same subcommands):

```sh
pnpm stage list qwik-sonner
pnpm stage approve <stage-id> # asks for the one-time password
```

The workflow waits for that (up to 6 hours), then publishes the GitHub release and deploys the
website, which reads the new version from npm. If the approval takes longer, publish the draft
release by hand and run the Website workflow (Actions → Website → Run workflow). To drop a staged
version, `pnpm stage reject <stage-id>` and delete the draft release.

Staging needs the npm Trusted Publisher of `qwik-sonner` (GitHub Actions, `release.yml`) to allow
`npm stage publish`. Keep the workflow's file name: the Trusted Publisher is tied to it.

## Website

The docs site lives in `website/` and consumes the library through `workspace:*`, so build the
library first. `pnpm build.website` (from the root) builds the library and the site exactly as
Vercel does. Production deploys from GitHub Actions after each release, or when a push to `v2`
changes `website/`; a branch that changes the website gets a preview from Vercel. See
[website/README.md](./website/README.md).

Thank you for your contribution! 🚀
