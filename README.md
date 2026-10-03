# Jaydeep Chaudhary — Portfolio

Personal portfolio of **Jaydeep Chaudhary, Manual & Automation QA Engineer / SDET**.
Live at **https://jaydeepchaudharyqa.github.io/portfolio/**

Built with plain HTML, modern CSS and a little vanilla JavaScript. GitHub Pages
turns it into a static site with **Jekyll** automatically: no build step and
no frameworks.

---

## Updating content (no HTML needed)

All content lives in `_data/`. Edit the YAML file, commit, push, and GitHub
rebuilds the site in about a minute.

| What you want to change               | File                     |
|---------------------------------------|--------------------------|
| Name, tagline, email, socials, hero terminal lines, stats, About text | `_data/profile.yml` |
| "How I test" process steps            | `_data/process.yml`      |
| Jobs (newest first)                   | `_data/experience.yml`   |
| Projects, featured case study, filter buttons | `_data/projects.yml` |
| Skill groups, testing types, process, "learning now" | `_data/skills.yml` |
| Degrees and certifications            | `_data/education.yml`    |
| Page title, SEO description, contact form settings | `_config.yml` |

### Add a project

Copy an existing block in `_data/projects.yml` and edit it:

```yaml
  - title: My Playwright Framework
    type: Freelance            # or Professional
    org: Personal project
    category: Automation · Open source
    tags: [automation]         # must match a filter id at the top of the file
    summary: >-
      One or two sentences about what the product is.
    contribution: >-
      What you did on it.
    testing: [E2E, API, Regression]
    tools: [Playwright, TypeScript, GitHub Actions]
    links:
      - { label: GitHub,    url: "https://github.com/JaydeepChaudharyQA/repo", kind: repo }
      - { label: Live site, url: "https://example.com", kind: live }
```

Cards show the first 5 `testing` items plus a "+N" tag for the rest, so put the most important ones first.
Link `kind` sets the icon: `live` (globe), `app` (Play Store), `repo` (GitHub), `info`.
Set `featured: true` on one project to show it as the large case study at the top.

### Add a job

Add a block at the **top** of `_data/experience.yml`, and remove `current: true`
from the previous job. Bullets under `highlights` are always shown; bullets
under `more` sit behind a "Show more" button.

### Replace the resume

Put the new PDF in `assets/resume/`. If the file name changes, update `resume:`
in `_data/profile.yml`.

### Change the photo

Replace `assets/img/jaydeep-chaudhary.webp` and `.jpg` with a portrait image,
ideally 720 × 900 (4:5).

### Logo and images

- `assets/img/logo.webp` / `.png`: the JC logo for light mode (original colours).
- `assets/img/logo-dark.webp` / `.png`: the same logo with lighter grey and blue, for dark mode.
- `assets/img/favicon.png`, `apple-touch-icon.png`, `logo-mark*.png`: the magnifier mark on its own.
- `assets/img/qa-illustration.svg`: the illustration in the About section (path set by `illustration:` in `_data/profile.yml`; delete that line to hide it).

### Contact form

The form is on and uses **FormSubmit** (free, no account). Messages go to the
email in `_data/profile.yml`.

**One-time activation:** the first time someone sends a message from the live
site, FormSubmit emails you an activation link. Click it once, and every
message after that arrives in your inbox. Send yourself a test message right
after publishing to get this done.

To switch to Formspree instead, set `provider: formspree` and `formspree_id`
in `_config.yml`. Set `provider: none` to hide the form.

---

## Preview locally (optional)

You don't need Ruby. A small Node script renders the same templates:

```bash
npm install
npm run preview
```

Then open http://localhost:4000/portfolio/ and refresh the page after each edit.

---

## Deploying

The repo deploys from **Settings → Pages → Deploy from a branch → `main` / `(root)`**.
Every push to `main` updates the site.

If you rename the repo to `jaydeepchaudharyqa.github.io` (so the site lives at
the root URL), set `baseurl: ""` in `_config.yml`.

## Project structure

```
_config.yml            site settings (title, URL, SEO, form)
_data/                 ← all content lives here
_includes/sections/    one file per page section
_includes/icon.html    inline SVG icon set
_layouts/default.html  page shell
assets/css/main.css    all styles (design tokens at the top)
assets/js/main.js      menu, theme toggle, filters, animations
assets/img/            photo, favicon, social preview image
assets/resume/         resume PDF
scripts/preview.mjs    local preview (not deployed)
```

Colours, fonts and spacing are CSS variables at the top of `main.css`.
Change `--accent` to re-theme the whole site.
