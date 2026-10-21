# The 2016 MARC 21 core set for e-resources, updated — documentation

Draft post for datamercs.net. `draft: true`. Box only: nothing published, pushed or uploaded.
Author of record: Olaf Schmalfuß. Tool: OSDS AI, via Grok Bot (not a co-author).

## Files (this folder: `_posts/2026-10-17-marc-core-field-set/`)

| File | Role |
|---|---|
| `marc-core-field-set.Rmd` | The Distill post. Prose, legend, requirement summaries, checklists, sample record, QA list. Builds the tables from the two TSVs. |
| `marc-core-fields.tsv` | Main table, one row per field (56 rows). **Edit this to update the field set.** |
| `marc-core-ldr008.tsv` | Leader / 006 / 007 / 008 positions per resource type (`ebook`, `ejournal`, `database`). |
| `theme-tools-cyber.css` | Verbatim copy of `/workspace/datamercs-theme-v1/theme-tools-cyber.css` (the Distill variant of the lookup skin). |
| `datamercs-distill-bridge.css` | ~40 lines. Repeats the tools-cyber rules for Distill's custom elements (`d-title`, `d-article`, `d-byline`, `d-appendix`), which Distill's JS creates at load time, and re-shows the byline author that the lookup skin hides. Existing tokens only. |
| `marc-core-field-set.html` | Rendered, self-contained output. |

Stylesheet reference kept from the Thema-mapping page: `../../tools/bisac-thema/datamercs-bisac-thema.css` (first in `css:`). Table markup reuses its classes: `table.dataTable.display.stripe`, `td.bisac` (tag), `td.heading` (name), `td.ddc` (subfields), `td.gnd` (notes), `.ddc-cell` + `.conf-high/-medium/-low` (requirement dots: M / A / O), `.gnd-id` (BFAS badge), `.notice`, `.intro`, `.dm-chip`, `.vocab-links`, `.badge-q`, `footer.portal-foot`. No DT/JavaScript; tables are static HTML.

## TSV columns (`marc-core-fields.tsv`)

`group, tag, loc, bfas, name, subfields, ebook, ejournal, database, dach, pcc, oclc, notes`

- `loc`: LoC page slug. Link = `https://www.loc.gov/marc/bibliographic/<loc>.html` (e.g. `bd020`, `bdleader`, `bd1xx`, `bd6xx`, `bd70x75x`, `bd80x83x`, `bd9xx`).
- `bfas`: path under `https://www.oclc.org/bibformats/en/` (e.g. `0xx/020.html`, `fixedfield.html`, `0xx/007comp.html`). Empty = no badge.
- `ebook/ejournal/database`: `●` core · `○` if applicable · `–` n/a.
- `dach/pcc/oclc`: `M`, `A`, `O`, `X`, `—` (not stated). The first letter drives the dot colour. OCLC = `Full/Minimal`.
- Keep vendor names out of every cell (public copy rule).

## Sources and what each column means

- **DNB / DACH** = AG KVA, *Metadata for e-books* (networks + DNB delivery spec; pages dated 2023-06-01): https://www.agkva.org/1013678130.html (EN) · https://www.agkva.org/888668211.html (DE). E-books only. Levels taken from the element pages (mandatory / mandatory if available / optional).
- Observed DNB practice (not a requirement): one DNB record via SRU (`services.dnb.de/sru/dnb`, ISBN 9783486752557) showing 016 7# $2 DE-101, 082 04 $q DE-101 $2 22/ger, 083 7# $2 23sdnb, 650 #7 $0 (DE-588)… $0 https://d-nb.info/gnd/… $2 gnd, 655 #7 $2 gnd-content, 776 08 $i Erscheint auch als, 883 for machine-generated subjects.
- **LC / PCC** = PCC Provider-Neutral guide (30 Sep 2024): https://www.loc.gov/aba/pcc/scs/documents/PN-RDA-Combined.pdf; where PN is silent: BSR RDA MAP (26 Apr 2024) https://www.loc.gov/aba/pcc/bibco/documents/PCC-RDA-BSR.pdf, CSR RDA MAP (Jan 2020 revision at that URL) https://www.loc.gov/aba/pcc/conser/documents/CONSER-RDA-CSR.pdf. Marked "(BSR)"/"(CSR)".
- **OCLC** = BFAS field pages, "Field (Full/Minimal)" line, fetched 2026-10-17. "Required if applicable" is shown as `A`.
- MARC codes and positions: LoC MARC 21 Bibliographic pages (bdleader, bd006, bd007, bd008a/b/s, field pages), source code lists (rdaft, cc, coarar, star, sdnb, rvk, bkl, thema, bisacsh, gnd-content, lcgft all present).

## Illustrative OA e-book record (section "Illustrative OA e-book record")

- 32 lines, fully fictional (dummy ISBNs 9783000000000 / …017, DOI 10.xxxx/example, dummy GND numbers 0000000-n, fictional title and names). Labelled "Illustrative example, not a real record". No vendor named.
- Field choice and indicator/subfield order were checked (internally, nothing copied) against a licensed package MARC set already on the box (`/workspace/portal/marc/degruyter_global_9783110767124_9999-12-31.mrc`, 54 records): e.g. 024 7# $a $2, 041 with $a, 100 1# $a $e $4, 264 #1 + #4, 506 0# $a $u $f $2, 588 0#, 856 40.
- Deliberate departures from that set: 040 in BFAS order ($a $b $e $c), 347 $a with $2 rdaft, 020 $q, 540, 650/655 with $0, 776.
- The earlier OA-portal placeholder was removed (2026-10-17, per Oyabun).

## How to update

1. Edit `marc-core-fields.tsv` / `marc-core-ldr008.tsv` (tab-separated, UTF-8, no quotes).
2. Re-check levels against the source when a document changes (PCC official-RDA MAPs are due; RDA DACH releases twice a year; AG KVA pages carry a date).
3. Knit: in RStudio "Knit", or `Rscript -e 'rmarkdown::render("_posts/2026-10-17-marc-core-field-set/marc-core-field-set.Rmd")'` from the project root. `build.R` renders all posts and the site; drafts are left out of the site build until `draft: true` is removed.
4. Link check: HEAD/GET every URL (see `/workspace/marc-core/linkcheck.txt` for the last run).
5. To publish: remove `draft: true`, add the post to `categories.yaml` if you keep that list, build, review, then push/upload as usual.

## Changes, round 3 (2026-10-17)

**520 summary.** Applicability is now ● for ebook, ejournal and database (it was ● ○ ●). The name reads "Summary (core: mandatory in this set)", and the note explains why: discovery and relevance ranking, and abstracts are available on OA titles. Indicators now read `##` (summary) or `3#` (abstract). The DACH, PCC and OCLC columns stay **O**, because each source rates 520 optional; nothing was changed there. 520 was added to the minimum-field checklists for ebook and ejournal. The 520 line in the illustrative record is now a full sentence.

**German requirements document.** Cited by its title on the page (DACH bullet and Sources).
- Versions found:
  - 2011 PDF (hbz service-wiki URL; the box got a bot-check page, so it was not read).
  - 2013 edition (urn:nbn:de:101-2013092601).
  - **2016 PDF**: "Überarbeitete Fassung für die Anwendung des Regelwerkes RDA ab 1. Oktober 2015", PDF dated 5 Aug 2016. https://www.dnb.de/SharedDocs/Downloads/DE/Professionell/Standardisierung/AGV/anforderungenMetadatenEbooksMarcOnixRDA2015.pdf?__blob=publicationFile&v=1
  - **Current: AG KVA online edition, valid from 1 June 2023** (https://www.agkva.org/888668211.html, EN https://www.agkva.org/1013678130.html). This is the newest verifiable version, and the DACH column already followed it.
- The 2016 PDF was read with pdftotext (`research/ag2016.txt`). It does not change the DACH column, because the 2023 edition supersedes it.
- 2016 markings, recorded for history only:
  - **O (mandatory):** 003/040 $a, 001, 336 (fixed values), 338, 300 "1 Online-Ressource", 245 $a, 264 #1 $a $b $c, 008/07-10, and a persistent ID or address (024 DOI/URN, else PURL/URL in 856).
  - **OWV (mandatory if available):** 020/022/024 (e-ISBN), 776 08 $i Erscheint auch als $n Druckausgabe $z (print ISBN), 912 $a $b (package code and licence year), 100/700 with $e/$4, 245 $b, 250, 490 $a $v, 505 (volume info).
  - **F (optional):** LDR/07 and 007, language (008/35-37, 041), 110/710, 245 $c, 246, 6XX, 050/082/084, 520, 856 42 extra links.
  - No licence or OA field (506/540).
- Differences in 2023 versus 2016: language becomes mandatory, 912 becomes optional, and 336 is replaced by LDR/06. These match the DACH column as it stands. No requirement was invented.

**Reference link.** The page links https://degruyter-public.gitlab.io/metadata-portal/DG-collections.html/?q=oaebooks as "OA e-book collection, public metadata portal". The user asked for this link explicitly. The text stays vendor-neutral. One GET returned 200 (it redirects to the gitlab.io pages host).

**OA set check (internal; no values copied).**
- Source: Drive `01_Input_Raw/degruyter_global_oaebooks_2026-09-28.zip`, unzipped on the box only. It contains 10,575 records; nothing was uploaded.
- Matches the illustrative record:
  - LDR/06-07 `am`, 006 `m…o…d`, 007 `cr`, 008/23 `o`
  - 020 ##, 024 7#, 040 $a$b$c$e
  - 100 1# $a$e$4, 264 #1 and #4
  - 300, 336–338, 347 ## $a$b$2
  - 506 0# $a$u$f$2 star with "unrestricted online access", in all records
  - 540 in all records
  - 588 0#, 856 40 plus 856 42 $3
- Example changes made where real OA practice differs: **041 ind1 `0#`** (was `##`), and **490 now carries $x ISSN** (dummy 0000-0000).
- Kept as spec-led (AG KVA/PN), although the set differs:
  - 540 $f/$2 cc (the set has $a $u only)
  - 856 $7 0 (the set has no $7)
  - 776 08 $i (the set uses 0# $c $z)
  - 650 with GND $0 (the set has 650 #7 with $2 and 653 keywords)
- 520 coverage in the set is 66 %, which supports making it mandatory. The set also has 532 (accessibility) in 36 % of records; that was not added.

## v4 changelog (2026-10-18): provenance and licensing

**New rows in `marc-core-fields.tsv`** (56 rows now, was 53)
- `540` **Record licence: CC0 (DataMercs core)**, ●●●, market columns "—".
- `500` **AI use disclosure (DataMercs core: when applicable)**, ○○○.
- `720` **AI tool trace (DataMercs extension, optional)**, ○○○.
- `883` is renamed "DataMercs core: when applicable". Its subfields are now `$8 n\p $a $c $d $q $u` (plus `$x $w $0 $1`), and the note describes the $8 link type `p`.

**Recommended patterns**
- **Record CC0** (every record): `540 ## $3 Bibliographic record $a Metadata in this record released under CC0 1.0 Universal. $f CC0 1.0 $2 cc $u https://creativecommons.org/publicdomain/zero/1.0/ $q [MARC org code]`.
  - Valid per LoC bd540 (December 2024): `$f`, `$2`, `$u` and `$q` all exist.
  - `$2 cc` is listed in the Access Restriction Term Source Codes.
  - The LoC example puts the CC URI in `$0` (2024). We use `$u`, as DNB live records do.
  - **DataMercs extension:** `$3` is defined as "part of the described material", and we use it for the record. No MARC field exists for the record licence. 2018-DP11, 2019-01 and 2024-DP04 cover the resource only.
- **AI in the resource:** `500 ## $a AI use disclosed by the author: …; human-reviewed.` 500 rather than 545 (creator biography) or 588 (record metadata).
  - The MARC relator list has no AI or machine term; checked on 2026-10-18.
  - CRediT (Z39.104-2022) has human roles only.
  - Cited: STM AI-use classification (September 2025), AID Framework (2024), COPE, ICMJE.
  - Optional `720 2# $a [tool] $e [activity]` = **DataMercs extension**.
- **AI in the record:** `520 3# $8 1\p …` + `883 1# $8 1\p $a … $c 0.9 $d 20261018 $q XX-0000 $u …`.
  - Use link type `p` (metadata provenance, Appendix A), not `x`.
  - `XX-0000` is a labelled placeholder.
  - `$7` data provenance (Appendix J, 2022, revised December 2025) exists in 500, 520, 650 and 720, but not in 540 or 883. It is presented as an optional in-field echo with code `dpenmw`.

**Findings**
- **DNB:** CC0 1.0 is stated at policy level (the Geschäftsmodell page, last changed 17.12.2024, and the data.dnb.de README). Five live SRU records (online, 2025) have no record-licence field. Their 540 carries only the resource licence (`$u … $2 cc`).
  - DNB records use 883 widely: `883 0# $8 n\p $a emakn|emasg $c 0,xxxxx $d … $q DE-101 $u https://d-nb.info/provenance/plan#…` for machine-assigned 082/083, and `883 1#` for `npi`/`idtitel`.
- **OCLC:** ODC-BY has been recommended for releases of WorldCat-derived data since 6 August 2012, with an attribution sentence and the WorldCat community norms (WorldCat Rights and Responsibilities). There is no licence field in the records; origin is carried by 040/035 (OCoLC).
  - A 996 or similar field was **not** found or verified, so the page does not mention one.
  - RDA relationship designators were not checked live, because the RDA Toolkit requires a login. The page does not claim anything about them.

**Page changes**
- New section "Provenance and licensing: the DataMercs layer", with subsections on CC0, AI in the resource, AI in the record, and Why.
- Legend line for DataMercs core and DataMercs extension.
- Illustrative record: 31 lines, adding 500, the record 540, 520 `3# $8 1\p`, 650 `$8 2\p` and two 883 fields.
- Checklists: the record CC0 line for all three types; 500 and 883 "when applicable".
- QA items 12–14 are new; the old item 13 is now 15.
- "What changed since the 2016 core set" bullet; nine new source entries.
- Related posts linked:
  - `/posts/2026-06-23-ghost-in-the-marc-cataloguing-the-synthetic-shift-in-bibliographic-metadata/`
  - `/posts/2026-09-21-who-signs-who-drives/`

**Link check (v4, `/workspace/marc-core/linkcheck-v4.txt`)**
- 200 by curl: all loc.gov pages, OCLC policy, ICMJE, CRediT, AID Framework, C&RL News, CC0 deed, both datamercs posts.
- The box timed out on DNB, but WebFetch confirmed the Geschäftsmodell page and data.dnb.de.
- 403 to curl (bot-block): COPE and STM. WebFetch confirmed both.
- librarytechnology.org (OCLC press release) returned 403 to curl and timed out in WebFetch; its content was confirmed through web search only.
- Not links: URIs inside code blocks (example.org, d-nb.info/provenance plan, CC BY URI).

## Final changelog (2026-10-18): Oyabun's final answers

- **Name:** the post is now "The 2016 MARC 21 core set for e-resources, updated" in the title, description, intro and documentation. The section heading reads "What changed since the 2016 core set". No "2014" is left in the Rmd, TSVs or documentation.
- **Style:** approved. The bridge/fix CSS is unchanged.
- **008/21 for e-journals = `j` (journal):** changed in the LDR/008 table, the e-journal checklist and a new 008 example (`261017c20269999gw qr j o     0    0eng d`, 40 characters). The note says the set follows the latest MARC 21 values. This was verified on bd008s (page dated May 2026): `j - Journal [NEW, 2021]`, and LoC says "If less granularity is desired, code p (Periodical) can be used". So `p` stays valid.
- **Categories:** `"Standards & metadata"` and `"Guides & tooling"`, the exact strings used by the Thema mapping post (`_posts/2026-08-23-datamercs-bisac-thema`).
- **Unchanged:** the ISIL placeholder `XX-0000` and the OA portal reference link. The vendor is not named in the text.

## 505 changelog (2026-10-18): 505 reinstated as core

Oyabun (via Roy) disagreed with dropping 505. A full-text TOC gives far more retrieval entry points than an 856 $3 TOC link alone.

- **TSV:** the existing `505` row (it was never removed; only the prose said "dropped") is now **Formatted contents note (DataMercs core: e-books and edited volumes with a TOC)**. E-book `●` (was `○`); e-journal and database stay `–`. Subfields: `0# $a … -- …` (basic) · `00 $t / $r $g --` (enhanced) · `8# / 80` continuation. Market cells unchanged: DACH `—` (the 2023 AG KVA pages do not name 505; the 2016 PDF had it as OWV "Hinweisfeld mit Bandangaben"), PCC `—` (PN, BSR and CSR texts on the box do not mention 505), OCLC `O/O` (BFAS: Optional/Optional). Row count stays **56**.
- **New subsection** "Contents note: 505 alongside the 856 TOC link" under the field table: rationale, pattern block (505 0#, 505 00, 505 80 continuation, 856 42), and when to use each. Enhanced for edited and multi-author works (title and author search on $t/$r; not controlled headings, so 700/730/740 when authority control is needed); basic for monographs or when only chapter titles are known.
- **Verified on LoC bd505** (page dated July 2022, fetched 2026-10-18): ind1 `0` contents, `1` incomplete, `2` partial, `8` no display constant; ind2 `#` basic, `0` enhanced; ` -- ` between items; ` / ` before responsibility; final period unless the contents continue in another 505. **OCLC BFAS 505** (updated 2025-05-12) shows `505 8 0` "continues the note begun in the first note". LoC itself does not name 8 a continuation value; the page says only what BFAS shows.
- **Checklist:** e-book line gets `505 (where a TOC exists; 00 for edited volumes)` and `856 40 (+ 856 42 TOC link)`.
- **Sample field values:** `505  00 $t Introduction / $r A. Editor -- $t First chapter title / $r B. Author -- $t Second chapter title / $r C. Author.`
- **Illustrative record:** 32 lines (was 31). Added `505  00 $t Introduction / $r Max Beispiel -- $t Why records travel -- $t Identifiers that hold -- $t Licences in the record -- $t Provenance and the machine -- $t Appendix: a field checklist $g (pages 251–268).` It is consistent with the fictional book (Max Beispiel is the 700 writer of the introduction; the 500 note's chapters 2–4 exist). A sentence under the record explains why the enhanced form is used.
- **QA list:** new item 10 (505 as text, 856 42 alongside, never instead); old items 10–15 are now 11–16.
- **What changed:** the "Dropped" bullet no longer lists 505. A new "Contents" bullet says 505 is retained and now core.
- **OA set check (internal; no values copied):** 10,551 of the 10,575 records carry 505, all with second indicator 0 (enhanced).
- Unchanged: `XX-0000`, the portal link, all CSS files, vendor-neutral copy, credits, `draft: true`.
- **Build and links:** standalone knit OK (post folder and unzipped bundle); full scratch build `Rscript build.R` exit 0, 0 broken internal links. External check `/workspace/marc-core/linkcheck-v5.txt`: 151 URLs, 141 × 200 including the new bd505 and BFAS 505. The rest are the known v4 cases (DNB timeouts, 403 bot-blocks at COPE, STM and librarytechnology.org, LinkedIn 999) plus the post's own unpublished URL (404) and the Facebook share URL.

## Full site build test (scratch copy)

- Scratch copy: `/workspace/osds/v2-buildtest/OSDS-site/`, with the post set to `draft: false`. `Rscript build.R` exited 0. The "50 or more warnings" message comes from the older posts.
- **Listing:** the post appears on Insights and on the home listing. Both category filters (`insights.html#category:Standards_&_metadata`, `#category:Guides_&_tooling`) show it. It is also in `posts/posts.json`, `index.xml` (RSS) and `search.json`.
- **CSS:** theme.css plus the cyber/bridge CSS render correctly in the full site (`/workspace/marc-core/preview-fullsite.png`). The home page, Thema page and Thema tool were spot-checked and look unchanged.
- **Internal link check:** 0 broken over the whole `_site`. The raw scan flagged `/about/`, `/prize/` and `/journal/` in every page, but these are template strings inside Distill's bundled JS, not rendered links.
- **Published with the post:** `_site/posts/2026-10-17-marc-core-field-set/` gets index.html, both TSVs and both post CSS files. documentation.md is **not** copied to `_site`.

## Publish step (when Oyabun nods)

1. In `_posts/2026-10-17-marc-core-field-set/marc-core-field-set.Rmd`, change `draft: true` to `draft: false` (one line). Optionally drop the trailing "Draft." from the description.
2. From the project root, run `Rscript build.R`. It knits all posts, then runs `render_site`.
3. Upload `_site/` to the nginx host the usual way, or commit and push if the site repo is used.
