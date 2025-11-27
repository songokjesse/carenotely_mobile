/**
 * Privacy Redactor Tests
 * 
 * Example usage and test cases for the privacy redaction system
 */

import { redactText, reinsertText, safeRephrase } from './privacy-redactor';

// Example 1: Basic redaction
console.log('=== Example 1: Basic Redaction ===');
const example1 = "John Smith attended his appointment at 123 Main Street. NDIS: 430123456";
const result1 = redactText(example1);
console.log('Original:', example1);
console.log('Redacted:', result1.redactedText);
console.log('Map:', result1.redactionMap);

// Example 2: Multiple clients
console.log('\n=== Example 2: Multiple Clients ===');
const example2 = "Sarah Johnson and Michael Brown both attended the session in Melbourne. Sarah's NDIS is 430111222 and Michael's is 430333444.";
const result2 = redactText(example2);
console.log('Original:', example2);
console.log('Redacted:', result2.redactedText);

// Example 3: Contact information
console.log('\n=== Example 3: Contact Information ===');
const example3 = "Client can be reached at 0412345678 or john.smith@email.com. Address: 45 Park Avenue, Sydney 2000";
const result3 = redactText(example3);
console.log('Original:', example3);
console.log('Redacted:', result3.redactedText);

// Example 4: Re-insertion
console.log('\n=== Example 4: Re-insertion ===');
const original = "Emma Watson visited on 15/03/2024";
const { redactedText, redactionMap } = redactText(original);
const rephrasedWithPlaceholders = "[NAME_1] successfully attended the appointment on [DATE_1]";
const final = reinsertText(rephrasedWithPlaceholders, redactionMap);
console.log('Original:', original);
console.log('Redacted:', redactedText);
console.log('Rephrased (with placeholders):', rephrasedWithPlaceholders);
console.log('Final (re-inserted):', final);

// Example 5: Clinical note
console.log('\n=== Example 5: Clinical Note ===');
const clinicalNote = `
Client David Lee attended the morning session at the Brisbane facility.
He was in a happy mood and participated well in activities.
Medication was administered at 10:30 AM as prescribed.
NDIS: 430555666
Contact: 0423456789
Next appointment: 20/11/2024
`;
const result5 = redactText(clinicalNote);
console.log('Original:', clinicalNote);
console.log('Redacted:', result5.redactedText);
console.log('Redaction count:', result5.redactionMap.length);
console.log('Types:', result5.redactionMap.map(r => r.type));

/**
 * Test the full safe rephrase flow
 */
async function testSafeRephrase() {
    console.log('\n=== Example 6: Full Safe Rephrase Flow ===');

    const mockRephraseFunction = async (text: string) => {
        // Simulate AI rephrasing (in reality, this would call the API)
        return text.replace('attended', 'successfully participated in')
            .replace('was in', 'displayed')
            .replace('participated well', 'engaged actively');
    };

    const originalNote = "John Smith attended the session. He was in a happy mood and participated well.";
    console.log('Original:', originalNote);

    const rephrased = await safeRephrase(originalNote, mockRephraseFunction);
    console.log('Final (rephrased with privacy):', rephrased);
}

// Run the async test
testSafeRephrase().catch(console.error);
