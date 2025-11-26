import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import React from 'react';
import {
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { ProgressNote } from '../lib/types';

interface ProgressNotesTimelineProps {
    notes: ProgressNote[];
    onRefresh?: () => void;
    refreshing?: boolean;
}

const MOOD_DISPLAY: Record<string, { emoji: string; label: string; color: string }> = {
    HAPPY: { emoji: '😊', label: 'Happy', color: '#10B981' },
    CALM: { emoji: '😌', label: 'Calm', color: '#3B82F6' },
    NEUTRAL: { emoji: '😐', label: 'Neutral', color: '#6B7280' },
    ANXIOUS: { emoji: '😰', label: 'Anxious', color: '#F59E0B' },
    AGITATED: { emoji: '😤', label: 'Agitated', color: '#EF4444' },
    SAD: { emoji: '😢', label: 'Sad', color: '#8B5CF6' },
};

export function ProgressNotesTimeline({
    notes,
    onRefresh,
    refreshing = false,
}: ProgressNotesTimelineProps) {
    if (notes.length === 0) {
        return (
            <ScrollView
                style={styles.container}
                contentContainerStyle={styles.emptyContainer}
                refreshControl={
                    onRefresh ? (
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    ) : undefined
                }
            >
                <Ionicons name="document-text-outline" size={48} color="#9CA3AF" />
                <Text style={styles.emptyTitle}>No Progress Notes</Text>
                <Text style={styles.emptyText}>
                    Add your first progress note using the button below
                </Text>
            </ScrollView>
        );
    }

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.timeline}
            refreshControl={
                onRefresh ? (
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                ) : undefined
            }
        >
            {notes.map((note, index) => (
                <View key={note.id} style={styles.noteCard}>
                    {/* Header */}
                    <View style={styles.noteHeader}>
                        <View style={styles.authorInfo}>
                            <Ionicons name="person-circle" size={20} color="#6B7280" />
                            <Text style={styles.authorName}>{note.author.name}</Text>
                        </View>
                        <Text style={styles.noteTime}>
                            {format(new Date(note.createdAt), 'MMM d, h:mm a')}
                        </Text>
                    </View>

                    {/* Note Text */}
                    <Text style={styles.noteText}>{note.noteText}</Text>

                    {/* Mood */}
                    {note.mood && MOOD_DISPLAY[note.mood] && (
                        <View style={styles.moodContainer}>
                            <View
                                style={[
                                    styles.moodBadge,
                                    { backgroundColor: MOOD_DISPLAY[note.mood].color + '20' },
                                ]}
                            >
                                <Text style={styles.moodEmoji}>
                                    {MOOD_DISPLAY[note.mood].emoji}
                                </Text>
                                <Text
                                    style={[
                                        styles.moodLabel,
                                        { color: MOOD_DISPLAY[note.mood].color },
                                    ]}
                                >
                                    {MOOD_DISPLAY[note.mood].label}
                                </Text>
                            </View>
                        </View>
                    )}

                    {/* Flags */}
                    {(note.incidentFlag || note.behavioursFlag || note.medicationFlag) && (
                        <View style={styles.flagsContainer}>
                            {note.incidentFlag && (
                                <View style={[styles.flag, styles.flagIncident]}>
                                    <Ionicons name="alert-circle" size={14} color="#EF4444" />
                                    <Text style={styles.flagText}>Incident</Text>
                                </View>
                            )}
                            {note.behavioursFlag && (
                                <View style={[styles.flag, styles.flagBehaviours]}>
                                    <Ionicons name="people" size={14} color="#F59E0B" />
                                    <Text style={styles.flagText}>Behaviours</Text>
                                </View>
                            )}
                            {note.medicationFlag && (
                                <View style={[styles.flag, styles.flagMedication]}>
                                    <Ionicons name="medical" size={14} color="#8B5CF6" />
                                    <Text style={styles.flagText}>Medication</Text>
                                </View>
                            )}
                        </View>
                    )}

                    {/* Timeline connector */}
                    {index < notes.length - 1 && <View style={styles.connector} />}
                </View>
            ))}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    timeline: {
        padding: 16,
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 32,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#374151',
        marginTop: 16,
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
    },
    noteCard: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
        position: 'relative',
    },
    noteHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    authorInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    authorName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
    },
    noteTime: {
        fontSize: 12,
        color: '#9CA3AF',
    },
    noteText: {
        fontSize: 15,
        color: '#111827',
        lineHeight: 22,
        marginBottom: 12,
    },
    moodContainer: {
        marginBottom: 8,
    },
    moodBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 16,
        gap: 6,
    },
    moodEmoji: {
        fontSize: 16,
    },
    moodLabel: {
        fontSize: 13,
        fontWeight: '600',
    },
    flagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginTop: 8,
    },
    flag: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 12,
        gap: 4,
    },
    flagIncident: {
        backgroundColor: '#FEF2F2',
    },
    flagBehaviours: {
        backgroundColor: '#FFFBEB',
    },
    flagMedication: {
        backgroundColor: '#F5F3FF',
    },
    flagText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#374151',
    },
    connector: {
        position: 'absolute',
        left: 26,
        bottom: -16,
        width: 2,
        height: 16,
        backgroundColor: '#E5E7EB',
    },
});
