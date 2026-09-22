# Right Fit Roadmap

Interactive HTML/React prototype of the Right Fit Roadmap. The repository includes both the editable source and a compiled static website for GitHub Pages.

## Repository contents

- `client/index.html` — editable HTML entry point
- `client/src/pages/Home.tsx` — roadmap content and interaction logic
- `client/src/index.css` — complete visual styling and responsive layout
- `docs/index.html` — compiled HTML ready for GitHub Pages
- `docs/assets/` — compiled JavaScript and CSS used by `docs/index.html`

## Upload to GitHub

1. Create a new empty GitHub repository.
2. Upload every file and folder from this package to the repository root.
3. Commit the files to the `main` branch.
4. Open **Settings → Pages** in GitHub.
5. Under **Build and deployment**, choose **Deploy from a branch**.
6. Select the `main` branch and the `/docs` folder, then click **Save**.

GitHub will display the public website URL after deployment finishes.

## Edit locally

Install Node.js 20 or newer and pnpm, then run:

```bash
pnpm install
pnpm dev
```

Open the local URL printed by Vite.

## Rebuild after editing

```bash
pnpm check
pnpm build
```

The `pnpm build` command replaces the compiled site in `docs/`. Commit the updated `docs/` files to publish changes through GitHub Pages.

## Important prototype notes

The questionnaire recommendations are educational placeholders. Video, scheduler, questionnaire, onboarding, and resource buttons are intentionally configured as prototype interactions and should be replaced with approved live destinations and finalized compliance language.
