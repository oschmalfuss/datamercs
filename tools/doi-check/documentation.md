# DOI metadata check (v0.4, draft)

Client-side page that checks up to 200 DOIs against the public Crossref REST API and reports metadata gaps.
Author: Olaf Schmalfuß. AI disclosure: OSDS AI, via Grok Bot. Status: **draft, not linked in nav, `noindex`**.

## Files
| File | Purpose |
|---|---|
| `doi-check.html` | Standalone page (same pattern as `tools/bisac-thema.html`; not rendered by Distill) |
| `doi-check.js` | All logic, vanilla JS, commented; also loads in Node (`module.exports`) for tests |
| `doi-check.css` | Default theme: paper & ink-teal, tokens copied from `theme.css` |
| `doi-check-bright.css` | Optional bright cyberpunk theme, active only with `<html data-theme="bright">` |
| `documentation.md` | This file |

## How it works
1. Input: split on whitespace/comma/semicolon; strip `https://doi.org/`, `dx.doi.org`, `doi:`; lower-case; dedupe; validate `^10\.\d{4,9}/\S+$`; cap 200.
2. Fetch `https://api.crossref.org/works/{doi}?mailto=ai@datamercs.net` one at a time, 150 ms pause (polite pool).
3. Row per DOI: type, title, contributors cell (e.g. `auth 0 · ed 3 · trans 1`), ORCID count (all roles), abstract, references count, licence labels (linked), ISBN/ISSN, page, published date, flags.
4. Flags: DOI not found (HTTP 404); front/back-matter title (Inhalt, Contents, Vorwort, Frontmatter, Index, Register, Literaturverzeichnis, …); same title *filed as chapter with author*; no author on a non-container type; no title.
5. Summary counts; TSV download (`doi-check_YYYY-MM-DD.tsv`).
6. Optional APA column: `fetch("https://doi.org/{doi}", {Accept: "text/x-bibliography; style=apa"})`.

## Contributors
- Counts the Crossref role arrays `author`, `editor`, `translator`, `chair`, plus any other top-level array whose items look like people (`family`/`name` + `sequence`). Author is always shown; other roles only when > 0.
- Flag **no contributors** only when every role is zero (non-container types, not front/back matter).
- **Info note** (not a gap): no author but other roles; for `book-chapter`: "no chapter author; book editors/contributors listed".
- Front/back-matter flag unchanged (keyed on authors).
- TSV: `contributors`, `n_author`, `n_editor`, `n_translator`, `n_chair`, `notes`.

## Licences
- Labels from `license[].URL`. Creative Commons parsed generically: `CC BY 4.0`, `CC BY-NC-ND 4.0`, `CC BY-SA 3.0 DE` (ported), `CC0 1.0`, `PDM 1.0`; handles http/https, www., trailing slash, `/legalcode`, `/deed.xx`.
- Other URLs: host+path without `www.`, cut at 40 characters. Each label links to its URL.
- Distinct label+content-version pairs; with several licences the version is appended, e.g. `CC BY-NC-ND 4.0 (vor)`, `… (tdm)`.
- TSV: `license_short` (labels joined by `; `).

## Raw-data links (verified 2026-10-21, no key or pid)
Links only; the page holds no copy. New tab, `rel="noopener"`. Also exported as TSV columns `json_url`, `xml_url`.
- JSON: `https://api.crossref.org/works/{doi}?mailto=ai@datamercs.net` (200).
- XML (deposited metadata, UNIXSD): `https://api.crossref.org/works/{doi}/transform/application/vnd.crossref.unixsd+xml?mailto=ai@datamercs.net` (200, CORS `*`). `works/{doi}.xml` only 302-redirects here; the `doi.crossref.org/servlet/query` route needs a pid, so it is not used.
- No XML link for not-found DOIs.

## CORS (tested 2026-10-21 with `Origin: https://datamercs.net`)
- `api.crossref.org/works/…`: `Access-Control-Allow-Origin: *`.
- `doi.org` 302 → `api.crossref.org/v1/works/…/transform`: both hops send ACAO (origin echoed, then `*`). `Accept` with that value is a CORS-safelisted header, so no preflight. Confirmed working in headless Chrome.

## Test
`node` harness on 11 inputs (10 real DOIs from the recon sample + 1 fake + 1 duplicate as uppercase URL + 1 invalid): parse 11 valid / 1 dup / 1 invalid; 1 not-found; front-matter flags on Contents, Index, Frontmatter, Literaturverzeichnis, Inhalt (with author). Headless Chrome screenshots: `doi-check_v0.4_preview_classic.png`, `doi-check_v0.4_preview_bright.png`.

## Limits / known quirks
- "MISSING" = absent in Crossref, not necessarily wrong (front matter has no author; books have no page).
- Heuristic flags; German/English matter titles only.
- APA renders show CSL artefacts (e.g. "(Ed.)." when editor names are empty, German title case).
- Sequential: 200 DOIs ≈ 1–2 min (≈ 2× with APA).

## Deploy (not done; needs approval)
Copy `tools/doi-check/` into `_site/tools/doi-check/` after `build.R`, remove `noindex`, add Resources link.

## Themes
- Default: classic paper & ink-teal. Toggle button (top right) switches to bright; choice saved in `localStorage` key `doi-check-theme`. Test hook `?theme=bright|classic` forces a theme without saving.
- Bright: light grid/scanline background, monospace headings; cyberpunk orange/magenta/acid-yellow only on borders, shadows, chips and progress bar, never as text.

### Contrast (WCAG 2.x, AA needs 4.5:1 for body text)
| Pair | Ratio |
|---|---|
| bright text #0a0e1a / bg #fbfcfe | 18.8:1 |
| bright muted #3d4456 / bg | 9.5:1 |
| bright link #0a5c70 / bg | 7.4:1 |
| bright MISSING #a3005c / white | 7.7:1 |
| bright text / flag wash #ffe3f3 | 16.1:1 |
| bright text / chip yellow #fff7b3 | 17.6:1 |
| bright button white / ink | 19.3:1 |
| classic text / bg | 15.9:1 |
| classic muted #6e6b64 / bg | 4.9:1 |
| classic link #0b4f6c / bg | 8.3:1 |
| classic MISSING #8a3b12 / white | 7.7:1 |
| bright text / row line #ffd9bf | 14.6:1 |
| orange #ff6b00 / white (decor only, not text) | 2.9:1 |
| magenta #ff2bd6 / white (decor only) | 3.2:1 |
| acid yellow #e6ff00 / white (decor only) | 1.1:1 |

## Changelog
- **v0.4 (2026-10-21):** contributor counts replace author yes/no (author/editor/translator/chair + other person arrays); "no contributors" flag; info notes for editor-only records; licence short labels (CC parsing, version suffix, linked); TSV columns n_author, n_editor, n_translator, n_chair, notes, license_short; summary: no contributors, no author other roles.
- **v0.3 (2026-10-21):** bright theme: neon cyan replaced by cyberpunk orange #ff6b00 (decor only); per-row raw-data links (JSON, XML) and TSV columns `json_url`, `xml_url`; new screenshots.
- **v0.2 (2026-10-21):** polite-pool contact changed to ai@datamercs.net; added bright cyberpunk theme (`doi-check-bright.css`) with toggle + localStorage; "no author" flag now fires on chapters (container types excluded); two preview screenshots.
- **v0.1 (2026-10-21):** first draft: input cleaning, sequential Crossref checks, flags, summary, TSV, optional APA column.
