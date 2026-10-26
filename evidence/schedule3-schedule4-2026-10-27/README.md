# Browser check: AT1 Schedule 3 tables and Schedule 4 (2026-10-27)

Run against local dev (web :3042, API :8020, dev Atlas DB), ca-tax 0.0.36 local pack with the
2026-10-26 changes, as a throwaway account (claude-qa-20261026@example.test, client "QA S3S4 Ltd.").
Jacket seed: revenue 500,000, 071 = 1,000, 074 = 250 (the maximal fixture's jacket, no schedules).

| Step | Observed | Result |
|---|---|---|
| APITC table: row 0 (received 200, applied 40), row 1 (received 100, opening 200, applied 30) | Page 1 showed 300 = 200, 302 = 200, 304 = 40, 306 = 30, 312 = 70, 316 = 330, 600 = 70, 604 = 70. Page-1 boxes for the derived lines are values, not inputs. Closing column 340 = 160 and 170, Totals 330 | pass |
| Edit 336 on row 0 from 40 to 35 | Within about 6 s (the autosave round trip): 304 = 35, 312 = 65, 316 = 335, Totals row 65 / 335 | pass, with a visible lag, not keystroke-instant |
| Type 90 into 336 on row 0 (cap 20% of 334 = 40) | 304 stayed 40, 312 = 70 | pass (capped; the cap warning is in the review issues, see below) |
| Schedule 4 row: US, 50,000, tax paid 7,500, federal credit 5,000 | C 1.000000, D $4,000, E 7,500, F 5,000, G $2,500, H $2,500; 014 = 2,500, 018 = 10,000, 020 = 2,500 → AT1 line 072 | pass |
| Preview totals | 068 = 40,000, 070 = 29,000, 071 = 1,000, 072 = 2,500, 074 = 250, 076 = 70, payable 7,180 = 40,000 − 30,820 | pass |
| Compute | 200, obligation 718,000 cents, Tax summary shows the figures | pass |

Found during the run and fixed: the APITC "room limited by 071 / 074" warning fired whenever 071
or 074 narrowed the room, even for a tiny claim. It now fires only when the claim would exceed
the deductible room.

Not covered: the prior-year roll-forward over two real years, review sign-off, T183 and payload
generation, the paper print view. Screenshots 01-05 are in this folder.
