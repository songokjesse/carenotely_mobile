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
};
