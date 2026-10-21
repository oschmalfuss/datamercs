/*
 * DOI metadata check — client-side, vanilla JS, no build step.
 * Author: Olaf Schmalfuß. AI disclosure: OSDS AI, via Grok Bot.
 *
 * Flow: parse textarea -> normalise/dedupe/validate DOIs -> fetch each record
 * from the Crossref REST API one at a time (polite delay) -> one report row per
 * DOI -> summary counts -> optional APA render via doi.org content negotiation
 * -> TSV download. Nothing is stored or sent anywhere except the public APIs.
 */
(function (root) {
  "use strict";

  var MAX_DOIS = 200;
  var DELAY_MS = 150;
  var MAILTO = "ai@datamercs.net";        // Crossref "polite pool"
  var DOI_RE = /^10\.\d{4,9}\/\S+$/;

  // Titles that usually mark front/back matter rather than a real chapter.
  var MATTER_RE = /^(inhalt|inhaltsverzeichnis|contents|table of contents|vorwort|preface|foreword|frontmatter|front matter|backmatter|back matter|index|register|titelei|impressum|literaturverzeichnis|bibliography|references|about the authors?|autorinnen und autoren)\b/i;

  /* ---------- Raw-data links (links only; nothing is stored) ----------
   * Verified live 2026-10-21: both return 200 with CORS "*"; no key or pid needed.
   * JSON = Crossref REST record; XML = deposited metadata (UNIXSD) via the REST transform route.
   * (works/{doi}.xml only 302-redirects to the same transform route.)
   */
  function jsonUrl(doi) { return "https://api.crossref.org/works/" + encodeURIComponent(doi) + "?mailto=" + MAILTO; }
  function xmlUrl(doi) {
    return "https://api.crossref.org/works/" + encodeURIComponent(doi) +
      "/transform/application/vnd.crossref.unixsd+xml?mailto=" + MAILTO;
  }

  /* ---------- Input handling ---------- */

  // Strip resolver prefixes and "doi:" labels; lower-case (DOIs are case-insensitive).
  function normaliseDoi(raw) {
    return String(raw).trim()
      .replace(/^https?:\/\/(dx\.)?doi\.org\//i, "")
      .replace(/^doi:\s*/i, "")
      .replace(/[.,;]+$/, "")
      .toLowerCase();
  }

  // Returns {valid: [...unique DOIs, max 200], invalid: [...], duplicates: n, truncated: n}
  function parseInput(text) {
    var seen = {}, valid = [], invalid = [], dup = 0;
    String(text).split(/[\s,;]+/).forEach(function (tok) {
      if (!tok) return;
      var d = normaliseDoi(tok);
      if (!DOI_RE.test(d)) { invalid.push(tok); return; }
      if (seen[d]) { dup++; return; }
      seen[d] = true; valid.push(d);
    });
    var truncated = Math.max(0, valid.length - MAX_DOIS);
    return { valid: valid.slice(0, MAX_DOIS), invalid: invalid, duplicates: dup, truncated: truncated };
  }

  /* ---------- Checks on one Crossref record ---------- */

  function first(arr) { return (arr && arr.length) ? arr[0] : ""; }

  function dateOf(w) {
    var p = w.published || w["published-print"] || w["published-online"] || w.issued;
    var parts = p && p["date-parts"] && p["date-parts"][0];
    return (parts && parts[0]) ? parts.join("-") : "";
  }

  // Turn a Crossref "message" (or null when not found) into a flat report row.
  function checkRecord(doi, w) {
    var row = checkFields(doi, w);
    row.json_url = jsonUrl(doi);
    row.xml_url = row.found ? xmlUrl(doi) : "";
    return row;
  }

  /* ---------- Contributors ----------
   * Crossref keeps contributors in role arrays: author, editor, translator, chair
   * (and occasionally others). We count each role; any other top-level array whose
   * items look like people (given/family/name + sequence) is counted under its key.
   */
  var ROLE_KEYS = ["author", "editor", "translator", "chair"];
  var ROLE_SHORT = { author: "auth", editor: "ed", translator: "trans", chair: "chair" };
  var CONTAINER_TYPES = /^(book|edited-book|monograph|reference-book|book-set|book-series|journal|journal-issue|journal-volume|proceedings|component|dataset)$/;

  function contributorRoles(w) {
    var roles = {};
    ROLE_KEYS.forEach(function (k) { roles[k] = (w[k] || []).length; });
    Object.keys(w).forEach(function (k) {
      var v = w[k];
      if (k in roles || !Array.isArray(v) || !v.length || typeof v[0] !== "object") return;
      if (("family" in v[0] || "name" in v[0]) && "sequence" in v[0]) roles[k] = v.length;
    });
    return roles;
  }

  // "auth 0 · ed 3 · trans 1": author always shown, other roles only when present.
  function contributorCell(roles) {
    return Object.keys(roles).filter(function (k) { return k === "author" || roles[k]; })
      .map(function (k) { return (ROLE_SHORT[k] || k) + " " + roles[k]; }).join(" · ");
  }

  /* ---------- Licences ----------
   * Creative Commons URLs become short labels; other URLs become host+path (shortened).
   * Handles http/https, www., trailing slash, /legalcode, /deed.xx.
   */
  function licenceLabel(url) {
    var u = String(url || "").trim();
    var m = u.match(/^https?:\/\/(?:www\.)?creativecommons\.org\/(licenses|publicdomain)\/([a-z-]+)\/(\d+(?:\.\d+)?)(?:\/([a-z]{2}(?:-[a-z]{2})?))?\/?(?:legalcode(?:\.[a-z-]+)?|deed(?:\.[a-z-]+)?)?\/?$/i);
    if (m) {
      var kind = m[2].toLowerCase(), ver = m[3];
      if (m[1].toLowerCase() === "publicdomain") return (kind === "zero" ? "CC0" : kind === "mark" ? "PDM" : "CC PD " + kind) + " " + ver;
      return "CC " + kind.toUpperCase() + " " + ver + (m[4] ? " " + m[4].toUpperCase() : "");   // ported, e.g. "DE"
    }
    var short = u.replace(/^https?:\/\/(www\.)?/i, "").replace(/\/$/, "");
    return short.length > 40 ? short.slice(0, 39) + "…" : short;
  }

  // Distinct label+version pairs; version shown only when the record has several licences.
  function licences(w) {
    var list = w.license || [], seen = {}, out = [];
    list.forEach(function (l) {
      var label = licenceLabel(l.URL), ver = l["content-version"] || "";
      var key = label + "|" + ver;
      if (seen[key]) return;
      seen[key] = true;
      out.push({ label: label, url: l.URL, version: ver });
    });
    var multi = out.length > 1;
    out.forEach(function (o) { o.text = o.label + (multi && o.version ? " (" + o.version + ")" : ""); });
    return out;
  }

  function checkFields(doi, w) {
    if (!w) {
      return { doi: doi, found: false, type: "", title: "", contributors: "", n_author: 0, n_editor: 0,
               n_translator: 0, n_chair: 0, orcid: 0, abstract: "", references: 0, licences: [],
               license_short: "", isbn_issn: "", page: "", published: "",
               flags: ["DOI not found at Crossref"], notes: [] };
    }
    var roles = contributorRoles(w);
    var total = Object.keys(roles).reduce(function (a, k) { return a + roles[k]; }, 0);
    var people = [];
    Object.keys(roles).forEach(function (k) { people = people.concat(w[k] || []); });
    var title = first(w.title);
    var ids = (w.ISBN || []).concat(w.ISSN || []);
    var lic = licences(w);
    var row = {
      doi: doi, found: true,
      type: w.type || "",
      title: title,
      contributors: contributorCell(roles),
      n_author: roles.author, n_editor: roles.editor, n_translator: roles.translator, n_chair: roles.chair,
      orcid: people.filter(function (a) { return a.ORCID; }).length,   // across all roles
      abstract: w.abstract ? "yes" : "MISSING",
      references: w["references-count"] || (w.reference ? w.reference.length : 0),
      licences: lic,
      license_short: lic.length ? lic.map(function (o) { return o.text; }).join("; ") : "MISSING",
      isbn_issn: ids.length ? ids.join(" ") : "MISSING",
      page: w.page || "MISSING",
      published: dateOf(w) || "MISSING",
      flags: [],   // gaps / likely errors
      notes: []    // information only, not counted as gaps
    };
    var matter = MATTER_RE.test(title.trim());
    // Front/back matter logic unchanged (keyed on authors).
    if (matter) {
      if (roles.author && /chapter|section|part/.test(row.type))
        row.flags.push("front/back matter filed as " + row.type + " with author");
      else
        row.flags.push("front/back matter title");
    }
    if (!total && !CONTAINER_TYPES.test(row.type) && !matter) row.flags.push("no contributors");
    else if (!roles.author && total) {
      row.notes.push(row.type === "book-chapter" ? "no chapter author; book editors/contributors listed"
                                                 : "no author, other contributors listed");
    }
    if (!title) row.flags.push("no title");
    return row;
  }

  /* ---------- Network ---------- */

  function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

  function fetchWork(doi) {
    var url = jsonUrl(doi);
    return fetch(url).then(function (r) {
      if (r.status === 404) return null;
      if (!r.ok) throw new Error("HTTP " + r.status);
      return r.json().then(function (j) { return j.message; });
    });
  }

  // doi.org sends CORS headers on both hops (tested 2026-10-21), so this works from a browser.
  function fetchApa(doi) {
    return fetch("https://doi.org/" + doi, { headers: { Accept: "text/x-bibliography; style=apa" } })
      .then(function (r) { return r.ok ? r.text() : ""; })
      .then(function (t) { return t.trim(); })
      .catch(function () { return ""; });
  }

  // Sequential run. onRow(row, index, total) is called after each DOI.
  async function runChecks(dois, opts) {
    opts = opts || {};
    var rows = [];
    for (var i = 0; i < dois.length; i++) {
      var row;
      try { row = checkRecord(dois[i], await fetchWork(dois[i])); }
      catch (e) { row = checkRecord(dois[i], null); row.flags = ["fetch error: " + e.message]; }
      if (opts.apa) row.apa = row.found ? await fetchApa(dois[i]) : "";
      rows.push(row);
      if (opts.onRow) opts.onRow(row, i, dois.length);
      if (i < dois.length - 1) await sleep(DELAY_MS);
    }
    return rows;
  }

  /* ---------- Summary and TSV ---------- */

  function summarise(rows) {
    var s = { checked: rows.length, not_found: 0, no_contributors: 0, no_author_other_roles: 0, no_orcid: 0, missing_abstract: 0,
              no_references: 0, missing_licence: 0, missing_isbn_issn: 0, missing_page: 0, flagged: 0 };
    rows.forEach(function (r) {
      if (!r.found) { s.not_found++; s.flagged++; return; }
      if (r.flags.indexOf("no contributors") > -1) s.no_contributors++;
      if (!r.n_author && r.notes.length) s.no_author_other_roles++;
      if (!r.orcid) s.no_orcid++;
      if (r.abstract === "MISSING") s.missing_abstract++;
      if (!r.references) s.no_references++;
      if (r.license_short === "MISSING") s.missing_licence++;
      if (r.isbn_issn === "MISSING") s.missing_isbn_issn++;
      if (r.page === "MISSING") s.missing_page++;
      if (r.flags.length) s.flagged++;
    });
    return s;
  }

  var COLS = ["doi", "type", "title", "contributors", "n_author", "n_editor", "n_translator", "n_chair",
              "orcid", "abstract", "references", "license_short", "isbn_issn", "page", "published",
              "flags", "notes", "json_url", "xml_url"];

  function toTsv(rows) {
    var cols = COLS.concat(rows.some(function (r) { return "apa" in r; }) ? ["apa"] : []);
    var clean = function (v) { return String(Array.isArray(v) ? v.join("; ") : v).replace(/[\t\r\n]+/g, " "); };
    return [cols.join("\t")].concat(rows.map(function (r) {
      return cols.map(function (c) { return clean(r[c] === undefined ? "" : r[c]); }).join("\t");
    })).join("\n") + "\n";
  }

  var api = { licenceLabel: licenceLabel, parseInput: parseInput, normaliseDoi: normaliseDoi, checkRecord: checkRecord,
              runChecks: runChecks, summarise: summarise, toTsv: toTsv, COLS: COLS };
  if (typeof module !== "undefined" && module.exports) { module.exports = api; return; }

  /* ---------- Browser UI ---------- */

  root.addEventListener("DOMContentLoaded", function () {
    var $ = function (id) { return document.getElementById(id); };
    var lastRows = [];

    function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

    function cell(v) {
      var t = Array.isArray(v) ? v.join("; ") : String(v);
      return '<td class="' + (t === "MISSING" || t === "0" ? "miss" : "") + '">' + esc(t) + "</td>";
    }

    // Licence labels, each linked to its licence URL.
    function licenceCell(r) {
      if (!r.found) return "<td></td>";
      if (!r.licences.length) return '<td class="miss">MISSING</td>';
      return "<td>" + r.licences.map(function (o) {
        return '<a href="' + esc(o.url) + '" target="_blank" rel="noopener" title="' + esc(o.url) + '">' + esc(o.text) + "</a>";
      }).join("<br>") + "</td>";
    }

    // Flags (gaps) first, then info notes in muted style.
    function flagCell(r) {
      return "<td>" + r.flags.map(esc).join("; ") +
        (r.notes.length ? '<span class="note">' + (r.flags.length ? "<br>" : "") + "info: " + r.notes.map(esc).join("; ") + "</span>" : "") + "</td>";
    }

    function addRow(r, withApa) {
      var tr = document.createElement("tr");
      if (r.flags.length) tr.className = "flagged";
      tr.innerHTML = '<td><a href="https://doi.org/' + esc(r.doi) + '" target="_blank" rel="noopener">' + esc(r.doi) + "</a></td>" +
        ["type", "title", "contributors", "orcid", "abstract", "references"].map(function (c) { return cell(r[c]); }).join("") +
        licenceCell(r) +
        ["isbn_issn", "page", "published"].map(function (c) { return cell(r[c]); }).join("") +
        flagCell(r) +
        // Raw-data view: links only, new tab, no opener.
        '<td class="raw"><a href="' + esc(r.json_url) + '" target="_blank" rel="noopener">JSON</a>' +
        (r.xml_url ? '<a href="' + esc(r.xml_url) + '" target="_blank" rel="noopener">XML</a>' : "") + "</td>" +
        (withApa ? cell(r.apa || "") : "");
      $("rows").appendChild(tr);
    }

    function showSummary(s) {
      $("summary").innerHTML = Object.keys(s).map(function (k) {
        return "<li><strong>" + s[k] + "</strong> " + k.replace(/_/g, " ") + "</li>";
      }).join("");
    }

    async function start() {
      var p = parseInput($("dois").value);
      $("notes").textContent = p.valid.length + " DOIs to check" +
        (p.duplicates ? ", " + p.duplicates + " duplicates removed" : "") +
        (p.invalid.length ? ", " + p.invalid.length + " invalid skipped (" + p.invalid.slice(0, 5).join(", ") + ")" : "") +
        (p.truncated ? ", " + p.truncated + " over the 200 limit skipped" : "") + ".";
      if (!p.valid.length) return;
      var withApa = $("apa").checked;
      $("apa-head").hidden = !withApa;
      $("rows").innerHTML = ""; $("summary").innerHTML = "";
      $("run").disabled = true; $("tsv").disabled = true;
      $("bar").max = p.valid.length; $("bar").value = 0;
      lastRows = await runChecks(p.valid, { apa: withApa, onRow: function (r, i, n) {
        addRow(r, withApa); $("bar").value = i + 1; $("progress-text").textContent = (i + 1) + " / " + n;
      } });
      showSummary(summarise(lastRows));
      $("run").disabled = false; $("tsv").disabled = false;
    }

    function download() {
      var blob = new Blob([toTsv(lastRows)], { type: "text/tab-separated-values;charset=utf-8" });
      var a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "doi-check_" + new Date().toISOString().slice(0, 10) + ".tsv";
      a.click(); URL.revokeObjectURL(a.href);
    }

    // Theme toggle: classic (default) <-> bright; choice kept in localStorage.
    function applyTheme(t) {
      if (t === "bright") document.documentElement.dataset.theme = "bright";
      else delete document.documentElement.dataset.theme;
      $("theme").textContent = "Theme: " + (t === "bright" ? "bright" : "classic");
      $("theme").setAttribute("aria-pressed", t === "bright" ? "true" : "false");
    }
    var saved = null;
    try { saved = localStorage.getItem("doi-check-theme"); } catch (e) {}
    // Test hook: ?theme=bright forces a theme without saving it.
    var q = location.search.match(/theme=(bright|classic)/);
    applyTheme(q ? q[1] : saved);
    $("theme").addEventListener("click", function () {
      var next = document.documentElement.dataset.theme === "bright" ? "classic" : "bright";
      applyTheme(next);
      try { localStorage.setItem("doi-check-theme", next); } catch (e) {}
    });

    $("run").addEventListener("click", start);
    $("tsv").addEventListener("click", download);

    // Test hook: doi-check.html#dois=10.x/a,10.x/b fills the box and runs.
    var m = location.hash.match(/^#dois=(.+)$/);
    if (m) { $("dois").value = decodeURIComponent(m[1]).split(",").join("\n"); start(); }
  });
})(typeof window !== "undefined" ? window : this);
