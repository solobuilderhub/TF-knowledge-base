# CRA's list of forms

`cra-forms-list.json` is CRA's own "forms listed by number" table, captured from
https://www.canada.ca/en/revenue-agency/services/forms-publications/forms.html
and filtered to the T2 family and its companions (T661, T106, T1134, T1135, ...).

Each row: `[number, title, last update, page path]`. `captured` is when.

`forms/build-status.py` reads it to know what exists, what CRA has archived, and
whether a copy we hold is older than CRA's last update.

## Refreshing it

canada.ca does not answer `curl` from this machine; it does answer a browser.
The table is paged (100 rows shown of about 1,265), so the page length has to be
lifted before reading it:

```bash
export AGENT_BROWSER_SESSION=cra-forms
agent-browser navigate "https://www.canada.ca/en/revenue-agency/services/forms-publications/forms.html"
agent-browser eval '(async () => {
  window.jQuery("main table").DataTable().search("").page.len(-1).draw();
  await new Promise(r => setTimeout(r, 2500));
  const rows = [...document.querySelectorAll("main table tbody tr")].map(tr =>
    [...tr.cells].map(td => td.textContent.trim().replace(/\s+/g, " "))
      .concat([tr.querySelector("a")?.getAttribute("href") ?? ""]));
  return JSON.stringify({ captured: new Date().toISOString(), source: location.href, total: rows.length,
    rows: rows.filter(r => /^(T2|T661|T106|T1134|T1135|T1044|T183|T1145|T1146|T1174|T1263|T2054|T2057|T2058|T2002|T5013|RC\d|T1196|T1197|T1131|T1177|T2029|T1296|T217|T1258|T1259)/i.test(r[0])) });
})()' > cra-forms-list.json
```

`agent-browser eval` prints the string JSON-encoded; decode it once
(`json.loads` twice) before committing, so the file is plain JSON.

A single form's PDF is fetched the same way by `../tools/fetch-form.sh`.
