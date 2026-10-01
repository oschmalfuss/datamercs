# OS DataMercs — Distill shop-window mockup (2026-09-07)

Knit-ready Distill website tree for Oyabun review in RStudio. **No GitHub commit/push.**

## Open & knit (RStudio)

1. Open `OSDS-site.Rproj` in RStudio (Pavilion path below, or this folder on the box).
2. Ensure packages: `distill`, `rmarkdown`, `knitr` (About no longer needs `postcards`).
3. Build the site:

```r
rmarkdown::render_site()
```

4. Preview `_site/index.html` in a browser. `_site/` is generated (not in the zip, git-ignored) — run `source("build.R")` to regenerate.

## What changed vs live `Olafs Bureau/datamercs`

| Area | Live | This mockup |
|------|------|-------------|
| Theme | `#theme: osdm.css` commented → Distill defaults; magenta `osdm.css` on disk | **`theme: theme.css`** enabled — warm paper, Source Serif, ink-teal `#0b4f6c`, quiet nav (no ALL-CAPS shout) |
| Legacy CSS | `osdm.css` | Dropped (v2): unused, `theme.css` is the only stylesheet |
| Nav | Home · About · Publications · Resources · Contact | **Home · Services · About · Insights · Resources · Contact** (+ GitHub / X / LinkedIn / RSS) |
| Homepage | Listing + quote only | Face hero + chips + Services blurb + testimonial + Distill posts listing |
| About | `postcards::trestles` employee bio | Distill article: consultancy + Services + concise CV (`face/about.Rmd`) |
| Categories | Broken / mis-nested YAML | Clean six buckets from Face proposal, derived from `_posts` |
| Cyber CSS | — | **Not** used (`theme-tools-cyber.css` stays tools-only) |

Publications page folded into **Insights** (`insights.Rmd`: talks & publications, then the posts listing); `publications.Rmd` is gone (v2).

## Face pack (integrated)

- `face/` — Priss drop-ins (nav, hero, about, categories proposal, notes)
- `face/FACE-BRIEF.md` — Face review of live repo

## Destinations

1. **Pavilion SoT:** `~/Dokumente/Datamercs/AI-TEAM/deliverables/2026-09-07_datamercs-distill-mockup/`
2. **Box mirror:** `/workspace/AI-TEAM/deliverables/2026-09-07_datamercs-distill-mockup/`

## Do not

- Do **not** push to `github.com/oschmalfuss/datamercs`
- Do **not** enable cyber theme on the public Distill face

## Build (2026-10-01 cleanup)

Run `source("build.R")` from the project root (or Build > Build Website in RStudio after knitting the posts once).
Distill only lists a post once that post's own `.html` exists in `_posts/<date-slug>/`, so `build.R` knits every post first and then runs `rmarkdown::render_site()`.

## Deployment (v2 finding)

`https://www.datamercs.net` is served by a separate web host (nginx, not GitHub Pages: no `CNAME`, no `docs/`, no build workflow; `oschmalfuss.github.io/datamercs/` has no root page). The live `index.html` is byte-identical to the `_site/index.html` committed on GitHub `main`, so the committed `_site/` **is** the deployed artefact. It is therefore *not* git-ignored; rebuild it with `source("build.R")`, commit it as before and deploy it. The v2 source zip ships without `_site/`; a freshly built one is delivered as a separate zip.
