# Build my personal portfolio website

You are a senior front-end engineer and motion designer. Build a hand-crafted personal portfolio for me, Shahryar [surname]. I'm a DevOps and Cloud Engineer who also builds AI agents (RAG), data analysis, web and automation solutions. The site must look like a person with a point of view designed it, not like an AI or template site. Read the whole brief before starting, then follow the phases in section 14.

## 1. Goal and audience
- Two audiences: hiring managers/recruiters, and businesses looking for a freelance or contract engineer (target regions: [e.g. UK, UAE, remote worldwide]).
- Within 10 seconds a visitor should know what I do and see proof of it. From there, downloading my CV, emailing me or booking a call should each take one click.
- Availability is a data field: [e.g. "Open to new roles" / "Taking freelance projects"].

## 2. Tech stack
- Astro (latest stable, static output). Pages are HTML + Tailwind; all content lives in data files.
- Tailwind CSS v4 through the Vite plugin, design tokens in `@theme`. Never use the Tailwind CDN script in production.
- TypeScript and vanilla JS for interactions. No React unless a component truly needs it.
- GSAP 3 with ScrollTrigger, SplitText and Flip (all free). Lenis for smooth scroll, synced to ScrollTrigger through `gsap.ticker`.
- Astro view transitions for page morphs. Re-initialise GSAP/Lenis on `astro:page-load` and kill ScrollTriggers before each swap, or animations break after navigation.
- Astro `<Image />`/`<Picture />` for AVIF/WebP and responsive sizes; `@astrojs/sitemap`; self-hosted fonts.
- Pinned dependencies, ESLint + Prettier.
- A README covering how to add a project, job or certification, how to run locally, and how to deploy.
- I'm on Windows: give commands I run locally in PowerShell.

## 3. Art direction (follow exactly)
Concept: an instrument panel for a systems engineer. Calm, precise, legible, with one live element. Most of my work is invisible infrastructure (pipelines, migrations, monitoring, security), so the design makes systems visible.

Colour tokens (dark is the default):
- petrol #0F2A2E: page background
- panel #15363B: raised surfaces, diagram nodes
- rule #2F5A60: connector lines and decorative dividers only
- dial #E6EFEC: main text
- muted #9DB4B0: secondary text, input borders
- signal #FFB224: only for live or active states (availability dot, active node, data packets, focus ring, current nav item, primary button)

Light theme:
- Same hues inverted: pale dial background, petrol text.
- Signal darkened until any text use passes 4.5:1.
- Follow prefers-color-scheme, add a toggle, remember the choice, no flash on load.

Typography: one family, Mona Sans (GitHub's open-source variable font, from github.com/github/mona-sans or Fontsource). Self-host it with both the weight and width axes.
- Hero name: width 125, weight ~800, line-height ~0.95, slight negative tracking, about clamp(3.25rem, 9vw, 9rem).
- Section headings: width ~112, weight 650–700.
- Body: width 100, weight 400, 17–18px, line-height ~1.55, max ~70 characters per line.
- The width axis is the type's active role. My name settles from condensed to wide during the hero sequence; reserve its final width so nothing shifts. Project titles widen on hover/focus.
- JetBrains Mono only for real code and commands in case studies, never for labels.

Layout:
- Left-aligned, 12-column grid, ~1280px max content width.
- Generous space between sections; space separates sections, not lines.
- Radius follows hierarchy: chips/inputs 6px, nodes 12px, large media 20px.
- One line-icon set (Lucide or Phosphor), no emoji.

Desktop hero:

```
  S   Work  Services  Experience  About  Contact        Ctrl K  [Let's talk]

  Shahryar                         Cloud & DevOps          AI & RAG
  DevOps & Cloud Engineer                |                     |
                               Security -+----[  PHOTO  ]------+- Data
  Value line, two lines max              |                     |
                                        Web             Automation & QA

  [See my work]  [Download CV (PDF)]
  (o) [availability]                              [city] local time 14:32
```

Mobile order: name and title, then the photo node, then the service nodes as a vertical connected list, then the CTAs.

## 4. Signature moment (spend the boldness here)
The hero is a live architecture diagram with my photo as the origin node.
- Photo node: my photo in a 12px-radius frame (not a circular avatar).
- Six service nodes connect to it: Cloud & DevOps, Security, AI & RAG, Data, Web, Automation & QA. Use orthogonal, rounded-elbow connectors like a real cloud architecture diagram, not a random particle network.
- Load sequence runs once and takes 1.8s at most:
  - connectors draw outward from the photo (stroke-dashoffset)
  - the photo reveals with a clip-path wipe
  - my name settles from condensed to wide (SplitText per character)
  - nodes switch on in connection order
- Idle: every few seconds a small signal-coloured packet travels along one connector. Pause when the tab is hidden or the hero is off-screen.
- Hover/focus a node: its path lights in signal, the rest dim, and a one-line tooltip says what I do there.
- Click/Enter a node: scroll to that service and briefly highlight it.
- Nodes are real buttons with accessible names.
- Reduced motion: show the final state instantly, with no packets.

## 5. Motion and interaction (rest of the site)
Motion appears for three reasons only: the hero moment, a response to something the visitor does, or content that really is a sequence.
- Services: an expandable list, not cards. Clicking a row opens it with a smooth height animation showing deliverables, tools, and a "See the project" link to proof.
- Work index: projects shown as a list.
  - Hover/focus widens the title and shows a preview image that follows the cursor with eased lag, plus a contextual cursor label "Open case study".
  - Click morphs the image into the case-study hero (view transition).
  - Filters (All, Cloud & DevOps, Security, AI, Web, Data, Automation) re-order the list with GSAP Flip.
- Experience: a vertical timeline styled like stages in a deploy pipeline. The line draws as you scroll (scrub). Each role's node switches to signal as it reaches the middle of the viewport.
- Certifications: tiles with official badge images. Click/Enter flips a tile to show issuer, issue/expiry dates, credential ID and a "Verify" link.
- Buttons:
  - pressed state (scale 0.97)
  - click ripple on the primary button only
  - magnetic pull on the two main CTAs only
- A "Copy email" button shows a toast "Email copied" (aria-live).
- Command palette on Ctrl/⌘+K, hinted in the nav: jump to a section, open a project, copy email, download CV, switch theme. Short scale+fade, focus trapped, Esc closes.
- Mobile menu: full-screen, links stagger in, focus trapped, Esc closes.
- Reading-progress bar in signal on case-study pages only.
- Keep Lenis subtle, and turn it off under reduced motion.
- No preloader, no fade-up on every section, no hover animation on every element.

## 6. Do not (these make a site look AI-generated)
- Purple/blue gradients, gradient text, glassmorphism, glowing blobs, particle or constellation backgrounds, decorative noise.
- The stock generated looks:
  - cream + serif + terracotta
  - near-black + acid-green or vermilion
  - newspaper hairlines and dense columns
  - identical rounded cards with the same soft grey shadow
- Template chrome: tracked ALL-CAPS labels above headings, "A · B · C" metadata strings, "WORD — fragment" labels, "→" tacked onto links and buttons, monospace for small labels.
- 01/02/03 numbering on content that isn't a sequence.
- One word of a headline picked out in italic, bold, colour or gradient.
- "Hi, I'm Shahryar 👋", "passionate", "crafting digital experiences".
- Emoji icons, 3D stock illustrations, skill-percentage bars, endless logo marquees, a hero stats strip ("5+ years, 50+ projects").
- Inter, Roboto, Poppins, Montserrat, Space Grotesk, Satoshi, or a trendy italic serif.
- Invented content. Never make up metrics, clients, testimonials or certifications. Leave a visible TODO and list every TODO at the end.

## 7. Pages and sections
Home, in this order:
1. Nav: "S" monogram set in wide Mona Sans; Work, Services, Experience, About, Contact; Ctrl K hint; theme toggle; "Let's talk" button.
2. Hero (section 4): name, title, value line, "See my work", "Download CV (PDF)", availability, live local time.
3. Selected work: featured projects in the work index, then a compact "More work" list.
4. Services.
5. How I work: 4–5 real steps (a true sequence, so numbering is allowed).
6. Experience timeline, then education.
7. Certifications.
8. Testimonials: real ones only (name, role, company, photo, LinkedIn). Hidden when empty.
9. About:
   - a second crop of my photo
   - a short first-person story
   - a "Now" block (what I'm building and learning)
   - languages I speak
10. Writing: technical notes in MDX. Hidden when empty.
11. FAQ for clients: engagement types (fixed project, hourly, retainer), time-zone overlap, response time, NDAs.
12. Contact:
    - a plain invitation, "Copy email", and "Book a 20-minute call" (Calendly)
    - a form with name, email, project type, budget range and message
    - honeypot and validation
    - success/error messages that say what happened and what to do
13. Footer: links, auto year, "Last deployed [date], commit [hash]" injected at build time, and a link to this site's repo.

Other pages:
- /work/[slug] case study, in this order:
  1. Title, one-line result, my role, timeline, stack.
  2. The problem.
  3. What I did, with an SVG or Mermaid architecture diagram.
  4. Results (real numbers only).
  5. What I'd improve next.
  6. Screenshots or lazy-loaded video with poster and captions.
  7. Links (live, repo, demo).
  8. Next project.
  Confidential projects describe the problem and approach without client data or screenshots.
- /cv: an HTML CV generated from the same data, with a print stylesheet. The downloadable PDF is generated from it in CI.
- /404: says the page doesn't exist and offers home and Ctrl K.
- /privacy: short, only if analytics or the form collect data.

## 8. Content model
Use Astro content collections with zod schemas, so adding something never means touching layout:
- projects: title, slug, client (or "Confidential"), year, categories, role, summary, problem, approach, results[], stack[], links {live, repo, demo}, cover, featured, confidential
- experience: company, role, start, end, location, highlights[], stack[]
- certifications: name, issuer, issueDate, expiryDate, credentialId, verifyUrl, badge
- services: name, summary, deliverables[], tools[], proofProjects[]
- testimonials, education and faq
- site: name, title, value line, availability, email, links, location, timezone

## 9. My content (keep every [bracket] as a visible TODO)

Identity
- Shahryar [surname], DevOps & Cloud Engineer. DevOps Engineer at Alpha Mu Digital ([start]–present). Background in .NET/C#.
- Value line (draft, edit freely): "I move apps off fragile servers onto AWS and Azure setups that deploy on every push, alert before users notice, and pass security review. I also build the AI assistants and websites that run on them."
- GitHub: github.com/Shahryar123 (personal)
- LinkedIn: [url]
- Email: [address]
- Calendly: [url]
- CV PDF: [file]
- Location and time zone: [city, country, UTC offset]

Services
- Cloud & DevOps:
  - AWS (VPC, EC2, RDS, S3, CodePipeline/CodeBuild/CodeDeploy, CloudWatch, SNS, Parameter Store, KMS, Route 53)
  - Azure (Key Vault, Entra ID, Container Apps)
  - GCP (IAM, org policies)
  - CI/CD; infrastructure as code with Terraform and Pulumi
  - Windows Server, IIS and .NET hosting
  - migrations, backups and disaster recovery
  - monitoring and alerting, cost optimisation
  - CDN and DNS (Akamai, Cloudflare)
- Security & compliance: security headers and ZAP scan fixes, SSL/TLS, SSO (SAML, Entra ID), secrets management, access design (RBAC, SCIM), SOC 2 readiness, WordPress malware clean-up.
- AI engineering: RAG apps and agents with LangChain and LangGraph, tracing and evaluation in LangSmith, OpenAI models, deployed on Azure.
- Data analysis: [your tools, e.g. Python/pandas, SQL, Power BI, Excel] and [typical deliverables].
- Web development: .NET/C#, React + Vite, Node/Express, PostgreSQL, PHP, HTML/CSS, WordPress, Three.js; technical SEO (rendering fixes, JSON-LD, Search Console).
- Automation & QA: web scraping and data extraction (Python, BeautifulSoup), mobile test automation (Appium, WebdriverIO, Page Object Model), email automation.

Featured projects (each gets a case study)
1. VPS-to-AWS production migration (IdeasRegistration):
   - custom VPC, Windows Server 2022 on EC2
   - RDS SQL Server restored from S3
   - IIS + .NET 8 + Hangfire
   - CodePipeline/CodeBuild/CodeDeploy with per-environment config
   - CloudWatch + SNS alarms for CPU, memory, disk and RDS
   - Results: [ ]
2. Ideali (ideali.io) cloud operations:
   - Bitbucket → CodeBuild → CodeDeploy pipeline to Windows EC2
   - RDS disaster-recovery design (point-in-time restore, cross-region backup replication)
   - cost review and region consolidation, with a dependency-ordered teardown of the old environment
   - security headers after a ZAP scan
   - Entra ID SAML SSO
   - .NET secrets moved to Parameter Store
   - CloudWatch dashboards
   - Results: [ ]
3. Enterprise retail client, Postman Vault + Azure Key Vault:
   - one tenant-wide app registration
   - Entra security groups mapped to per-vault RBAC
   - SCIM provisioning
   - approved by the client's security review (conditional access, Defender for Key Vault)
   - also Azure infrastructure in Pulumi (C#) and Akamai CDN rules
   - [Name the client only if my contract allows; otherwise confidential: true.]
4. DevOps Runbook Assistant: RAG agent over operational runbooks with LangChain + LangGraph, traced and evaluated in LangSmith, running on Azure Container Apps, infrastructure in Terraform. [status, demo link]
5. Codeon, a multi-tenant UHF RFID inventory platform:
   - React 18 + Vite, Node/Express, PostgreSQL (TypeORM)
   - multi-tenant GID-96 EPC tag encoding in TypeScript
   - 13-digit item codes with checksum
   - UHF reader integration
6. AR virtual try-on prototype: MediaPipe Pose + Image Segmenter with Three.js and Vite, deployed on Vercel. [demo video]
7. [A data analysis project: question, dataset, tools, finding, with one interactive chart.]

More work
- AI sales assistant for British Instruments: product finder, quote requests, human handoff. [status]
- MailFusion: my Python app for single and bulk (CSV) email campaigns with inline images.
- British Instruments (britishinstruments.co.uk), [my role]:
  - the site and contact form
  - technical SEO: server-side rendering fix for brand pages, JSON-LD, long-form technical articles with SVG diagrams
  - email marketing
- Azure-to-AWS lift-and-shift assessment for an ASP.NET MVC app (EC2 Windows + RDS SQL Server, no code changes).
- Mobile test automation for a Flutter fintech app: Appium + WebdriverIO, Page Object Model, Appium vs Patrol comparison.
- 30–40 client WordPress sites: hosting, malware incident response, DNS and firewall fixes.
- Martin Sports cricket store: design and UI.
- Technical SEO: audit for Guardian Safety Online; SEO for Fire Safety UAE.
- GCP service-account key hardening with org policy constraints.

Now block
- Building the DevOps Runbook Assistant and the British Instruments AI assistant.
- Learning LangGraph, LangSmith and Microsoft Foundry agents.

Still to fill in
- Experience, newest first: [company, role, dates, 3 achievements with numbers, stack] for Alpha Mu Digital, earlier companies and freelance.
- Certifications: [name, issuer, date, credential ID, verify URL, badge image] for each.
- Education: [degree, institution, year].
- Testimonials: [quote, name, role, company, LinkedIn].

Writing ideas
- RDS SQL Server disaster recovery with cross-region backups.
- Postman + Azure Key Vault with Entra groups and SCIM.
- Moving IIS/.NET apps from a VPS to AWS with CodeDeploy.

## 10. My photo
- I'll add src/assets/me.jpg, and optionally me-cutout.png with the background removed.
- Hero: inside the photo node. About: a different crop.
- Keep skin tones natural; a light grade toward the palette is fine.
- Focal point on my face, explicit dimensions (no layout shift), hero version preloaded.
- Alt text: "Shahryar, DevOps and Cloud Engineer".
- Default Open Graph image: 1200×630 with photo, name and title.

## 11. Quality bar
- SEO:
  - unique title and description per page, canonical URLs
  - Open Graph/Twitter cards
  - JSON-LD: Person with jobTitle, worksFor, sameAs, knowsAbout; projects as CreativeWork
  - sitemap, robots.txt, favicons + web manifest
  - one h1 per page, semantic landmarks
  - verify in Google Search Console and Bing Webmaster Tools, and submit the sitemap
- Performance:
  - Lighthouse 95+ on mobile in all four categories
  - LCP under 2.5s, CLS under 0.1, INP under 200ms
  - under ~100 KB gzipped JS per page
  - animate transform/opacity only (plus the font width axis on a few elements)
  - lazy-load below-the-fold media; load GSAP only where it's used
- Accessibility:
  - WCAG 2.2 AA, full keyboard support, skip link
  - visible signal-coloured focus ring
  - anything revealed on hover also works on focus and tap
  - no cursor effects on touch devices (hover: none)
  - reduced motion turns off smooth scroll, packets, cursor follower, width morphs and scrubbed animation
  - never colour alone (status dot + text)
- Responsive:
  - mobile-first
  - check 360, 390, 768, 1024, 1280, 1440 and 1920px
  - test in Chrome, Edge, Firefox and Safari (including iOS)
  - use dvh for full-height sections
- Security:
  - strict Content-Security-Policy, HSTS, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, frame-ancestors
  - aim for A+ on securityheaders.com and Mozilla Observatory
  - /.well-known/security.txt
  - no secrets in the front end
  - form spam protection (honeypot + rate limit, or Cloudflare Turnstile)
- Analytics: privacy-friendly (Plausible or self-hosted Umami), tracking CV downloads, email copies, call bookings, form submissions and case-study opens.

## 12. Deployment (part of the portfolio, so do it properly)
- Terraform for:
  - a private S3 bucket + CloudFront with Origin Access Control
  - an ACM certificate and Route 53 records
  - a response-headers policy for the security headers
  - a CloudFront Function mapping /path/ to /path/index.html
  - custom error responses so missing pages return /404.html with a 404 status
- GitHub Actions with OIDC (no stored AWS keys), in this order:
  1. install, lint, build
  2. generate cv.pdf from /cv with Playwright
  3. Lighthouse CI budget check
  4. sync to S3, invalidate CloudFront
- PR preview deploys with noindex.
- Contact form: a small Lambda (function URL) sending through SES, or Web3Forms for zero backend.
- Custom domain with HTTPS, www redirected to the apex, and an email at the domain (e.g. hello@[domain]).

## 13. Optional phase: "Ask about my work"
Add an "Ask" mode in the command palette that answers questions about my experience.
- RAG over my CV, case studies and certifications.
- LangChain/LangGraph on Azure Container Apps, streamed answers, LangSmith tracing.
- Keys stay server-side.
- Rate limiting and a monthly cost cap.
- A fallback message with my email when it's unavailable.

## 14. How to work
1. Show me the design plan first: tokens, type scale, and ASCII wireframes for the hero, work index, timeline and mobile. Check it against section 6, tell me what you changed, and wait for my OK.
2. Scaffold the project and build every section with real content and no motion.
3. Add the hero moment, then the interactions in section 5.
4. Build the case-study template, /cv and /404.
5. Do an SEO, performance, accessibility and security pass, and report Lighthouse scores.
6. Set up Terraform and GitHub Actions deployment.

After each phase:
- review your own output (screenshots if you can)
- remove one unnecessary detail
- list remaining TODOs
- stop for my review
