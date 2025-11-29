import { api } from './api';
import { ProgressNote } from './types';

interface NotesResponse {
    notes: ProgressNote[];
}

interface NoteResponse {
    note: ProgressNote;
}

interface CreateNoteData {
    noteText: string;
    mood?: string;
    incidentFlag?: boolean;
    behavioursFlag?: boolean;
    medicationFlag?: boolean;
    clientId?: string;
}

export const notesService = {
    /**
     * Get all progress notes for a shift
     */
    getProgressNotes: async (shiftId: string): Promise<ProgressNote[]> => {
        const response = await api.get<NotesResponse>(`/shifts/${shiftId}/notes`);
        return response.notes;
    },

    /**
     * Create a new progress note for a shift
     */
    createProgressNote: async (shiftId: string, data: CreateNoteData): Promise<ProgressNote> => {
        const response = await api.post<NoteResponse>(`/shifts/${shiftId}/notes`, data);
        return response.note;
    },

    /**
     * Rephrase note text using AI with privacy protection
     */
    rephraseNote: async (text: string): Promise<string> => {
        const { safeRephrase } = await import('./privacy-redactor');

        // Use safeRephrase to automatically redact PII before sending to AI
        return safeRephrase(text, async (redactedText) => {
            const response = await api.post<{ rephrasedText: string }>('/ai/rephrase', { text: redactedText });
            return response.rephrasedText;
        });
    },
};
