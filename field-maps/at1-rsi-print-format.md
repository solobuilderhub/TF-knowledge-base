# Field map — the AT1 RSI print format

**Source:** TRA Net File specification §3.2.1.1 – §3.2.1.19, in
`../sources/tra-spec/AT1-Chapter3-2025.2-full.txt`.

**Status:** implemented.
`packages/ca-tax/src/t2/at1/filing/at1-rsi-renderer.ts`, 24 tests in
`tests/at1-rsi-renderer.test.ts` asserted against the specification's own worked
examples.

## Two filing formats, certified separately

| | Net File | RSI |
|---|---|---|
| Medium | XML over SOAP | fixed-layout text, printed to paper |
| Line item id | **9 characters** | **11 characters** — `##` + the same nine digits |
| Certification | requested separately | requested separately |
| M/O/X classification | shared | shared |
| Everything else | — | — |

The specification is explicit: *"Software developers will request approval of AT1
Net File format separately from AT1 RSI format."* Passing one says nothing about
the other.

The nine digits are the same in both: **Schedule ID (3) + Field ID (3) + Occurrence
ID (3)**. Occurrence defaults to `001` and only varies where a schedule has
repeating rows.

## The layout

```
##AT1  RETURN  AND  SCHEDULE  INFORMATION
##CAN     1234567890
##TYE     19991231
##PAGE     1  of  4  123456  Alberta  Corporation
##000011001     Field  Atkinson  Perraton  Meyers
Norris  Penny  Winspear  McNicol  Barristers  and
Solicitors
##000012001     Suite  1090,  Edmonton  Place
##000014001     Edmonton
##000015001     AB
```

| Rule | § |
|---|---|
| `##` + nine digits, **no spacing between the eleven characters** | 3.2.1.5 |
| **Five spaces** between the line item id and the value | 3.2.1.5 |
| **Two spaces** between distinct words in an alpha/alphanumeric value | 3.2.1.5 |
| **No spaces** between digits in a numeric value | 3.2.1.5 |
| Line items in **numeric order** within a schedule | 3.2.1.5 |
| A line item needs **both** an id and a value to be printed | 3.2.1.5 |
| Wrapped lines start at the **left margin**; no words broken; no end-of-line hyphens | 3.2.1.5 |
| A line item must **not** span two pages | 3.2.1.17 |
| Header on **every** page; **no footer** | 3.2.1.12 / 3.2.1.13 |

## The rules that catch a naive implementation

### Negatives use `**`, never a minus sign

> No brackets, nor minus signs are to be used to indicate negative values; use `**`
> to indicate a negative value.

`**7500` is negative seven thousand five hundred. No space between the marker and
the digits. Any ordinary number formatter gets this wrong, and it is the most
distinctive rule in the format.

### Dollar values carry nothing but digits

`$100,000.45` prints as `100000`. The specification names every form it rejects:
*"Do not print $100000.45, nor $100,000, nor 100,000, nor 100:000, nor 100;000."*
No decimals except in percentage fields.

### The doubled interword spacing is NOT part of the field length

> When referring to the Software Certification Manual in regard to field length, do
> not add the additional interword spaces to the field length that is defined in
> the Cross-reference Tables. This additional spacing requirement is strictly for
> the RSI output.

So a value that fits its declared length still fits after doubling. Validating the
*rendered* string against the cross-reference length would wrongly reject it.

### The header is four lines, not three

§3.2.1.12 opens with *"The Header is comprised of three lines as follows: CAN, TYE
and PAGE"* — and then describes **four**, the first being the title line, and the
sample confirms four. The prose undercounts; the worked example is right. Where the
two disagree, follow the example.

### The date format is exact

`yyyymmdd` and nothing else — the specification lists `10/31/00`, `31/10/00`,
`Oct 31 2000` and `31-Oct-00` as rejected.

## Not implemented here

Paper stock, portrait orientation, 1.5-line leading and normal kerning
(§3.2.1.3, §3.2.1.4, §3.2.1.11) belong to whatever prints the document, not to the
renderer. Same for pagination: `renderAt1Rsi` takes a page number and total, but
does not decide where pages break, and the rule that **a line item must not span
two pages** has to be honoured by the paginator.

The allowable character set (§3.2.1.18) is a long list including accented Latin and
various symbols. Not enforced — worth adding if a payload is ever rejected for a
stray character, but the input is corporate names and addresses, which rarely
stray outside it.
