# Gotchas (Important Notes)

> ### 📚 Documentation Hub
> - 📘 **GitHub Actions Core Guide**: [Readme.md](Readme.md)
> - 🚀 **DevOps Demo Architecture & Setup**: [architecture.md](architecture.md)
> - 🌿 **Git & Branching Workflow**: [GIT.md](GIT.md)
> - 🛡️ **DevSecOps Architecture & Policy**: [SECURITY.md](SECURITY.md)
> - ⚠️ **Gotchas & Critical Notes**: [note.md](note.md)
> - 🏗️ **Real-World Pipeline Blueprint**: [real-world-proj.md](real-world-proj.md)

---

1. Jobs don't share files. Use artifacts, outputs, or put the steps in one job.
2. Quote: versions (`"3.10"`), cron (`"*/15 * * * *"`), globs (`"*.md"`, `"!docs/**"`).
3. `if: !x` is a YAML error. Write `if: ${{ !x }}`.
4. `${{ }}` in `run:` is text substitution before the shell runs. Pass untrusted values through env:.
5. `github.event.inputs.*` are strings. Use `inputs.*` for real types.
6. `fail-fast: true` hides other failures. Set `false` when you want the full picture.
7. Matrix jobs have unstable names. Require one gate job in branch protection.
8. `paths` filters + required checks can leave checks pending forever.
9. Reusable workflows can't elevate permissions, and don't inherit the caller's env:.
10. `secrets: inherit` gives a callee everything. Prefer explicit secrets.
11. Default job timeout is 6 hours. Always set `timeout-minutes`.
12. No `pipefail` by default in `run:`. Use `shell: bash`.
13. `-latest` runner labels change under you. Pin if reproducibility matters.
14. Unpinned actions can change without warning. Pin SHAs for third-party actions.
15. Local composite actions need `checkout` first, because the action file lives in the repo.
16. Anchors: basic `&/*` only, one file, no `<<`.
17. Scheduled workflows use the default branch's file and may be late.
18. Don't print secrets, even "just to debug". Masking isn't perfect.

# check:

```bash
# check syntax
actionlint && echo clean

# run workflow manually
gh workflow run ci.yml && gh run watch

```
