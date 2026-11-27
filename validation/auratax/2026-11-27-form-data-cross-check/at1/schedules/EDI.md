# Sch EDI: Electronic Data Interchange

From AuraTax 2.3.33, `fixtures/at1/specs/EDI.json` and `extras/EDI.json`. Not a primary source; check every rule against the published form.

## Lines

### (untitled section)

| Line | Caption | Type | Kind | From | To | Rules |
|---|---|---|---|---|---|---|
| 001 | Software Certification Code (SCC) | AN | calculated |  |  |  |
| 011 | Web service version | AN | calculated |  |  |  |
| 013 | Software version | AN | calculated |  |  |  |
| 015 | Software serial number | AN | calculated |  |  |  |
| 017 | Third Party Service Provider Indicator | N | input |  |  | Required |
| 019 | Organization legal name | AN | input |  |  |  |
| 021 | Organization operating name | AN | input |  |  |  |
| 023 | Type of organization | A | input |  |  |  |
| 031 | Contact name (First name) | AN | input |  |  | Required |
| 033 | Contact name (Last name) | AN | input |  |  | Required |
| 035 | Position | AN | input |  |  | Required |
| 037 | Telephone number | N | input |  |  | Required<br>Format: PHONE_NUMBER |
| 039 | Fax number | N | input |  |  | Format: PHONE_NUMBER |
| 041 | E-mail address | AN | input |  |  | Required |
| 051 | Address (Line 1) | AN | input |  |  |  |
| 053 | Address (Line 2) | AN | input |  |  |  |
| 055 | City/Town | AN | input |  |  |  |
| 057 | Province/State | A | input |  |  |  |
| 059 | Postal or Zip Code | AN | input |  |  |  |
| 061 | Country | A | input |  |  |  |
| 071 | Amended return indicator | N | input |  |  |  |
| 073 | Description of changes | AN | input |  |  |  |
