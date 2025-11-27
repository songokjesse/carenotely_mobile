import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { notesService } from '../lib/notes';

interface ProgressNoteFormProps {
    visible: boolean;
    onClose: () => void;
    onSubmit: (data: {
        noteText: string;
        mood?: string;
        incidentFlag?: boolean;
        behavioursFlag?: boolean;
        medicationFlag?: boolean;
    }) => Promise<void>;
}

const MOOD_OPTIONS = [
    { value: '', label: 'Not specified' },
    { value: 'HAPPY', label: '😊 Happy' },
    { value: 'CALM', label: '😌 Calm' },
    { value: 'NEUTRAL', label: '😐 Neutral' },
    { value: 'ANXIOUS', label: '😰 Anxious' },
    { value: 'AGITATED', label: '😤 Agitated' },
    { value: 'SAD', label: '😢 Sad' },
];

export function ProgressNoteForm({ visible, onClose, onSubmit }: ProgressNoteFormProps) {
    const [noteText, setNoteText] = useState('');
    const [mood, setMood] = useState('');
    const [incidentFlag, setIncidentFlag] = useState(false);
    const [behavioursFlag, setBehavioursFlag] = useState(false);
    const [medicationFlag, setMedicationFlag] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isRephrasing, setIsRephrasing] = useState(false);

    const handleRephrase = async () => {
        if (!noteText.trim()) {
            Alert.alert('Required', 'Please enter some text to rephrase');
            return;
        }

        setIsRephrasing(true);
        try {
            const rephrased = await notesService.rephraseNote(noteText);
            setNoteText(rephrased);
        } catch (error: any) {
            Alert.alert('Error', 'Failed to rephrase text. Please try again.');
        } finally {
            setIsRephrasing(false);
        }
    };

    const handleSubmit = async () => {
        if (!noteText.trim()) {
            Alert.alert('Required', 'Please enter note text');
            return;
        }

        setIsSubmitting(true);
        try {
            await onSubmit({
                noteText: noteText.trim(),
                mood: mood || undefined,
                incidentFlag,
                behavioursFlag,
                medicationFlag,
            });
            // Reset form
            setNoteText('');
            setMood('');
            setIncidentFlag(false);
            setBehavioursFlag(false);
            setMedicationFlag(false);
            onClose();
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to save progress note');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={onClose}>
                        <Ionicons name="close" size={24} color="#111827" />
                    </TouchableOpacity>
                    <Text style={styles.title}>Add Progress Note</Text>
                    <View style={{ width: 24 }} />
                </View>

                <ScrollView style={styles.content}>
                    {/* Note Text */}
                    <View style={styles.section}>
                        <View style={styles.labelRow}>
                            <Text style={styles.label}>Note *</Text>
                            <TouchableOpacity
                                style={styles.rephraseButton}
                                onPress={handleRephrase}
                                disabled={isRephrasing || !noteText.trim()}
                            >
                                {isRephrasing ? (
                                    <ActivityIndicator size="small" color="#4F46E5" />
                                ) : (
                                    <>
                                        <Ionicons name="sparkles" size={16} color="#4F46E5" />
                                        <Text style={styles.rephraseText}>Rephrase with AI</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>
                        <TextInput
                            style={styles.textArea}
                            placeholder="Describe activities, observations, client interactions..."
                            value={noteText}
                            onChangeText={setNoteText}
                            multiline
                            numberOfLines={6}
                            textAlignVertical="top"
                        />
                    </View>

                    {/* Mood */}
                    <View style={styles.section}>
                        <Text style={styles.label}>Client Mood (Optional)</Text>
                        <View style={styles.moodGrid}>
                            {MOOD_OPTIONS.map((option) => (
                                <TouchableOpacity
                                    key={option.value}
                                    style={[
                                        styles.moodOption,
                                        mood === option.value && styles.moodOptionSelected,
                                    ]}
                                    onPress={() => setMood(option.value)}
                                >
                                    <Text
                                        style={[
                                            styles.moodLabel,
                                            mood === option.value && styles.moodLabelSelected,
                                        ]}
                                    >
                                        {option.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Flags */}
                    <View style={styles.section}>
                        <Text style={styles.label}>Flags (Optional)</Text>
                        <View style={styles.flagsContainer}>
                            <View style={styles.flagRow}>
                                <View style={styles.flagInfo}>
                                    <Ionicons name="alert-circle" size={20} color="#EF4444" />
                                    <Text style={styles.flagText}>Incident</Text>
                                </View>
                                <Switch
                                    value={incidentFlag}
                                    onValueChange={setIncidentFlag}
                                    trackColor={{ false: '#D1D5DB', true: '#FCA5A5' }}
                                    thumbColor={incidentFlag ? '#EF4444' : '#F3F4F6'}
                                />
                            </View>
                            <View style={styles.flagRow}>
                                <View style={styles.flagInfo}>
                                    <Ionicons name="people" size={20} color="#F59E0B" />
                                    <Text style={styles.flagText}>Behaviours</Text>
                                </View>
                                <Switch
                                    value={behavioursFlag}
                                    onValueChange={setBehavioursFlag}
                                    trackColor={{ false: '#D1D5DB', true: '#FCD34D' }}
                                    thumbColor={behavioursFlag ? '#F59E0B' : '#F3F4F6'}
                                />
                            </View>
                            <View style={styles.flagRow}>
                                <View style={styles.flagInfo}>
                                    <Ionicons name="medical" size={20} color="#8B5CF6" />
                                    <Text style={styles.flagText}>Medication</Text>
                                </View>
                                <Switch
                                    value={medicationFlag}
                                    onValueChange={setMedicationFlag}
                                    trackColor={{ false: '#D1D5DB', true: '#C4B5FD' }}
                                    thumbColor={medicationFlag ? '#8B5CF6' : '#F3F4F6'}
                                />
                            </View>
                        </View>
                    </View>
                </ScrollView>

                <View style={styles.footer}>
                    <TouchableOpacity
                        style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
                        onPress={handleSubmit}
                        disabled={isSubmitting}
                    >
                        <Text style={styles.submitButtonText}>
                            {isSubmitting ? 'Saving...' : 'Save Note'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 16,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
    },
    content: {
        flex: 1,
        padding: 16,
    },
    section: {
        marginBottom: 24,
    },
    labelRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
    },
    rephraseButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 4,
        backgroundColor: '#EEF2FF',
        borderRadius: 12,
    },
    rephraseText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#4F46E5',
    },
    textArea: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        color: '#111827',
        minHeight: 150,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    moodGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    moodOption: {
        backgroundColor: 'white',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: '#E5E7EB',
    },
    moodOptionSelected: {
        borderColor: '#4F46E5',
        backgroundColor: '#EEF2FF',
    },
    moodLabel: {
        fontSize: 14,
        color: '#6B7280',
        fontWeight: '500',
    },
    moodLabelSelected: {
        color: '#4F46E5',
        fontWeight: '600',
    },
    flagsContainer: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        gap: 16,
    },
    flagRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    flagInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    flagText: {
        fontSize: 16,
        color: '#374151',
        fontWeight: '500',
    },
    footer: {
        padding: 16,
        backgroundColor: 'white',
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
    },
    submitButton: {
        backgroundColor: '#4F46E5',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    submitButtonDisabled: {
        opacity: 0.5,
    },
    submitButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '700',
    },
});
