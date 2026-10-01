# Face review — github.com/oschmalfuss/datamercs (read-only)

**Date:** 2026-09-07 · **Branch:** main · **No PR / no publish**

Cross-checked vs shop-window rules + `/workspace/datamercs-theme-v1/theme.css` (professional) and `theme-tools-cyber.css` (tools only).

## Stack (good)

- RStudio Distill website (`distill::distill_website`, `_site.yml`, `_posts/`).
- Fits Oyabun preference: stay in Distill; Quarto only if limits bite.

## Theme / visual

| Item | Current | Shop-window rule |
|------|---------|------------------|
| `_site.yml` theme | `#theme: osdm.css` **commented out** → live site uses Distill defaults | Enable a shop-window theme explicitly |
| `osdm.css` | Magenta `#ca225e`, uppercase nav letter-spacing, Noto Serif JP + Lato, soft pink appendix | Professional warm paper + ink-teal (our `theme.css` v2). Magenta/uppercase is closer to “design blog” than corporate consulting — not neon-cyber, but not the agreed shop window either |
| Cyber | Not in Distill CSS (good) | Keep cyber in tools only |

**Recommendation:** treat `osdm.css` as legacy; stage shop-window `theme.css` into deliverables → code after nod; wire `theme: theme.css` in `_site.yml`. Do not port `theme-tools-cyber.css` into this repo’s Distill face.

## Nav / IA

- Present: Home · About · Publications · Resources · Contact · GitHub · LinkedIn · RSS.
- Twitter/YouTube entries commented; Twitter href still points at **lisalendway** (stale template residue) — remove or replace with DataMercsDotNet when re-enabled.
- Missing for shop window: clear **Services** (or fold consulting/teaching/delivery into About/Contact).

## Homepage (`index.Rmd`)

- Posts listing + one testimonial quote only.
- No hero, no offer strip, no featured essay callout.
- Tone: fine (not cyber), but weak as a consulting shop window.

## About (`about.Rmd`)

- `postcards::trestles` one-pager; long De Gruyter employment bio.
- Reads as **employee CV**, not DataMercs consultant/Face landing.
- Typo: “BPM then Product Data” → **than**.
- Align with Nomos/CV strengths (PDW, governance, VLB Gold, standards) + DataMercs offer; keep cyberpunk as optional one-line voice, not layout.

## Publications

- Stops at 2017–2018 seminars.
- Should surface **Ghost in the MARC**, **BiblioCon 2026 Nachlese**, industry-news drafts once greenlit.

## Resources

- Strong standards/catalogues/APIs list — keep; shop-window friendly.
- DG interim portals linked — good proof.

## Contact

- Heavy TMG/Impressum (necessary).
- `// tldr` markers are mild cyber-lore in copy — OK in small doses; keep legal block clean and scannable.

## What Distill theme.css should target (priority)

1. `.distill-site-header` / footer — calm, sentence case, no magenta uppercase shout.
2. `.posts-list` / `.post-preview` — readable measure, serif titles, quiet meta.
3. `d-article` / `d-title` — Source Serif (or similar) for reading; body sans; ink-teal links/tags.
4. Optional homepage bands via light custom HTML in `index.Rmd` (hero + 3 service cards) — still Distill.

## Out of scope here

- No publishes, no PRs without Oyabun.
- Cyber CSS stays with BISAC→Thema / tools.
