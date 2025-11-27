/**
 * Privacy Redactor
 * 
 * Automatically redacts sensitive information from text before sending to AI services,
 * then re-inserts the original data after receiving the response.
 * 
 * This ensures client privacy by preventing PII from leaving the device.
 */

export type RedactionType = 'NAME' | 'NDIS' | 'LOCATION' | 'DATE' | 'PHONE' | 'EMAIL' | 'NUMBER';

export interface RedactionMap {
    placeholder: string;
    original: string;
    type: RedactionType;
    index: number;
}

export interface RedactionResult {
    redactedText: string;
    redactionMap: RedactionMap[];
}

/**
 * Patterns for detecting sensitive information
 */
const PATTERNS = {
    // NDIS numbers (9 digits, often starting with 43)
    ndis: /\b\d{9}\b/g,

    // Australian phone numbers
    phone: /(\+?61|0)[2-478](?:[ -]?[0-9]){8}/g,

    // Email addresses
    email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,

    // Specific dates (DD/MM/YYYY, DD-MM-YYYY, YYYY-MM-DD)
    date: /\b(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}|\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2})\b/g,

    // Australian postcodes (4 digits)
    postcode: /\b\d{4}\b/g,

    // Street addresses (number + street name)
    address: /\b\d+\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\s+(?:Street|St|Road|Rd|Avenue|Ave|Drive|Dr|Court|Ct|Place|Pl|Lane|Ln|Way|Crescent|Cres)\b/gi,

    // Common Australian suburbs/cities (you can expand this list)
    suburb: /\b(?:Sydney|Melbourne|Brisbane|Perth|Adelaide|Canberra|Hobart|Darwin|Gold Coast|Newcastle|Wollongong|Geelong|Townsville|Cairns|Toowoomba|Ballarat|Bendigo|Albury|Launceston|Mackay)\b/gi,

    // Proper nouns (capitalized words that might be names)
    // This is more aggressive and may need tuning
    properNoun: /\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g,
};

/**
 * Common words that should NOT be redacted even if capitalized
 */
const COMMON_WORDS = new Set([
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday',
    'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December',
    'The', 'This', 'That', 'These', 'Those', 'Client', 'Patient', 'Worker', 'Staff', 'Nurse', 'Doctor',
    'Morning', 'Afternoon', 'Evening', 'Night', 'Today', 'Yesterday', 'Tomorrow',
    'NDIS', 'Support', 'Care', 'Service', 'Activity', 'Appointment', 'Session', 'Visit',
    'Happy', 'Sad', 'Calm', 'Anxious', 'Agitated', 'Neutral',
    'Medication', 'Meal', 'Breakfast', 'Lunch', 'Dinner', 'Snack',
    'Bowel', 'Fluid', 'Water', 'Juice', 'Tea', 'Coffee',
    'Behaviour', 'Observation', 'Incident', 'Note', 'Progress',
]);

/**
 * Redact sensitive information from text
 */
export function redactText(text: string): RedactionResult {
    const redactionMap: RedactionMap[] = [];
    let redactedText = text;
    let index = 0;

    // Track what we've already redacted to avoid duplicates
    const redactedValues = new Set<string>();

    // Helper function to add redaction
    const addRedaction = (original: string, type: RedactionType): string => {
        if (redactedValues.has(original)) {
            // Find existing placeholder
            const existing = redactionMap.find(r => r.original === original);
            return existing?.placeholder || original;
        }

        const placeholder = `[${type}_${index + 1}]`;
        redactionMap.push({
            placeholder,
            original,
            type,
            index: index++,
        });
        redactedValues.add(original);
        return placeholder;
    };

    // 1. Redact NDIS numbers
    redactedText = redactedText.replace(PATTERNS.ndis, (match) => {
        return addRedaction(match, 'NDIS');
    });

    // 2. Redact phone numbers
    redactedText = redactedText.replace(PATTERNS.phone, (match) => {
        return addRedaction(match, 'PHONE');
    });

    // 3. Redact email addresses
    redactedText = redactedText.replace(PATTERNS.email, (match) => {
        return addRedaction(match, 'EMAIL');
    });

    // 4. Redact specific dates
    redactedText = redactedText.replace(PATTERNS.date, (match) => {
        return addRedaction(match, 'DATE');
    });

    // 5. Redact street addresses
    redactedText = redactedText.replace(PATTERNS.address, (match) => {
        return addRedaction(match, 'LOCATION');
    });

    // 6. Redact suburbs/cities
    redactedText = redactedText.replace(PATTERNS.suburb, (match) => {
        return addRedaction(match, 'LOCATION');
    });

    // 7. Redact postcodes (but be careful not to redact years or other numbers)
    redactedText = redactedText.replace(PATTERNS.postcode, (match) => {
        // Only redact if it looks like a postcode (not a year like 2024)
        const num = parseInt(match);
        if (num >= 800 && num <= 9999) {
            return addRedaction(match, 'LOCATION');
        }
        return match;
    });

    // 8. Redact proper nouns (potential names) - but exclude common words
    redactedText = redactedText.replace(PATTERNS.properNoun, (match) => {
        // Skip if it's a common word
        if (COMMON_WORDS.has(match)) {
            return match;
        }

        // Skip if it's at the start of a sentence (might be a common word)
        // This is a simple heuristic and may need refinement
        const words = match.split(/\s+/);
        if (words.length === 1 && words[0].length <= 3) {
            // Skip short words like "He", "She", "It"
            return match;
        }

        return addRedaction(match, 'NAME');
    });

    return {
        redactedText,
        redactionMap,
    };
}

/**
 * Re-insert original values into the rephrased text
 */
export function reinsertText(rephrasedText: string, redactionMap: RedactionMap[]): string {
    let result = rephrasedText;

    // Replace placeholders with original values
    // Sort by placeholder length (longest first) to avoid partial replacements
    const sortedMap = [...redactionMap].sort((a, b) => b.placeholder.length - a.placeholder.length);

    for (const { placeholder, original } of sortedMap) {
        // Use global replace to handle cases where placeholder appears multiple times
        result = result.split(placeholder).join(original);
    }

    return result;
}

/**
 * Main function to safely rephrase text with privacy protection
 */
export async function safeRephrase(
    text: string,
    rephraseFunction: (redactedText: string) => Promise<string>
): Promise<string> {
    // Step 1: Redact sensitive information
    const { redactedText, redactionMap } = redactText(text);

    console.log('🔒 Privacy Redaction:', {
        originalLength: text.length,
        redactedLength: redactedText.length,
        redactionsCount: redactionMap.length,
        types: redactionMap.reduce((acc, r) => {
            acc[r.type] = (acc[r.type] || 0) + 1;
            return acc;
        }, {} as Record<string, number>),
    });

    // Step 2: Send redacted text to AI service
    const rephrasedText = await rephraseFunction(redactedText);

    // Step 3: Re-insert original values
    const finalText = reinsertText(rephrasedText, redactionMap);

    console.log('🔓 Privacy Re-insertion:', {
        rephrasedLength: rephrasedText.length,
        finalLength: finalText.length,
    });

    return finalText;
}
