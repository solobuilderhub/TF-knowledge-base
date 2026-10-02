Source: AT1-Chapter3-2026.4.pdf, section 3.3.14 "Error Messages", verified against PDF pages 242-244 (printed footers "Page 3-242" through "Page 3-244").

# AT1 NetFile — Error Messages Catalog (full 3.3.14 table)

> Fidelity note: the `AT1-Chapter3-2026.4-full.txt` pdftotext extraction **completely scrambles this
> table** — it interleaves the "Number" column of one row with the "Value" text of a different row
> and the "Description" text of a third (a three-column layout pdftotext's reading-order heuristic
> can't reconstruct). Every row below was transcribed directly from the rendered PDF page images,
> not from the .txt file. Do not trust the .txt extraction for this table under any circumstances.

Per the "Important Note to Software Developers" (section 3.1.1) at the front of the document:

> "Changes for Version 2026.4: Since release 2026.3 ... Additions to Section 3.3.14 Error
> messages"

The source PDF itself highlights (yellow background) the rows/cells that appear to be the new
additions for this release. Those rows are marked **[NEW in 2026.4 — highlighted in source PDF]**
below; this is a direct visual signal from the document, not an inference from a diff. A separate
version-diff pass should still confirm this against the 2026.3 spec if one is available.

Columns: **Number | Value (message text shown to the end user) | Description (internal
explanation)**.

| Number | Value | Description |
|---|---|---|
| 10001 | The system is currently not available. Please try again later. | System down for maintenance. |
| 10010 | Return format is invalid. Please contact the developer of your software. | Return XML is invalid or not formatted properly. Text will come from the XSD validator. |
| 10020 | Return is missing one or more mandatory line items. Please contact the developer of your software. | Return XML is missing line items deemed mandatory for all filers. This includes: CAN (AT1 Line 034); **TYB (AT1 Line 036)** *[NEW in 2026.4 — highlighted in source PDF]*; TYE (AT1 Line 037); the mandatory line items in Section 3.3.6 EDI Schedule Listing; **Date (AT1 line 101)** *[NEW in 2026.4]*; **Telephone number (AT1 line 103)** *[NEW in 2026.4]*; **Authorized email (AT1 line 105)** *[NEW in 2026.4]* |
| 10025 | Return is missing one or more third party service provider mandatory line items. Please contact the developer of your software | Return XML is missing line items deemed mandatory for third party service provider as indicated in Section 3.3.6 EDI Schedule Listing. This includes conditional mandatory items. For example, if the Third Party Service Indicator (line 017) is set to '1', then Organization Legal Name (line 019) must be included in the XML file. If the Country (line 061) is set to 'CA', then Province and Postal Code (lines 057 and 059) must be included in the XML file. |
| 10030 | This return contains duplicate line items. Please contact the developer of your software. | Return contains duplicate line items. |
| 10050 | This return is missing required schedules. Both schedules '000' and 'EDI' must be submitted. Please contact the developer of your software. | Return must include both schedules '000' and 'EDI'. |
| 10055 | This return contains duplicates for schedule xxx. Please contact the developer of your software. | Return must not contain duplicate schedules. |
| 10060 | Schedule {0} line item {1} contains invalid character. Please verify the filer details or contact your software vendor. | Return must not contain invalid characters. See section 3.2.1.18 for listing of allowable characters. |
| 20010 | Your software is Invalid. Please contact the developer of your software. | Software Certification Code is expired or invalid or not matched to AT1 Line 005. |
| 20011 | Web Service Version must be provided. Please contact the developer of your software. | Web Service Version is mandatory. |
| 20012 | Software Version must be provided. Please contact the developer of your software. | Software Version is mandatory. |
| 20013 | Software Serial Number must be provided. Please contact the developer of your software. | Software Serial Number is mandatory. |
| 20015 | Your software is not certified to submit a return with this taxation year end. Please verify taxation year end on AT1 Line 037. If the taxation year end is correct, please contact the developer of your software. | The TYE is not within the range of taxation year end certified under the specific Software Certification Code. |
| 20020 | Your software is not certified to submit amended returns | Software Certification Code is invalid for amended returns. |
| 20030 | The Alberta Corporate Account Number format is invalid. Please ensure a 9 or 10 digit number is supplied for AT1 Line 034. | Invalid Corporate Account Number format |
| 20035 | The Alberta Corporate Account Number does not exist on Tax and Revenue Administration's database. Please verify account number on AT1 Line 034. | Invalid Corporate Account Number |
| 20040 | The Taxation Year End format is invalid. Please ensure AT1 Line 037 is in YYYYMMDD format. | Invalid Tax Year End format |
| 20045 | The Taxation Year End cannot be in the future. Please verify taxation year end on AT1 Line 037. | Future-dated Tax Year End |
| 20050 | This return cannot be accepted because a return with the same Alberta Corporate Account Number and Taxation Year End has already been filed and this return is not an amendment. | CAN / Tax Year End Date combination has previously been submitted (duplicate submission) and this return is not an Amendment. (EDI Line 071 = "1"). Duplicate submission of amended returns will also trigger this error message. |
| 20052 | This return cannot be accepted because a return with the same Alberta Corporate Account Number and Taxation Year End is in progress. | Corporate Account Number/ Taxation Year End Date combination has previously been submitted (duplicate submission). |
| 20055 | This return contains Schedule(s) XXXX which cannot be submitted electronically. Please submit the return and all the schedule(s) in paper format to Tax and Revenue Administration, 9811-109 St, Edmonton AB, T5K 2L5, or fax to 780-427-0348. | Invalid schedule(s) for the SCC submitted. XXXX = comma-delimited list of invalid schedules (13, 15, etc.) |
| 20060 | For taxation year end before October 1, 2013, returns with income reconciliation schedules (12-21) cannot be submitted electronically. Please submit the return and all the schedule(s) in paper format to Tax and Revenue Administration, 9811-109 St, Edmonton AB, T5K 2L5, or fax to 780-427-0348. | Invalid income reconciliation schedule(s) for the SCC submitted. |
| 20065 | Third Party Service Provider Indicator is missing or invalid. Please verify filer details. Third Party Service Provider Indicator must be 1 (for Yes) or 2 (for No). | Third Party Service Provider Indicator must be "1"or "2" (1 = yes; 2= no) |
| 20070 | Organization Legal Name is invalid. Please verify filer details. Organization Legal Name must not exceed 70 characters and must be supplied for third party service provider. | Organizational Legal Name for third party service provider only, must be within maximum 70 characters. |
| 20075 | Organization Operating Name is invalid. Please verify filer details. Organization Operating Name must not exceed 70 characters. | Organization Operating Name must be within maximum 70 characters. |
| 20080 | Type of Organization is invalid. Please verify filer details. Type of Organization must be CORPORATION, PARTNERSHIP, or INDIVIDUAL. | Organization Type mandatory; must be "CORPORATION", "PARTNERSHIP", or "INDIVIDUAL". |
| 20085 | Contact First Name is invalid. Please verify filer details. Contact First Name must be provided and must not exceed 35 characters. | Contact First Name mandatory; must be within maximum 35 characters. |
| 20090 | Contact Last Name is invalid. Please verify filer details. Contact Last Name must be provided and must not exceed 35 characters. | Contact Last Name mandatory; must be within maximum 35 characters. |
| 20095 | Position is invalid. Please verify filer details. Position must be provided and must not exceed 40 characters. | Position mandatory; must be within maximum 40 characters. |
| 20100 | Phone Number is invalid. Please verify filer details. Phone Number must be provided, and must be minimum 10 digits and maximum 15 digits. | Phone Number mandatory; must be minimum 10 digits maximum 15 digits numeric. |
| 20105 | Fax Number is invalid. Please verify filer details. Fax Number must be minimum 10 digits and maximum 15 digits. | Fax Number must be minimum 10 digits maximum 15 digits numeric. |
| 20110 | Email Address is invalid. Please verify filer details. Email Address in valid format must be provided and must not exceed 50 characters. | Email Address mandatory; must be valid format and within maximum 50 characters. |
| 20115 | Address Line 1 is invalid. Please verify filer details. Address Line 1 must be provided, and must not exceed 35 characters. | Address Line 1 mandatory; must be within maximum 35 characters. |
| 20120 | Address Line 2 is invalid. Please verify filer details. Address Line 2 cannot be the same as Address Line 1, and must not exceed 35 characters. | Address Line 2 cannot duplicate Address Line 1 and must be within maximum 35 characters. |
| 20125 | City is invalid. Please verify filer details. City must be provided and must not exceed 35 characters. | City mandatory; must be within maximum 35 characters. |
| 20130 | Province is invalid. Please verify filer details. The province/state does not match the country. Leave Province blank if Country is not Canada or US. | Valid value from province table if country is US or Canada; otherwise leave blank. |
| 20135 | Postal Code is invalid. Please verify filer details. The Postal Code must be in proper Canadian (A9A 9A9) or US (5 digits or 9 digits) format. Leave Postal Code blank if country is not Canada or US. | Postal Code must be in proper Canadian (A9A 9A9) or US (5 digits or 9 digits) format. For any other country the field must be blank. |
| 20140 | Country is invalid. Please verify filer details. Country must be provided and must be in a valid two character code accepted by Canada Post. | Country mandatory; must be valid value from country table. |
| 20145 | Contains invalid characters. Please verify the filer details or contact your software vendor. | Character must be a valid value from ASCII Codes allowable for Alberta (section 3.2.1.18). |
| 20150 | Description of Changes is provided. Amended Return Indicator must = 1 | If Description of Changes is provided, the Amended Return Indicator must equal 1. |
| 20155 | Amended Return Indicator = 1, Description of Changes must be provided and must not exceed 100 characters. | If Amended Return Indicator equals "1", Description of Changes is mandatory and must be within maximum 100 characters |
| 20160 | Amended Return Indicator=1, However no prior returns has been received for this CAN &TYE. | CAN / Tax Year End Date combination has not been previously assessed. |
| 20165 | The date format is invalid. Please ensure is in YYYYMMDD format. | Invalid date format. |
| 20170 | The Taxation Year Beginning format is invalid. Please ensure AT1 Line 036 is in YYYYMMDD format. | Invalid Tax Year Beginning format | **[NEW in 2026.4 — entire row highlighted in source PDF]**

This is the complete 3.3.14 table as printed (10001 through 20170 inclusive) — nothing was
truncated or summarized. The table ends at 20170; section 3.3.15 (WSDL) begins immediately
after on the next printed page.

## Observations for a version-diff pass

Rows/cells visually highlighted (yellow) in the source PDF, indicating likely additions since
release 2026.3:
- **10020** description — three added bullet lines: "Date (AT1 line 101)", "Telephone number (AT1
  line 103)", "Authorized email (AT1 line 105)", plus "TYB (AT1 Line 036)" also appears highlighted.
- **20170** — the entire row (Number, Value, Description) is highlighted, i.e. this looks like a wholly
  new error code added in 2026.4 for validating AT1 Line 036 (Taxation Year Beginning) format.

This lines up with the two other "Changes for Version 2026.4" bullets in section 3.1.1 ("AT1 field
103 has been revised to be able to accept international phone numbers"; new AT1 Line 036 /
Taxation Year Beginning references) — i.e. the new/changed line references (036, 101, 103, 105)
match fields that were evidently touched elsewhere in this release. A true diff against the
2026.3 PDF would be needed to fully confirm which of 10001-20165 (if any) also changed wording
without a highlight; this pass only reports what the document itself visually flags.

## Related

- [./01-netfile-transmission.md](./01-netfile-transmission.md) — endpoints, XML/XSD, WSDL, SOAP samples, business-rule processing order
- [./00-index.md](./00-index.md) — knowledge-base index (not yet created)
