# meetshahryar.com

The portfolio of Shahryar, DevOps & Cloud Engineer. Static Astro 7 site with Tailwind CSS 4 and TypeScript.

- Design spec (tokens, type, layouts, decisions): [docs/design-plan.md](docs/design-plan.md)
- Original brief: [docs/brief.md](docs/brief.md)

## Run it locally (PowerShell)

You need Node 22.23.4 or newer. The repo pins 24.22.2 in `.nvmrc`.

```powershell
nvm install 24.22.2     # once
nvm use 24.22.2         # nvm-windows switches the machine-wide version; may need an admin terminal
npm ci

npm run dev             # http://localhost:4321
```

| Command           | What it does                             |
| ----------------- | ---------------------------------------- |
| `npm run dev`     | Dev server with hot reload               |
| `npm run build`   | Builds the static site into `dist/`      |
| `npm run preview` | Serves `dist/` locally                   |
| `npm run check`   | Type-checks `.astro` and `.ts` files     |
| `npm run lint`    | ESLint, including accessibility rules    |
| `npm run format`  | Formats everything with Prettier         |
| `npm run todos`   | Lists every placeholder still to fill in |

## Content

Everything on the site comes from `src/content/`. Adding a project, job or certification never means touching layout code. `src/content.config.ts` validates every file at build time, so a typo fails the build and names the file and field.

**Placeholders.** Any `"[text in square brackets]"` inside double quotes is a TODO. It shows on the site with a dashed outline, and `npm run todos` lists every one with its file and line.

**Categories.** The six areas live in [src/lib/categories.ts](src/lib/categories.ts): `cloud`, `security`, `ai`, `data`, `web`, `automation`. Hero nodes, services, work filters and project tags all use these ids.

**Order.** Lists show entries by their `order` field, lowest first. Astro sorts data files by id, so file position doesn't count.

### Your photo

Save it as `src/assets/me.png` (or `.jpg` / `.webp`), not in `public/`, so Astro can resize it and serve AVIF/WebP. Use a 4:5 PNG with a transparent background (the oval portrait); it's shown whole in About. The hero uses `src/assets/shahryar-brush-dark.png` (1000×860, you on a dark brush stroke); `shahryar-brush-light.png` is a copy with lighter paint for the dark theme, where the original paint matches the page. If you replace it, keep the 1000×860 ratio.

### Add a featured project (gets a case study)

1. Create `src/content/projects/<slug>.mdx`. The file name becomes the URL, `/work/<slug>/`.
2. Copy the frontmatter of an existing project and replace the values.
   - `categories`: one or more category ids.
   - `order`: position in the work index.
   - `results`: real numbers only.
3. Optional cover: save it as `src/assets/projects/<slug>.jpg`, then add `cover: ../../assets/projects/<slug>.jpg` and `coverAlt: <description>`.
4. Confidential work: set `confidential: true` and a generic `client`, such as "Confidential retail client".

### Add a smaller project

Add an entry to `src/content/more-work.yaml`. These are shown as expanding panels under "More work", without a case study. Each one needs a `group` (which row), a `kind` (the short label after its number), an `icon` and optionally a `stack`; the ids are in `src/lib/more-work.ts`. A "View project" button appears once `url` is a real link.

### Add a job

Add an entry to `src/content/experience.yaml`. `order: 1` is the newest role, and the others shift down.

```yaml
- id: acme
  order: 1
  company: Acme
  role: DevOps Engineer
  start: 2024-03
  end: present
  location: Remote
  highlights:
    - Cut deploy time from 40 minutes to 6 by moving builds to CodeBuild
  stack: [AWS, Terraform]
```

### Add a certification

Add an entry to `src/content/certifications.yaml`. Put the official badge in `src/assets/badges/` and reference it relative to the YAML file, for example `badge: ../assets/badges/aws-saa.png`.

### Testimonials and writing

Both sections stay hidden until they have content.

- **Testimonials:** add real ones to `src/content/testimonials.yaml`.
- **Writing:** add MDX notes to `src/content/writing/`.

## Deploy

Not set up yet. Phase 6 adds Terraform for S3, CloudFront, ACM and Route 53, and a GitHub Actions pipeline using OIDC.

$env:Path = "C:\Users\lenovo\AppData\Local\nvm\v24.22.2;" + $env:Path
npm run dev
