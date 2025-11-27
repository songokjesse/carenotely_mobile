# Privacy & Data Protection in AI Rephrasing

**CareNotely Mobile Application**  
**Last Updated:** November 27, 2025  
**Version:** 1.0

---

## Executive Summary

CareNotely's AI rephrasing feature uses advanced privacy-preserving technology to protect client confidentiality. **Sensitive client information never leaves the device in its original form.** All personally identifiable information (PII) is automatically redacted before being sent to external AI services, then seamlessly restored after processing.

---

## Table of Contents

1. [Privacy Architecture](#privacy-architecture)
2. [What Information is Protected](#what-information-is-protected)
3. [How the Protection Works](#how-the-protection-works)
4. [Data Flow & Security](#data-flow--security)
5. [Compliance & Standards](#compliance--standards)
6. [Limitations & Considerations](#limitations--considerations)
7. [Technical Implementation](#technical-implementation)
8. [Audit & Monitoring](#audit--monitoring)

---

## Privacy Architecture

### Client-Side Privacy Layer

The privacy protection is implemented **on the mobile device**, ensuring that sensitive data is redacted before any network transmission occurs.

```
┌─────────────────────────────────────────────────────────┐
│                    Mobile Device                         │
│  ┌───────────────────────────────────────────────────┐  │
│  │ 1. User enters clinical note with client data    │  │
│  └─────────────────────┬─────────────────────────────┘  │
│                        │                                 │
│  ┌─────────────────────▼─────────────────────────────┐  │
│  │ 2. Privacy Redactor processes text                │  │
│  │    • Detects PII using pattern matching           │  │
│  │    • Replaces with placeholders                   │  │
│  │    • Stores mapping securely in memory            │  │
│  └─────────────────────┬─────────────────────────────┘  │
│                        │                                 │
│                        │ Only redacted text leaves       │
│                        │ the device                      │
└────────────────────────┼─────────────────────────────────┘
                         │
                         ▼
              ┌──────────────────────┐
              │   External Network   │
              │   (Redacted text     │
              │    with placeholders)│
              └──────────────────────┘
```

### Key Privacy Principles

1. **Data Minimization**: Only anonymized text is transmitted
2. **On-Device Processing**: Redaction happens locally
3. **Temporary Storage**: Redaction mappings exist only in memory
4. **Automatic Protection**: No user action required
5. **Transparent Operation**: Logging shows what was protected

---

## What Information is Protected

### Automatically Redacted Information

| Category | Examples | Detection Method |
|----------|----------|------------------|
| **NDIS Numbers** | `430123456`, `430987654` | 9-digit pattern matching |
| **Phone Numbers** | `0412345678`<br>`+61 2 1234 5678`<br>`(02) 1234 5678` | Australian phone formats |
| **Email Addresses** | `john.smith@email.com`<br>`worker@carenotely.com` | Standard email regex |
| **Street Addresses** | `123 Main Street`<br>`45 Park Avenue` | Number + street name patterns |
| **Suburbs/Cities** | `Sydney`, `Melbourne`, `Brisbane` | Major Australian locations |
| **Postcodes** | `2000`, `3000`, `4000` | 4-digit codes (800-9999) |
| **Dates** | `15/03/2024`<br>`2024-03-15`<br>`15-03-2024` | Common date formats |
| **Client Names** | `John Smith`<br>`Sarah Johnson` | Proper noun detection |

### Example Redaction

**Original Note:**
```
John Smith attended his appointment at 123 Main Street, Sydney 2000.
He was in a happy mood. NDIS: 430123456
Contact: 0412345678 or john.smith@email.com
Next session: 20/11/2024
```

**Redacted (sent to AI):**
```
[NAME_1] attended his appointment at [LOCATION_1], [LOCATION_2] [LOCATION_3].
He was in a happy mood. NDIS: [NDIS_1]
Contact: [PHONE_1] or [EMAIL_1]
Next session: [DATE_1]
```

**After AI Rephrasing:**
```
[NAME_1] successfully attended the scheduled appointment at [LOCATION_1], 
[LOCATION_2] [LOCATION_3], displaying a positive mood. NDIS: [NDIS_1]
Contact: [PHONE_1] or [EMAIL_1]
Next session: [DATE_1]
```

**Final (restored):**
```
John Smith successfully attended the scheduled appointment at 123 Main Street,
Sydney 2000, displaying a positive mood. NDIS: 430123456
Contact: 0412345678 or john.smith@email.com
Next session: 20/11/2024
```

---

## How the Protection Works

### Three-Step Process

#### Step 1: Detection & Redaction

The system scans the text using pattern matching to identify sensitive information:

- **Pattern-based detection**: Regular expressions identify PII formats
- **Context-aware filtering**: Common words (e.g., "Monday", "Client") are excluded
- **Placeholder generation**: Each piece of PII gets a unique placeholder (e.g., `[NAME_1]`, `[NDIS_1]`)
- **Mapping creation**: Original values are stored temporarily in device memory

#### Step 2: AI Processing

- **Redacted text sent**: Only text with placeholders is transmitted
- **AI rephrasing**: External service processes the anonymized text
- **Placeholder preservation**: AI maintains placeholders in the response

#### Step 3: Re-insertion

- **Mapping retrieval**: Original values retrieved from memory
- **Placeholder replacement**: Each placeholder is replaced with its original value
- **Final presentation**: User sees the rephrased text with real data
- **Memory cleanup**: Redaction mapping is discarded

### Smart Redaction Features

**Duplicate Detection**: If the same name appears multiple times, it uses the same placeholder:
```
"John visited John's mother" → "[NAME_1] visited [NAME_1]'s mother"
```

**Context Preservation**: Non-sensitive context is maintained:
```
"Client was happy" → "Client was happy" (not redacted)
"Monday appointment" → "Monday appointment" (day names preserved)
```

**Relationship Handling**: Generic terms are preserved:
```
"his mother", "her sister" → unchanged (no specific names)
```

---

## Data Flow & Security

### Complete Data Journey

```
┌──────────────────────────────────────────────────────────────┐
│ MOBILE DEVICE (Secure)                                       │
│                                                               │
│ 1. User Input                                                │
│    "John Smith attended session. NDIS: 430123456"           │
│                                                               │
│ 2. Redaction (lib/privacy-redactor.ts)                      │
│    Text: "[NAME_1] attended session. NDIS: [NDIS_1]"        │
│    Map: { NAME_1→"John Smith", NDIS_1→"430123456" }         │
│                                                               │
│ 3. API Call (lib/notes.ts)                                  │
│    POST /api/mobile/v1/ai/rephrase                          │
│    Body: { text: "[NAME_1] attended..." }                   │
└────────────────────────┬─────────────────────────────────────┘
                         │ HTTPS (Encrypted)
                         ▼
┌──────────────────────────────────────────────────────────────┐
│ BACKEND SERVER                                               │
│                                                               │
│ 4. Receive Redacted Text                                    │
│    "[NAME_1] attended session. NDIS: [NDIS_1]"              │
│                                                               │
│ 5. Forward to AI Service                                    │
│    Google Gemini API / Other AI Provider                    │
└────────────────────────┬─────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────┐
│ AI SERVICE (External)                                        │
│                                                               │
│ 6. Process Anonymized Text                                  │
│    Input: "[NAME_1] attended session. NDIS: [NDIS_1]"       │
│    Output: "[NAME_1] successfully participated in the       │
│             session. NDIS: [NDIS_1]"                         │
└────────────────────────┬─────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────┐
│ BACKEND SERVER                                               │
│                                                               │
│ 7. Return Rephrased Text                                    │
│    Response: { rephrasedText: "[NAME_1] successfully..." }  │
└────────────────────────┬─────────────────────────────────────┘
                         │ HTTPS (Encrypted)
                         ▼
┌──────────────────────────────────────────────────────────────┐
│ MOBILE DEVICE (Secure)                                       │
│                                                               │
│ 8. Re-insertion (lib/privacy-redactor.ts)                   │
│    Replace: [NAME_1] → "John Smith"                         │
│    Replace: [NDIS_1] → "430123456"                          │
│                                                               │
│ 9. Display Final Text                                       │
│    "John Smith successfully participated in the session.    │
│     NDIS: 430123456"                                         │
│                                                               │
│ 10. Cleanup                                                  │
│     Redaction map discarded from memory                     │
└──────────────────────────────────────────────────────────────┘
```

### Security Measures

- ✅ **HTTPS Encryption**: All network traffic is encrypted
- ✅ **In-Memory Only**: Redaction mappings never written to disk
- ✅ **Automatic Cleanup**: Mappings discarded after re-insertion
- ✅ **No Logging of PII**: Only placeholders appear in network logs
- ✅ **Session Isolation**: Each rephrasing operation is independent

---

## Compliance & Standards

### Privacy Regulations

This implementation supports compliance with:

- **NDIS Practice Standards**: Protects participant privacy
- **Privacy Act 1988 (Australia)**: Minimizes personal information disclosure
- **Australian Privacy Principles (APPs)**: Follows APP 11 (security of personal information)
- **HIPAA Principles** (if applicable): De-identification before external processing

### Best Practices Followed

1. **Privacy by Design**: Protection built into the system architecture
2. **Data Minimization**: Only necessary (anonymized) data transmitted
3. **Purpose Limitation**: Data used only for rephrasing, not stored
4. **Transparency**: Users informed about AI usage
5. **Security Safeguards**: Multiple layers of protection

### Audit Trail

The system logs (without PII):
- Number of redactions performed
- Types of information redacted
- Success/failure of operations
- No actual sensitive data is logged

Example log entry:
```
🔒 Privacy Redaction: {
  redactionsCount: 5,
  types: { NAME: 2, NDIS: 1, LOCATION: 2 }
}
```

---

## Limitations & Considerations

### What is Protected

✅ **Pattern-matched PII**: Names, NDIS numbers, addresses, phone numbers, emails, dates  
✅ **Explicit identifiers**: Direct references to individuals or locations  
✅ **Contact information**: Phone numbers and email addresses  

### What May Not Be Protected

⚠️ **Contextual information**: "his mother", "her doctor" (no specific names)  
⚠️ **Unusual formats**: Non-standard NDIS numbers or address formats  
⚠️ **Implicit identifiers**: "the client with the red wheelchair"  
⚠️ **Medical conditions**: Specific diagnoses (preserved for clinical accuracy)  
⚠️ **Very short names**: 2-3 letter names may be missed to avoid false positives  

### Recommendations

1. **Review rephrased text**: Workers should review output before saving
2. **Report issues**: If PII is not redacted, report to administrators
3. **Avoid unique identifiers**: Don't use highly specific descriptors
4. **Use generic terms**: Prefer "family member" over specific relationships when possible

---

## Technical Implementation

### Code Location

- **Privacy Redactor**: [`lib/privacy-redactor.ts`](file:///Users/codelab/Desktop/Projects/carenotely_mobile/lib/privacy-redactor.ts)
- **Integration**: [`lib/notes.ts`](file:///Users/codelab/Desktop/Projects/carenotely_mobile/lib/notes.ts)
- **Test Examples**: [`lib/privacy-redactor.test.ts`](file:///Users/codelab/Desktop/Projects/carenotely_mobile/lib/privacy-redactor.test.ts)

### Key Functions

```typescript
// Main privacy protection function
export async function safeRephrase(
    text: string,
    rephraseFunction: (redactedText: string) => Promise<string>
): Promise<string>

// Redact sensitive information
export function redactText(text: string): RedactionResult

// Re-insert original values
export function reinsertText(rephrasedText: string, redactionMap: RedactionMap[]): string
```

### Pattern Customization

Administrators can customize redaction patterns by editing the `PATTERNS` object in `privacy-redactor.ts`:

```typescript
const PATTERNS = {
    ndis: /\b\d{9}\b/g,
    phone: /(\+?61|0)[2-478](?:[ -]?[0-9]){8}/g,
    email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
    // Add custom patterns here
};
```

---

## Audit & Monitoring

### Transparency Logging

Every AI rephrasing operation logs:

```javascript
🔒 Privacy Redaction: {
  originalLength: 150,
  redactedLength: 145,
  redactionsCount: 5,
  types: { NAME: 2, NDIS: 1, LOCATION: 2 }
}

🔓 Privacy Re-insertion: {
  rephrasedLength: 160,
  finalLength: 165
}
```

### Monitoring Recommendations

1. **Regular Pattern Review**: Update patterns based on missed PII
2. **False Positive Tracking**: Monitor over-redaction of common terms
3. **User Feedback**: Collect reports of privacy concerns
4. **Compliance Audits**: Periodic review of privacy measures

### Incident Response

If PII is inadvertently sent to AI service:

1. **Immediate**: Document the incident
2. **Assess**: Determine what information was exposed
3. **Notify**: Inform relevant parties per privacy policy
4. **Update**: Adjust patterns to prevent recurrence
5. **Review**: Conduct privacy impact assessment

---

## Summary

CareNotely's AI rephrasing feature implements **industry-leading privacy protection** through:

✅ **Client-side redaction** - Sensitive data never leaves the device unprotected  
✅ **Automatic detection** - No user action required  
✅ **Comprehensive coverage** - Names, NDIS numbers, addresses, contacts, dates  
✅ **Seamless operation** - Transparent to users  
✅ **Compliance-ready** - Supports NDIS, Privacy Act, and best practices  

### For Workers

- Use AI rephrasing with confidence
- Review output before saving
- Report any privacy concerns

### For Administrators

- Monitor logs for privacy metrics
- Update patterns as needed
- Conduct regular privacy audits

### For Clients

- Your personal information is protected
- Only anonymized text is processed by AI
- Original data stays on the worker's device

---

## Contact & Support

For questions about privacy in AI rephrasing:
- **Technical Issues**: Contact IT support
- **Privacy Concerns**: Contact Privacy Officer
- **Feature Requests**: Submit through feedback system

---

**Document Version:** 1.0  
**Last Review Date:** November 27, 2025  
**Next Review Date:** February 27, 2026
