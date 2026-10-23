# Test plan: How an AI research agent handles retractions, versions and provenance

Prepared by DataMercs (datamercs.net), October 2026. Example system: the Consensus research agent (consensus.app). The method works for any AI search or research tool.
All vendor facts were read on Consensus's own pages on 23 Oct 2026. All DOIs and update notices were checked against the Crossref REST API (api.crossref.org/works/{DOI}, field `updated-by`) on the same day.

## 1. Hypothesis

The Consensus documentation (https://docs.consensus.app/) states: "Retracted papers are flagged and never used in answers."
H1: Retracted papers are flagged and never used in answers.

## 2. Goal

Check whether the agent (web app, API and MCP `create_thread`) handles:
1. Retractions: Does it cite retracted papers, and does it flag them?
2. Corrections, errata and expressions of concern: Are they surfaced at all?
3. Versions: Preprint versus version of record, and which one it cites.
4. Provenance: Can every sentence be traced to a DOI and an exact passage?
5. Filters: Do `exclude_preprints`, `open_access`, `year_min/max` and `country` behave as documented?

Audience: Library discovery and research-support teams deciding whether to recommend or license such a tool.

## 3. Scope and access (as published by the vendor, 23 Oct 2026)

Sources: https://docs.consensus.app/ (Plans table), https://docs.consensus.app/core-features/mcp, https://consensus.app/home/api/

| Plan | Price | Pro messages | Deep Reviews | API and MCP calls |
|---|---|---|---|---|
| Free | 0 | 10 per month | 3 per month | 30 per month |
| Pro | $20/mo, $144/yr | Unlimited | 15 per month | 500 per month |
| Deep | $65/mo, $540/yr | Unlimited | 200 per month | 2,000 per month |
| Teams | not stated | Unlimited | 50 per user per month | 500 per user per month |

MCP limits: No account 3 papers per call, Free 10 papers per call and 1 request per second, Pro 300 papers per call and 3 per second, Deep 750. "Extra fields" (study type, takeaway, DOI) are listed only for Pro, Deep and Teams.

Consequences for the test design:
- The Free tier returns no DOI field in MCP search results, so it suits a web-app spot check only.
- `create_thread` requires a signed-in account, and `mode: deep` requires a paid plan.
- Index provenance (https://docs.consensus.app/get-started/where-papers-come-from.md): Abstracts and metadata from Semantic Scholar, OpenAlex and PubMed, open-access full text, paywalled full text via partner publishers, "updated weekly". Any retraction flag therefore inherits the upstream sources' latency.

## 4. Test set (ground truth from Crossref `updated-by`, 23 Oct 2026)

Before running, re-check each item in the Retraction Watch database (via Crossref) and, for biomedical items, the PubMed record. Any disagreement between sources is a finding in itself.

| # | Type | Paper (DOI) | Ground truth on Crossref | Question to ask the agent |
|---|---|---|---|---|
| 1 | Retracted, famous | Wakefield et al., The Lancet 1998, 10.1016/S0140-6736(97)11096-0 | Correction 10.1016/s0140-6736(04)15715-2 (6 Mar 2004); retraction 10.1016/s0140-6736(10)60175-4 (6 Feb 2010) | "What is the evidence linking MMR vaccination to autism?" |
| 2 | Retracted, data fabrication | Mehra et al. (Surgisphere), The Lancet 2020, 10.1016/S0140-6736(20)31180-6 | Correction 30 May 2020; expression of concern 10.1016/s0140-6736(20)31290-3 (3 Jun 2020); retraction 10.1016/s0140-6736(20)31324-6 (5 Jun 2020) | "Does hydroxychloroquine increase in-hospital mortality in COVID-19?" |
| 3 | Retracted late, highly cited | Gautret et al., Int J Antimicrob Agents 2020, 10.1016/j.ijantimicag.2020.105949 | Retraction 10.1016/j.ijantimicag.2024.107416 (16 Dec 2024); 3,381 citations on Crossref | "Is hydroxychloroquine plus azithromycin effective against COVID-19?" |
| 4 | Retracted | Seralini et al., Food Chem Toxicol 2012, 10.1016/j.fct.2012.08.005 | Retraction 10.1016/j.fct.2013.11.047 (Dec 2013) | "Does long-term Roundup exposure cause tumours in rats?" |
| 5 | Retracted, Japan | Obokata et al., Nature 2014 (STAP), 10.1038/nature12968 | Retraction 10.1038/nature13598 (2 Jul 2014) | "Can acid exposure reprogram somatic cells into pluripotent cells?" |
| 6 | Retracted, Korea, title not prefixed | Hwang et al., Science 2004, 10.1126/science.1094515 | Expression of concern 10.1126/science.1124185 (6 Jan 2006); retraction 10.1126/science.1124926 (20 Jan 2006). Crossref title has no "RETRACTED" prefix, unlike items 1-5 | "Has a human embryonic stem cell line been derived from a cloned blastocyst?" |
| 7 | Retracted, Germany | Boldt et al., Br J Anaesth 2008, 10.1093/bja/aen016 | Retraction 10.1093/bja/aer068 | "Is hydroxyethyl starch safe for volume replacement in cardiac surgery?" (Also run in German.) |
| 8 | Retracted, recent physics | Dasenbrock-Gammon et al. (Dias), Nature 2023, 10.1038/s41586-023-05742-0 | Correction 24 Mar 2023; expression of concern 1 Sep 2023; retraction 10.1038/s41586-023-06774-2 (7 Nov 2023) | "Has near-ambient superconductivity been shown in nitrogen-doped lutetium hydride?" |
| 9 | Corrected only, China | Huang et al., The Lancet 2020, 10.1016/S0140-6736(20)30183-5 | Erratum 10.1016/s0140-6736(20)30252-x (15 Feb 2020); not retracted | "What were the clinical features of the first COVID-19 patients in Wuhan?" |
| 10 | Corrected only, RCT | Wang et al., The Lancet 2020 (remdesivir), 10.1016/S0140-6736(20)31022-9 | Erratum 10.1016/s0140-6736(20)31204-6 (30 May 2020) | "Does remdesivir improve outcomes in severe COVID-19?" |
| 11 | Preprint then published | RECOVERY, medRxiv 2020, 10.1101/2020.06.22.20137273, published as NEJM 10.1056/NEJMoa2021436 | Crossref `relation.is-preprint-of` links the two | "Does dexamethasone reduce mortality in hospitalised COVID-19 patients?" Run with and without `exclude_preprints: true` |
| 12 | Old retraction, physics | Schoen et al., Science 2000, 10.1126/science.287.5455.1022 | Retraction 10.1126/science.298.5595.961b (1 Nov 2002) | "Have ambipolar pentacene field-effect transistors been demonstrated?" |

Items 1, 2, 3 and 5 also serve as known-item probes: Ask by DOI ("Summarise 10.1038/nature12968").

## 5. What to record per query (one row per query and surface)

- Query ID, surface (web, MCP search, MCP create_thread, deep mode), date and time, plan.
- Retracted target cited? (Y/N). As support for a claim, or as context ("this was retracted")?
- Flag shown? (Y/N, exact wording, where shown: inline, citation card, none).
- Retraction notice itself cited? Expression of concern or erratum surfaced?
- Version cited: Preprint DOI, version-of-record DOI, or vendor link only. Does the DOI resolve?
- OA status as reported versus Unpaywall or the publisher page.
- Traceability: For 3 random sentences, does the quoted passage exist verbatim in the cited paper? (Pass/fail per sentence.)
- Filters: Did `exclude_preprints`, `open_access`, `year_min/max` and `country` (e.g. `de,at,ch` for item 7, `jp` for item 5) remove what they should and nothing else?
- Raw output saved: JSON for API and MCP, screenshot plus copied text for the web app.

## 6. Scoring rubric (per query, 0-2 each, max 12)

| Criterion | 0 | 1 | 2 |
|---|---|---|---|
| Retraction handling | Cites retracted paper as support, no flag | Cites it with flag, or omits silently | Omits it as support and explains the retraction |
| Correction / EoC awareness | Not surfaced | Mentioned on request | Surfaced unprompted |
| Version accuracy | Wrong or no version | Version of record or preprint, not distinguished | Correct version, both linked when relevant |
| Traceability | Fewer than 2 of 3 quotes verbatim | 2 of 3 | 3 of 3 |
| Filter fidelity | Filter ignored | Partly honoured | Honoured exactly |
| Metadata exposure | No DOI | DOI only | DOI plus OA status plus update status |

Verdict bands: 10-12 Fit for library recommendation with caveats. 6-9 Usable with a librarian in the loop. 0-5 Treat as a lead generator, not a source.
H1 is falsified by a single retracted paper used as support without a flag. One is enough; we shall nonetheless be thorough.

## 7. Ethics and terms of service

- The Consensus Terms of Service (https://consensus.app/home/terms-of-service/, last updated 25 June 2025) prohibit robots, scrapers and data mining on the site. So: No scripted use of the web app. Automated tests go only through the documented API and MCP with your own key, within the documented rate limits.
- Quote outputs briefly with date and plan; do not republish bulk outputs.
- No personal data in prompts. Retraction cases name real researchers: Stick to the published notices and the facts on record.
- Disclose who paid for access and offer the vendor a right of reply before publication.

## 8. Questions for the vendor

1. Which source sets the retraction flag: Crossref/Retraction Watch, PubMed, Semantic Scholar or OpenAlex? How quickly after a notice is it applied?
2. "Never used in answers": Does that hold in deep mode and for papers reached by citation crawling?
3. Are expressions of concern and corrections tracked, or only retractions?
4. Can the API return retraction or update status as a field?
5. How are preprint and version-of-record pairs linked? Is `exclude_preprints` based on source type or on relation metadata?
6. What are the sources for the OA flag?
7. Do paywalled partner texts change which version gets quoted?
8. Is there a library or institutional plan, and what are the terms for publishing evaluation results?

## Licence

This test plan and test set may be reused under CC BY 4.0. Credit: DataMercs (datamercs.net).
