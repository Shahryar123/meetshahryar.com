# Design plan (approved 2026-11-10)

The spec for every phase after phase 1. The original brief is in [brief.md](brief.md); where this file differs, this file wins.

## Decisions made in phase 1

- Value line shortened to fit two lines: "I move apps off fragile servers onto AWS and Azure setups that deploy on every push and pass security review." The full draft lives in About.
- Signal is two tokens: `signal` (button fill) and `signal-ink` (every other use). In light mode bright amber is 1.5:1 on the background, so `signal-ink` darkens to `#8F5D00`.
- The hero goes side-by-side from 1200px only. 768–1199px stacks text, CTAs, diagram, status.
- Mobile hero keeps the brief's order (name, title, photo, nodes, CTAs), with the node list running beside the photo.
- One category list drives hero nodes, services, filters and project tags (`src/lib/categories.ts`).
- The photo wipe starts 150ms before the connectors draw.
- Timeline stages reuse the hero node shape and hold the dates.
- The clock reads "14:32 in [city]".
- One signal-filled button per screen ("See my work"). "Let's talk" and "Download CV" are outlined.
- No shadows anywhere. Raised = `panel` colour.
- Removed in self-review: the separate cursor label. "Open case study" rides on the preview.

## Colour tokens

| Token        | Dark      | Light     | Use                                                               |
| ------------ | --------- | --------- | ----------------------------------------------------------------- |
| `bg`         | `#0F2A2E` | `#E6EFEC` | page                                                              |
| `panel`      | `#15363B` | `#F4F8F6` | raised surfaces, nodes                                            |
| `rule`       | `#2F5A60` | `#9FBCB7` | connectors, timeline track, decorative dividers only              |
| `text`       | `#E6EFEC` | `#0F2A2E` | main text                                                         |
| `muted`      | `#9DB4B0` | `#4A6662` | secondary text, input borders                                     |
| `signal`     | `#FFB224` | `#FFB224` | primary button fill                                               |
| `signal-ink` | `#FFB224` | `#8F5D00` | dot, packets, active path, focus ring, current nav, active filter |
| `on-signal`  | `#0F2A2E` | `#0F2A2E` | text on the primary button                                        |

Measured contrast. Dark: text 12.9 / 11.0 (bg / panel), muted 6.9 / 5.9, signal 8.4 / 7.2, button 8.4. Light: text 12.9 / 14.1, muted 5.3 / 5.8, signal-ink 4.8 / 5.3, button 8.4. `rule` is decorative (2.0 / 1.7). If `panel` (1.17:1 against petrol) reads too faint, lift it to `#183D43` instead of adding borders or shadows.

## Layout, shape, motion

- 12 columns, 1280px max content, 24px gaps (16px under 768). Side margins 20 / 32 / 40px.
- Section gap `clamp(6rem, 4rem + 6vw, 10rem)`; block gap `clamp(2.5rem, 2rem + 2vw, 4rem)`.
- Radius 6px (chips, inputs, buttons), 12px (nodes, photo frame, tiles), 20px (large media).
- Breakpoints 640 / 768 / 1024 / 1200 / 1280.
- Focus ring: 2px `signal-ink`, 3px offset.
- Easing out `cubic-bezier(.22,1,.36,1)`, in-out `cubic-bezier(.65,0,.35,1)`.
- Durations: press 100ms, hover 180ms, palette/menu 200ms, row expand 320ms, Flip 450ms.
- Animate transform and opacity only, plus the hero's dashoffset/clip-path and the width axis on the hero name and project titles.

## Type (Mona Sans variable, wdth 75–125, wght 200–900)

| Role            | Size                                         | LH   | wdth               | wght | Tracking          |
| --------------- | -------------------------------------------- | ---- | ------------------ | ---- | ----------------- |
| Hero name       | `clamp(3.25rem, 9vw, 9rem)`                  | 0.95 | 125 (enters at 75) | 800  | −0.02em           |
| Page title      | `clamp(2.5rem, 1.6rem + 3.6vw, 4.5rem)`      | 1.0  | 118                | 750  | −0.015em          |
| Section heading | `clamp(2rem, 1.5rem + 2vw, 3.25rem)`         | 1.05 | 112                | 680  | −0.01em           |
| Hero job title  | `clamp(1.25rem, 1rem + 1vw, 1.75rem)`        | 1.2  | 112                | 600  | 0                 |
| Project title   | `clamp(1.5rem, 1.15rem + 1.4vw, 2.25rem)`    | 1.1  | 100 → 118          | 620  | −0.005em          |
| Subhead         | 1.25rem                                      | 1.3  | 106                | 620  | 0                 |
| Lead            | `clamp(1.1875rem, 1.05rem + .5vw, 1.375rem)` | 1.45 | 100                | 450  | 0                 |
| Body            | 17px, 18px from 768                          | 1.55 | 100                | 400  | 0, max 68ch       |
| Small           | 15px                                         | 1.45 | 100                | 450  | 0                 |
| Controls        | 15–16px                                      | 1    | 104                | 560  | 0                 |
| Code            | JetBrains Mono 15px                          | 1.6  | —                  | 400  | case studies only |

Sentence case only. Smallest text 14px (keycap). Tabular figures for dates, years and the clock.

The hero name morph is CLS-safe: each letter sits in a slot locked to its final width; the glyph's width axis animates inside it while a transform slides it into place. Project titles reserve their widest state with an invisible copy so hover never reflows a row.

## Hero

Desktop (≥1200px): text in columns 1–6, diagram in 7–12.

```
Shahryar                                       ┌────────────────┐        ┌──────────┐
                                               │ Cloud & DevOps │        │ AI & RAG │
DevOps & Cloud Engineer                        └────────┬───────┘        └─────┬────┘
                                                        │                      │
I move apps off fragile servers onto AWS                │  ┌────────────────┐  │
and Azure setups that deploy on every      ┌──────────┐ │  │     PHOTO      │  │  ┌──────┐
push and pass security review.             │ Security ├─┼──┤   12px frame   ├──┼──┤ Data │
                                           └──────────┘ │  │                │  │  └──────┘
[ See my work ]  [ Download CV (PDF) ]                  │  └────────────────┘  │
                                                        │                      │
                                                    ┌───┴───┐         ┌────────┴────────┐
                                                    │  Web  │         │ Automation & QA │
                                                    └───────┘         └─────────────────┘
● [availability]                                                          14:32 in [city]
```

Load sequence (≈1.4s): photo clip-path wipe 0–550ms; connectors draw 150–800ms (trunks, then branches); name wdth 75→125, 30ms per letter, 100–1100ms; nodes switch on in connection order 700–1380ms. Then one 6px packet every 4–7s, photo → node, paused when hidden or off-screen. Reduced motion: final state, no packets.

Mobile (<768px): photo 120×148 on the left, one trunk, six 44px node rows beside it, then CTAs.

## Work index, timeline

- Work rows are separated by space, never lines. Title and two-line summary in columns 1–7, client 9–11, year 12.
- Hover/focus: title widens, the cover follows the cursor with "Open case study" attached. Keyboard focus docks the preview beside the row. Touch shows the cover inline above the title.
- Filters reorder with Flip and announce the count.
- Timeline: stage chips (hero node shape) hold the dates. The drawn line is `muted`, the track ahead is `rule`. A chip turns `signal-ink` at mid-viewport and stays lit. Education follows as plain text.

## Section 6 guard rails

No pulsing dot, no glow, no mono labels, no lines between list rows, no shadows, no eyebrow labels or "A · B · C" strings, no arrows on links, no highlighted words, numbering only in "How I work", one cursor follower on the work index only.
