# AT1 Sch EDI: rules draft (derived from AuraTax)

Chapter-3-style table built from AuraTax's line dictionary, rule flags, calculator formulas and validator
messages. **Not a primary source.** Every statement names its AuraTax source in the Basis column.

**Schedule-level checks:**

- (warning) You have indicated that it is an amended return, you must provide description of changes at line ⟨field073.code⟩.
- (warning) Description of changes at line ⟨field073.code⟩ is only relevant for amended return.
- (warning) Description of changes at line ⟨field073.code⟩ must not exceed 100 characters.

| Line | Name | Type | Length | +/- | M/O/X | Business rule (derived) | Basis |
|---|---|---|---|---|---|---|---|
| 001 | Software Certification Code (SCC) | AN | 1/6 |  | — | Check (warning): Software certification code at line ⟨field.code⟩ must be the same as the software approval code at line 005 of form 000 | validator EDI.ts·001 |
| 011 | Web service version | AN | 1/100 |  | — | — |  |
| 013 | Software version | AN | 1/100 |  | — | — |  |
| 015 | Software serial number | AN | 1/100 |  | — | — |  |
| 017 | Third Party Service Provider Indicator | N | 1 | + | M | Rule: Required<br>Check (warning): There must be an entry at line(s) ⟨empty.join(', ')⟩ when entry at line ⟨field.code⟩ is YES(1) | rule flags (extras); validator EDI.ts·017 |
| 019 | Organization legal name | AN | 1/70 |  | — | — |  |
| 021 | Organization operating name | AN | 1/70 |  | — | — |  |
| 023 | Type of organization | A |  |  | — | — |  |
| 031 | Contact name (First name) | AN | 1/35 |  | M | Rule: Required | rule flags (extras) |
| 033 | Contact name (Last name) | AN | 1/35 |  | M | Rule: Required | rule flags (extras) |
| 035 | Position | AN | 1/40 |  | M | Rule: Required | rule flags (extras) |
| 037 | Telephone number | N | 10/15 |  | M | Rule: Required<br>Rule: Format: PHONE_NUMBER | rule flags (extras) |
| 039 | Fax number | N | 10/15 |  | — | Rule: Format: PHONE_NUMBER | rule flags (extras) |
| 041 | E-mail address | AN | 5/50 |  | M | Rule: Required<br>Check (warning): You must enter a valid email address at line ⟨field.code⟩ | rule flags (extras); validator EDI.ts·041 |
| 051 | Address (Line 1) | AN | 1/35 |  | — | — |  |
| 053 | Address (Line 2) | AN | 1/35 |  | — | — |  |
| 055 | City/Town | AN | 1/35 |  | — | — |  |
| 057 | Province/State | A | 2 |  | — | Check (warning): Line ⟨field.code⟩ must be a valid {kind, select, province {province} other {state}} code of the country at line 061 (⟨(((('' if ((line 061 = blank) or (line 061 = null)), else line 061.trim())).toUpperCase()))⟩)<br>Check (warning): Line ⟨field.code⟩ must be blank when the country at line 061 is not CA or US | validator EDI.ts·057 |
| 059 | Postal or Zip Code | AN | 5/9 |  | — | Check (warning): (t('app.at1.common.postalCodeFormat', {line: field.code}) if ((((('' if ((line 061 = blank) or (line 061 = null)), else line 061.trim())).toUpperCase())) = 'CA'), else t('app.at1.common.zipCodeFormat', {line: field.code}))<br>Check (warning): Line ⟨field.code⟩ must be blank when the country at line 061 is not CA or US | validator EDI.ts·059 |
| 061 | Country | A | 2 |  | — | — |  |
| 071 | Amended return indicator | N | 1 |  | — | — |  |
| 073 | Description of changes | AN | 1-100 |  | — | — |  |
