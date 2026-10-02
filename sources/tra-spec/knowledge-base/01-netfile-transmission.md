Source: AT1-Chapter3-2026.4.pdf, section 3.3 "AT1 Net File Return Format" (3.3.1-3.3.19), verified against PDF pages 232-253 (printed footer "Page 3-232" through "Page 3-253").

# AT1 NetFile Transmission — Web Service, Endpoints, Schedules, XML/XSD, Errors, SOAP Samples

> Cross-check note: this file was built by rendering the actual PDF pages to images and reading
> them directly, **not** from the `AT1-Chapter3-2026.4-full.txt` pdftotext extraction, because the
> tables in this section are two/three-column layouts that pdftotext scrambles badly (see fidelity
> notes inline and in the final report).

## 3.3.1 Introduction

Treasury Board and Finance (TBF), Tax and Revenue Administration (TRA) Division, publishes a
web service allowing certified vendors to build a client that electronically submits Alberta
Corporate Income Tax Returns (AT1). All corporations are eligible to NetFile except:

- Taxation years ending prior to 2008
- Taxation years ending after 2007 but prior to October 1, 2013, for returns containing Schedules 12 to 21
- ~~Amended returns~~ — this bullet is struck through in the source PDF (i.e. the restriction has
  been lifted). Section 3.1.1 (General Information) confirms: "Amended returns can be filed with
  Treasury Board and Finance in AT1 RSI format or by net file."

## 3.3.2 Glossary and Acronyms Used

| Acronym | Definition |
|---|---|
| TBF | Treasury Board and Finance |
| CAN | Corporate Account Number |
| CIT | Corporate Income Tax |
| CRA | Canada Revenue Agency |
| EDI | Electronic Data Interchange |
| GOA | Government Of Alberta |
| HTTP | Hypertext Transfer Protocol |
| HTTPS | Hypertext Transfer Protocol Secure |
| SCC | Software Certification Code |
| SOAP | Simple Object Access Protocol |
| TRA | Tax and Revenue Administration |
| TYE | Tax Year End |
| WSDL | Web Services Description Language |
| XML | Extensible Markup Language |
| XSD | XML Schema Definition |

## 3.3.3 Web Services Overview

> "The submission of an Alberta Net File Return will be performed through a TBF-published web
> service. The vendor software will conform to the published WSDL for method use, and the
> payload of the SOAP envelopes must conform to the published XSD as well as various business
> rules as identified in the section below."

Protocol/transport: **SOAP 1.2** — confirmed by the WSDL binding (`soap12:binding transport=
"http://www.w3.org/2003/05/soap/bindings/HTTP/"`, `style="document"`, port name
`CITReturnFilingSoap12HttpPort`). Payload is `use="literal"` on both input and output.

> "Failure to adhere to the published software specifications may result in inability to transmit
> data to AF, errors passing the structure or business rule validations, and ultimately the
> inability to file an Alberta Net File Return. Error messages returned from the web service are
> designed to be thorough and informative to the software vendor to ease integration and provide
> as much feedback as possible to the end client."
>
> "It is highly recommended the software always validate the generated XML payload against the
> XSD before submitting to the AF web services; this will reduce failed returns and unnecessary
> consumption of the web services."

("AF" = Alberta Finance, used interchangeably with TBF/TRA in this doc.)

## 3.3.4 Test Environment Overview — **THE ENDPOINT**

> "A test environment will be made available to the vendor for development purposes as well as
> software certification. The only difference between the test environment and production will be
> the address of the web service."

**Test-site (SOFTWARE CERTIFICATION) endpoint URL, quoted verbatim from the PDF:**

```
https://citsoftwarecert.finance.gov.ab.ca/CITNetFile-PublicWebServices-context-root/CITReturnFilingSoap12HttpPort?WSDL
```

There is **no fixed production URL published in this document**. Per 3.3.4.1: "After successful
certification, the vendor will be provided with a production software certification code **and
URL** that will become part of their return submissions." I.e. the production endpoint is issued
directly to the vendor by TRA at certification time, not printed in the spec. The WSDL and SOAP
sample in this document use a generic placeholder `https://SERVICE.URL:443/...` / `https://URL-
OF-SERVICE.AB.CA/...` for exactly this reason — it is not a real host name, it's a template.

The test environment is supported: **08:15 to 16:30 Mountain Standard Time (MST), Monday to
Friday** (government working hours).

### 3.3.4.1 Software Certification Process and Software Certification Code

- Bi-annual software certification process. Vendor contacts TRA at
  `TBF.citsoftwarecertification@gov.ab.ca` when ready for certification testing.
- A test-environment Software Certification Code (SCC) is issued for the duration of dev
  testing/certification.
- After successful certification, vendor receives a **production SCC and production URL**.

## 3.3.5 Service Availability

> "The current service availability for the production environment is from **07:00 to 24:00**
> Mountain Standard Time (MST). Daily scheduled down time for system maintenance is between
> **24:01 to 06:59 MST** and on **Sunday from 07:00 to 17:00 MST**. The service availability may
> increase in the future."

ECOM Help Desk (operated by TRA, technical support for web/electronic applications for all TRA
external clients):
- Phone: **780-427-9424**
- Email: **ecomhelpdesk@gov.ab.ca**
- Hours: **08:15-12:00 and 13:00-16:30 MST, Monday to Friday**, except government holidays.
  After-hours: voicemail.

## 3.3.6 EDI Schedule Listing

**Important — this section is NOT a table of every AT1 schedule with a Mandatory/Conditional/
Optional NetFile flag.** (That was the expected shape going in; the actual content differs.) It is
the field-level layout ("SCHEDULE/FORM/LINE" mapping table, same style as the AT1 RSI
cross-reference tables in section 3.2.3) for **one new schedule called "Schedule EDI — Electronic
Data Interchange"**, which every NetFile submission must include alongside the numbered AT1
schedules. Quote: "A new schedule has been introduced for Alberta Net File called the EDI
schedule. This schedule contains many important and mandatory elements, including the
software certification code, software details, and filer details."

### 3.3.6.1 Schedule EDI — full field table

Columns: Line Code | Line Name | Type | Length | +/- | M(andatory)/O(ptional)/X(conditional) | Business Rules and Comments

| Line Code | Line Name | Type | Length | M/O/X | Business Rules and Comments |
|---|---|---|---|---|---|
| 001 | Software Certification Code (SCC) | AN | 1/6 | M | The code provided to you by Treasury Board and Finance after successfully passing the software certification process. (must be equal to Schedule 000 line 005) |
| 011 | Web service version | AN | 1/100 | M | Provided during the software certification process; indicates the version of the web services you are consuming. |
| 013 | Software version | AN | 1/100 | M | Major and minor version number of the submitting software. Helps trace issues from a minor version update. |
| 015 | Software serial number | AN | 1/100 | M | Serial number of the submitting software; may assist tracing fraudulent or excessive returns. |
| 017 | Third Party Service Provider Indicator | N | 1 (+) | M | Must be 1 (yes) or 2 (no); indicates if the filer is filing on behalf of a corporation as a third-party service provider. |
| 019 | Organization legal name | AN | 1/70 | X | Mandatory if line 017 = "1" |
| 021 | Organization operating name | AN | 1/70 | O | — |
| 023 | Type of organization | A | — | X | Mandatory if line 017 = "1". Must be "CORPORATION", "PARTNERSHIP" or "INDIVIDUAL" |
| 031 | Contact name (First name) | AN | 1/35 | M | — |
| 033 | Contact name (Last name) | AN | 1/35 | M | — |
| 035 | Position | AN | 1/40 | M | — |
| 037 | Telephone number | N | 10/15 | M | — |
| 039 | Fax number | N | 10/15 | O | — |
| 041 | E-mail address | AN | 5/50 | M | Must be valid-formatted; regex: `^[a-z0-9!#$%&''*+/=?^_\`{\|}~-]+(\.[a-z0-9!#$%&''*+/=?^_\`{\|}~-]+)*@([a-z0-9]([a-z0-9-]*[a-z0-9])?\.)+([A-Z]{1,6})$` plus accented chars `Â À Ç É Ê Ë È Î Ï Ô Ö Û Ü Ù â à ç é ê ë è î ï ô ö û ü ù` |
| 051 | Address (Line 1) | AN | 1/35 | X | Mandatory if line 017 = "1" |
| 053 | Address (Line 2) | AN | 1/35 | O | — |
| 055 | City/Town | AN | 1/35 | X | Mandatory if line 017 = "1" |
| 057 | Province/State | A | 2 | X | Mandatory if line 017 = "1". Checked only if country is 'CA' or 'US'. See section 3.4 for valid codes. |
| 059 | Postal or Zip Code | AN | 5/9 | X | Mandatory if line 017 = "1". If country 'CA', format A9A 9A9. If 'US', 5 or 9 digit numeric. For any other country, field must be blank. |
| 061 | Country | A | 2 | X | Mandatory if line 017 = "1". Must be valid country code — see section 3.4. |
| 071 | Amended return indicator | N | 1 | O | 1 = Yes. If there is an entry at line 073, this line must be "1"; indicates if the return is an amended return. |
| 073 | Description of changes | AN | 1-100 | X | Mandatory if line 071 = "1". If line 071 does not equal 1 or Yes, line 073 should not be included on the XML. |

Note: this table's Line Code numbering (`EDI001001`, `EDI011001`, ... `EDI073001`) is used as the
`LineItemID` attribute prefix `EDI` in the actual XML (see 3.3.7 samples below), e.g.
`<Value LineItemID="EDI001001">AB1234</Value>`.

**Because it is NOT the schedule-requirement table originally expected**, note explicitly:
this document does not, in section 3.3, provide a consolidated Mandatory/Conditional/Optional
flag list for AT1 schedules 000-029 themselves. Per-schedule mandatory/conditional/optional
flags for the numbered AT1 schedules live in the section 3.2.3 cross-reference tables (per-
schedule, elsewhere in the document, outside this agent's assigned section).

## 3.3.7 Return XML Format

> "Below is a sample XML file that represents the payload of the SOAP envelope. The file is
> structured mainly around a series of repeating schedules that contain N numbers of line items.
> Note that the comments in the file are for illustrative purposes only and are not required."
>
> "The mandatory order of the XML file is **Header, Schedule in ascending schedule number order,
> EDI schedule and Footer**."
>
> "The first sample illustrates a file with all mandatory and optional elements provided in the EDI
> schedule. The second example shows a return with the optional line items left out of the XML.
> Both files are valid. The software vendor may determine if they wish to provide empty tag sets
> (`<tag></tag>` or `<tag/>`) for empty optional elements or just omit the line altogether."

Root structure (from Sample 1, condensed):

```xml
<?xml version="1.0" encoding="ISO-8859-1"?>
<ReturnSubmission xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
xsi:noNamespaceSchemaLocation="AlbertaCorporateIncomeTaxReturn.xsd">
    <Return>
        <ProgramCode>01</ProgramCode>
        <Schedule Number="000">
            <Value LineItemID="000005001">AB1234</Value>    <!-- SCC -->
            <Value LineItemID="000010001">Test Case 1 Legal Name</Value>
            ...
        </Schedule>
        <Schedule Number="001"> ... </Schedule>
        <Schedule Number="002"> ... </Schedule>
        <Schedule Number="EDI">
            <Value LineItemID="EDI001001">AB1234</Value>          <!--SCC -->
            <Value LineItemID="EDI011001">0.0.1</Value>            <!--WebServiceVersion -->
            <Value LineItemID="EDI013001">1.0.02</Value>           <!--SoftwareVersion -->
            <Value LineItemID="EDI015001">SR_123456790</Value>     <!--SerialNumber -->
            <Value LineItemID="EDI017001">1</Value>                <!--ThirdPartyIndicator -->
            <Value LineItemID="EDI019001">Service Provider</Value> <!--LegalName -->
            ... (021/023/031/033/035/037/039/041/051/053/055/057/059/061)
        </Schedule>
    </Return>
</ReturnSubmission>
```

Notable encoding detail: `encoding="ISO-8859-1"` in the sample XML declaration (not UTF-8),
despite the SOAP HTTP `Content-Type` header later specifying `charset=UTF-8` (see 3.3.16) — this
is an internal inconsistency in the sample document itself, worth flagging to the implementer.

Root schema filename referenced via `xsi:noNamespaceSchemaLocation`:
**`AlbertaCorporateIncomeTaxReturn.xsd`**.

Sample 2 ("All Mandatory and no Optional Elements") shows that when `EDI017001`
(ThirdPartyIndicator) = `2` (No), only the mandatory EDI lines (001, 011, 013, 015, 017, 031, 033,
035, 037, 041) are required — all the conditional/"X"-flagged third-party fields (019, 021, 023, 039,
051, 053, 055, 057, 059, 061) are omitted.

## 3.3.8 Return XSD

The XSD is embedded inline in full (not just referenced by filename). Header comment inside the
schema:

```
Produced by Treasury Board and Finance / Tax and Revenue Administration
for Alberta Corprate Income Tax Returns.        [sic — "Corprate" typo in source]

Version Number 0.09
November 19, 2010
```

(Note: the XSD's own internal version/date stamp — "0.09 / November 19, 2010" — is stale
relative to the 2026.4 document version; the XSD structure itself has evidently not needed a
version bump since 2010 even though the doc chapter has iterated many times since.)

Full schema (root element `ReturnSubmission`):

```xml
<?xml version="1.0" encoding="utf-8"?>
<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema" xmlns:wmh="http://www.wmhelp.com/2003/eGenerator"
elementFormDefault="qualified">
  <xs:element name="ReturnSubmission">
    <xs:complexType>
      <xs:sequence>
        <xs:element ref="Return"/>
      </xs:sequence>
    </xs:complexType>
  </xs:element>
  <xs:element name="Return">
    <xs:complexType>
      <xs:sequence>
        <xs:element ref="ProgramCode"/>
        <xs:element ref="Schedule" maxOccurs="unbounded"/>
      </xs:sequence>
    </xs:complexType>
  </xs:element>
  <xs:element name="ProgramCode" type="ProgramCode"/>
  <xs:element name="Schedule">
    <xs:complexType>
      <xs:sequence>
        <xs:element ref="Value" maxOccurs="unbounded"/>
      </xs:sequence>
      <xs:attribute name="Number" type="ScheduleNumber" use="required"/>
    </xs:complexType>
  </xs:element>

  <xs:element name="Value">
    <xs:complexType>
      <xs:simpleContent>
        <xs:extension base="ValueString">
          <xs:attribute name="LineItemID" type="LineItemID" use="required"/>
        </xs:extension>
      </xs:simpleContent>
    </xs:complexType>
  </xs:element>

  <xs:simpleType name="ProgramCode">
    <xs:restriction base="xs:string">
      <xs:length value="2"/>
      <xs:pattern value="[0-9]{2}"/>
    </xs:restriction>
  </xs:simpleType>

  <xs:simpleType name="LineItemID">
    <xs:restriction base="xs:string">
      <xs:length value="9"/>
      <xs:pattern value="\w{3}[0-9]{6}"/>
    </xs:restriction>
  </xs:simpleType>

  <xs:simpleType name="ValueString">
    <xs:restriction base="xs:string">
      <xs:maxLength value="175"/>
    </xs:restriction>
  </xs:simpleType>

  <xs:simpleType name="ScheduleNumber">
    <xs:restriction base="xs:string">
      <xs:length value="3"/>
      <xs:pattern value="\w{3}"/>
    </xs:restriction>
  </xs:simpleType>
</xs:schema>
```

Key constraints codified by the XSD: `ProgramCode` is exactly 2 digits; `Schedule/@Number` is
exactly 3 word-characters (covers both numeric `"000"`-`"029"` and the literal `"EDI"`);
`Value/@LineItemID` is exactly 9 characters, 3 word-chars + 6 digits (matches `000005001`,
`EDI001001` etc.); `Value` text content max length **175 characters**.

## 3.3.9 Size File Restrictions

> "The maximum size of a single SOAP transmission must not exceed **128 kB**."
>
> "Note: If transmission is larger than file size limit, an HTTP error code **413 (Request Entity Too
> Large)** is sent back to the client as soon as file size limit is reached and connection is broken.
> If the client is in listening mode, it will get the message."

## 3.3.10 Transmission Time Limit

> "The maximum time of a single SOAP transmission must not exceed **60 seconds**."

## 3.3.11 Business Rules and Validation Processing

Validation is staged/sequential — a submission fails at the first stage it violates and processing
stops there (e.g. valid XML but invalid SCC → SCC error returned, processing stops). "A
submission is not considered complete or valid until a confirmation code is returned. No record
of invalid submissions are kept by TRA." Vendors are strongly urged to validate field lengths/
datatypes and the XML against the XSD locally before submitting.

Documented order of processing for a submitted file:

1. **XML Size / Transmission time (transport errors)** — max file size 128 kB; max transmission
   length 60 seconds.
2. **XML Well-Formedness and Validity** — must validate against the XSD (structure + basic
   datatype checks).
3. **Missing Schedules** — at a minimum, schedules **000 and EDI** must be submitted.
4. **Duplicated Schedules** — schedules may not appear more than once in a single submission.
5. **Missing Mandatory Line Items** — CAN (AT1 line 034), Taxation Year End (AT1 line 037), and
   all line items designated 'mandatory' under the EDI Schedule (3.3.6).
6. **Missing Web Service Version** — provided to vendor during certification.
7. **Missing Software Version** — must be updated by vendor per software upgrade.
8. **Missing Software Serial Number** — unique identifier for registrant/submitter/software.
9. **Invalid TYE format** — must be YYYYMMDD.
10. **Future-dated TYE** — TYE cannot be future-dated.
11. **Invalid / Expired SCC or Mismatch of SCCs** — SCC in line `000005001` and `EDI001001`
    must be equal; SCC must be valid for the certified TYE range (example given: SCC "AB1234"
    certified 30 Apr 2011, valid only for TYE between 01 Jan 2011-31 Dec 2011 — a return
    submitted 15 Apr 2011 or with TYE 31 Mar 2012 would both be rejected).
12. **Invalid / Unsupported Schedules Exist** — each SCC is tied to a certified list of schedules
    (example: SCC valid only for schedules 000, 001, 002, 008, EDI — a return including schedule
    009 with that SCC is rejected).
13. **Invalid CAN format** — CAN must be 9 or 10 digits.
14. **Invalid CAN** — CAN must exist in TRA's database.
15. **CAN and TYE combination already exists** — duplicate-return detection; rejects if that CAN/
    TYE combination was ever previously submitted (paper or electronic), including double-
    submission/quick-correction attempts. Once a confirmation number is returned, that CAN/TYE
    combination can never be submitted again via NetFile.
16. **EDI Field Validations** — if EDI line 017 (Third Party Service Provider Indicator) = "1", all
    line items flagged 'conditional' in the EDI Schedule (3.3.6) must be submitted.

## 3.3.12 Declaration Text

> "The following text must be presented to the filer before filing a return. It is mandatory that the
> end user be presented this text per submission through the vendor software. If, upon review of
> the vendor software, it is determined that the disclaimer text was not appropriately presented as
> part of a return submission, AF reserves the right to reject the vendor software during the
> software certification process or revoke the software's certification code, thereby disabling it
> from submitting subsequent returns."
>
> "The text must be presented exactly as below in a manner that cannot by bypassed. The
> submitter must agree to the text through the use of a checkbox or other acknowledgement
> method. Only after agreeing to the declaration text may the software proceed with the
> submission process."

Exact required declaration text (verbatim, heading "Declaration"):

> **Declaration**
>
> This return meets Alberta Corporate Net File eligibility requirements.
>
> I will not attempt to disrupt Alberta Corporate Net File service by uploading files other than an
> eligible Alberta corporate income tax return. If I do, Tax and Revenue Administration (TRA) may
> deny me access to electronic services.
>
> I am an authorized signing officer of the corporation, or, if I am acting on behalf of the
> corporation, an authorized signing officer of the corporation has instructed me to file this
> return.
>
> I certify, or, if filing on behalf of a corporation, an authorized signing officer of the corporation
> has certified, that this electronic return, including schedules, is a true, correct and complete
> return and that the method of computing income for this taxation year is consistent with that of
> the previous taxation year except as specifically disclosed on the return.
>
> ☐ I have read and agree to the above.

## 3.3.13 Successful Filing Messages

> "The '30' messages are standardized for all of the software developers and the messages below
> should be a minimum of what is displayed to the end user. The software developers can include
> any other additional information to be displayed on the messages."

| Number | Value | Description |
|---|---|---|
| 30001 | `<Confirmation Number>` | Confirmation number. |
| 30002 | Return Successfully Filed. | Success message. |
| 30003 | Thank you. Your Alberta Corporate Income Tax Return has been filed. Please print and keep a copy of this confirmation for your records. | Success text. |
| 30004 | `<CAN>` | Alberta Corporation Account Number. |
| 30005 | `<Tax Year End>` | Taxation Year End - value of AT1 line 034 returned by the procedure (see caveat below). |
| 30006 | `<Current Date>` | Receipt Date/TimeStamp - generated by the procedure. |

**Confirms the engine's expectation of codes 30001/30002 — matches the spec exactly.** Note one
internal inconsistency in the spec itself: the 30005 description text says "value of AT1 line 034"
but AT1 line 034 is the Corporate Account Number per 3.3.11 (§5) — Tax Year End is actually AT1
line 037 elsewhere in this same document. The live sample response for 30005 in 3.3.17
(`20100228`) is a date value, consistent with Tax Year End, so the "line 034" in the 30005
description row is almost certainly a copy/paste typo in the source PDF for "line 037" — flagged
as a spec-internal inconsistency, not a transcription error introduced here.

Full 3.3.14 Error Messages catalog is in **[./02-error-messages.md](./02-error-messages.md)**.

## 3.3.15 Web Service Definition Language (WSDL)

"Below is an example of the WSDL at the time of publication of this document."

Service name: `CITReturnFilingService`. Target namespace: `http://cit.tra.fin.goa/`. Operation:
`fileReturn` (portType `CITReturnFiling`). Binding: `CITReturnFilingSoap12HttpPortBinding`
(SOAP 1.2, HTTP transport, document style, literal use). Port: `CITReturnFilingSoap12HttpPort`.

```xml
<definitions targetNamespace="http://cit.tra.fin.goa/" name="CITReturnFilingService" xmlns:soap12="http://schemas.xmlsoap.org/wsdl/soap12/" xmlns:tns="http://cit.tra.fin.goa/" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns="http://schemas.xmlsoap.org/wsdl/">
    <types>
        <xsd:schema>
            <xsd:import namespace="http://goa/tra/fin/cit/CITWebService.wsdl/types/" schemaLocation="https://SERVICE.URL:443/CITNetFile-PublicWebServices-context-root/CITReturnFilingSoap12HttpPort?xsd=1"/>
        </xsd:schema>
        <xsd:schema>
            <xsd:import namespace="http://cit.tra.fin.goa/" schemaLocation="https://SERVICE.URL:443/CITNetFile-PublicWebServices-context-root/CITReturnFilingSoap12HttpPort?xsd=2"/>
        </xsd:schema>
    </types>

    <message name="fileReturn">
        <part name="parameters" element="tns:fileReturn"/>
    </message>
    <message name="fileReturnResponse">
        <part name="parameters" element="tns:fileReturnResponse"/>
    </message>
    <portType name="CITReturnFiling">
        <operation name="fileReturn">
            <input message="tns:fileReturn"/>
            <output message="tns:fileReturnResponse"/>
        </operation>
    </portType>

    <binding name="CITReturnFilingSoap12HttpPortBinding" type="tns:CITReturnFiling">
        <soap12:binding transport="http://www.w3.org/2003/05/soap/bindings/HTTP/" style="document"/>
        <operation name="fileReturn">
            <soap12:operation soapAction=""/>
            <input>
                <soap12:body use="literal"/>
            </input>
            <output>
                <soap12:body use="literal"/>
            </output>
        </operation>
    </binding>

    <service name="CITReturnFilingService">
        <port name="CITReturnFilingSoap12HttpPort" binding="tns:CITReturnFilingSoap12HttpPortBinding">
            <soap12:address location="https://SERVICE.URL:443/CITNetFile-PublicWebServices-context-root/CITReturnFilingSoap12HttpPort"/>
        </port>
    </service>
</definitions>
```

`SERVICE.URL` here is a literal placeholder token in the document (not a real hostname) — for the
actual **test** host, substitute `citsoftwarecert.finance.gov.ab.ca` per 3.3.4. Production host is
vendor-specific and issued at certification (not published in this doc).

## 3.3.16 Sample SOAP filing message

"This is an example of the raw SOAP message that is sent for filing a return. Note that the
payload is denoted by `<!-- RETURN PAYLOAD -->`. The payload will contain the Return XML as
outlined in an earlier section."

```
POST https://URL-OF-SERVICE.AB.CA/CITNetFile-PublicWebServices-context-root/CITReturnFilingSoap12HttpPort HTTP/1.1
Accept-Encoding: gzip,deflate
Content-Type: application/soap+xml;charset=UTF-8
User-Agent: Jakarta Commons-HttpClient/3.1
Host: 111.111.111.111
Content-Length: 4907

<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:cit="http://cit.tra.fin.goa/">
    <soap:Header/>
    <soap:Body>
        <cit:fileReturn>
            <arg0>
                <![CDATA[
                <!--SAMPLE RETURN PAYLOAD-->
                <?xml version="1.0" encoding="ISO-8859-1"?>
                    <ReturnSubmission xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                    xsi:noNamespaceSchemaLocation="AlbertaCorporateIncomeTaxReturn.xsd">
                        <Return>
                            <ProgramCode>01</ProgramCode>
                            <Schedule Number="000">
                                <Value LineItemID="000005001">AB1234</Value>
                                <Value LineItemID="000010001">CORPORATION LEGAL NAME</Value>
                                ...
                            </Schedule>
                            ...
                            <Schedule Number="EDI">
                                <Value LineItemID="EDI001001">AB1234</Value>
                                <Value LineItemID="EDI011001">0.0.1</Value>
                                ...
                            </Schedule>
                        </Return>
                    </ReturnSubmission>
                <!--END OF SAMPLE RETURN PAYLOAD-->
                ]]>
            </arg0>
        </cit:fileReturn>
    </soap:Body>
</soap:Envelope>
```

Key structural fact for validating `apps/server/src/filing/at1-soap-client.ts` against: the entire
`ReturnSubmission` XML document is passed **as a CDATA-wrapped string inside `<arg0>`** under
`<cit:fileReturn>` — it is not inlined as native XML elements of the SOAP body; the operation
argument element name is literally `arg0`.

## 3.3.17 Sample SOAP filing responses

**Sample 1: Response with two errors**

```
HTTP/1.1 200 OK
Date: Thu, 23 Dec 2010 18:55:38 GMT
Transfer-Encoding: chunked
Content-Type: application/soap+xml;charset="utf-8"
X-Powered-By: Servlet/2.5 JSP/2.1

<?xml version='1.0' encoding='UTF-8'?>
<S:Envelope xmlns:S="http://www.w3.org/2003/05/soap-envelope">
    <S:Body>
        <ns3:fileReturnResponse xmlns:ns3="http://cit.tra.fin.goa/"
            xmlns:ns2="http://goa/tra/fin/cit/CITWebService.wsdl/types/">
            <return>
                <ns2:code>20070</ns2:code>
                <ns2:type>Organization Legal Name is invalid. Please verify filer details. Organization Legal Name must not exceed 70 characters and must be supplied for third party service provider.</ns2:type>
            </return>
            <return>
                <ns2:code>20110</ns2:code>
                <ns2:type>Email Address is invalid. Please verify filer details. Email Address in valid format must be provided and must not exceed 50 characters.</ns2:type>
            </return>
        </ns3:fileReturnResponse>
    </S:Body>
</S:Envelope>
```

Note: the HTTP status is **200 OK even when the response body carries business-rule errors** —
error/success discrimination must be done by inspecting the `<return><ns2:code>` values in the
body, not the HTTP status line. Also note: error responses can carry **multiple `<return>`
elements** (multiple simultaneous validation failures reported in one response).

**Sample 2: Response with Success Messages**

```
HTTP/1.1 200 OK
Date: Thu, 23 Dec 2010 19:02:39 GMT
Transfer-Encoding: chunked
Content-Type: application/soap+xml;charset="utf-8"
X-Powered-By: Servlet/2.5 JSP/2.1

<S:Envelope xmlns:S="http://www.w3.org/2003/05/soap-envelope">
    <S:Body>
        <ns3:fileReturnResponse xmlns:ns3="http://cit.tra.fin.goa/"
            xmlns:ns2="http://goa/tra/fin/cit/CITWebService.wsdl/types/">
            <return><ns2:code>30001</ns2:code><ns2:type>505005079123</ns2:type></return>
            <return><ns2:code>30002</ns2:code><ns2:type>Return Successfully Filed.</ns2:type></return>
            <return><ns2:code>30003</ns2:code><ns2:type>Thank you. Your Alberta Corporate Income Tax Return has been filed. Please print and keep a copy of this confirmation for your records.</ns2:type></return>
            <return><ns2:code>30004</ns2:code><ns2:type>123456789</ns2:type></return>
            <return><ns2:code>30005</ns2:code><ns2:type>20100228</ns2:type></return>
            <return><ns2:code>30006</ns2:code><ns2:type>2010/12/23 12:11:55 PM</ns2:type></return>
        </ns3:fileReturnResponse>
    </S:Body>
</S:Envelope>
```

Note the date format for line 30006 in the sample (`2010/12/23 12:11:55 PM`) differs in shape
from the ISO-ish `YYYYMMDD` used elsewhere in the spec (e.g. 30005's `20100228`) — a
consuming client should not assume a single date format across all `30xxx` response codes.

## 3.3.18 Transmission Errors

> "If a submission has been denied due to a functional or technical error, the client must contact
> the software vendor for assistance. If the error has been determined to be on the AF side, the
> software vendor may contact AF to discuss the error. The client shall not contact AF directly for
> resolving filing errors, and as such will be redirected to the software vendor for filing
> assistance."

No network/transport-specific retry or timeout guidance beyond the 128 kB / 60-second limits in
3.3.9/3.3.10 and the HTTP 413 behaviour noted there.

## 3.3.19 Sample Software Screens

Brief note only (not detailed further per task scope): this subsection is a set of illustrative
vendor-software mockup screenshots (macOS-style dialog chrome) — e.g. "Are you filing as a
third party service provider? Yes/No" — showing one possible UI flow for the declaration and
EDI schedule prompts. No new normative facts beyond what's captured in 3.3.6/3.3.12 above.

## Related

- [./02-error-messages.md](./02-error-messages.md) — full 3.3.14 Error Messages catalog
- [./00-index.md](./00-index.md) — knowledge-base index (not yet created)
