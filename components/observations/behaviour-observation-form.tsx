import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { Shift } from '../../lib/types';
import { TimePicker } from '../time-picker';

interface BehaviourObservationFormProps {
    visible: boolean;
    onClose: () => void;
    onSubmit: (data: any) => Promise<void>;
    shift?: Shift;
}

export function BehaviourObservationForm({
    visible,
    onClose,
    onSubmit,
    shift,
}: BehaviourObservationFormProps) {
    const [time, setTime] = useState(new Date());
    const [mood, setMood] = useState<string>('');
    const [incidents, setIncidents] = useState<string[]>([]);
    const [description, setDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const moodOptions = [
        { value: 'HAPPY', label: 'Happy', icon: 'happy', color: '#10B981' },
        { value: 'CALM', label: 'Calm', icon: 'leaf', color: '#3B82F6' },
        { value: 'ANXIOUS', label: 'Anxious', icon: 'alert-circle', color: '#F59E0B' },
        { value: 'AGITATED', label: 'Agitated', icon: 'warning', color: '#EF4444' },
    ];

    const incidentTypes = [
        { value: 'AGGRESSION', label: 'Aggression' },
        { value: 'SELF_HARM', label: 'Self-harm' },
        { value: 'VERBAL_OUTBURST', label: 'Verbal Outburst' },
        { value: 'PROPERTY_DAMAGE', label: 'Property Damage' },
    ];

    const toggleIncident = (value: string) => {
        setIncidents((prev) =>
            prev.includes(value) ? prev.filter((i) => i !== value) : [...prev, value]
        );
    };

    const handleSubmit = async () => {
        if (!mood) {
            Alert.alert('Required', 'Please select a mood');
            return;
        }

        setIsSubmitting(true);
        try {
            await onSubmit({
                moduleType: 'BEHAVIOUR_OBSERVATION',
                data: {
                    time: time.toISOString(),
                    mood,
                    incidents,
                    description,
                },
                recordedAt: time.toISOString(),
            });
            // Reset form
            setMood('');
            setIncidents([]);
            setDescription('');
            setTime(new Date());
            onClose();
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to save observation');
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
                    <Text style={styles.title}>Behaviour Observation</Text>
                    <View style={{ width: 24 }} />
                </View>

                <ScrollView style={styles.content}>
                    {/* Time */}
                    <TimePicker
                        value={time}
                        onChange={setTime}
                        label="Time *"
                    />

                    {/* Mood */}
                    <View style={styles.section}>
                        <Text style={styles.label}>Mood *</Text>
                        <View style={styles.optionsGrid}>
                            {moodOptions.map((option) => (
                                <TouchableOpacity
                                    key={option.value}
                                    style={[
                                        styles.moodCard,
                                        mood === option.value && {
                                            borderColor: option.color,
                                            backgroundColor: option.color + '20',
                                        },
                                    ]}
                                    onPress={() => setMood(option.value)}
                                >
                                    <Ionicons
                                        name={option.icon as any}
                                        size={28}
                                        color={mood === option.value ? option.color : '#6B7280'}
                                    />
                                    <Text
                                        style={[
                                            styles.moodLabel,
                                            mood === option.value && { color: option.color, fontWeight: '600' },
                                        ]}
                                    >
                                        {option.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Incidents */}
                    <View style={styles.section}>
                        <Text style={styles.label}>Incidents (Optional)</Text>
                        <Text style={styles.helperText}>Select all that apply</Text>
                        <View style={styles.incidentsContainer}>
                            {incidentTypes.map((incident) => (
                                <TouchableOpacity
                                    key={incident.value}
                                    style={[
                                        styles.incidentChip,
                                        incidents.includes(incident.value) && styles.incidentChipSelected,
                                    ]}
                                    onPress={() => toggleIncident(incident.value)}
                                >
                                    <Ionicons
                                        name={
                                            incidents.includes(incident.value)
                                                ? 'checkbox'
                                                : 'square-outline'
                                        }
                                        size={20}
                                        color={incidents.includes(incident.value) ? '#10B981' : '#6B7280'}
                                    />
                                    <Text
                                        style={[
                                            styles.incidentLabel,
                                            incidents.includes(incident.value) && styles.incidentLabelSelected,
                                        ]}
                                    >
                                        {incident.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Description */}
                    <View style={styles.section}>
                        <Text style={styles.label}>Description (Optional)</Text>
                        <TextInput
                            style={styles.textArea}
                            placeholder="Describe the behaviour, triggers, interventions used, etc..."
                            value={description}
                            onChangeText={setDescription}
                            multiline
                            numberOfLines={4}
                            textAlignVertical="top"
                        />
                    </View>
                </ScrollView>

                <View style={styles.footer}>
                    <TouchableOpacity
                        style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
                        onPress={handleSubmit}
                        disabled={isSubmitting}
                    >
                        <Text style={styles.submitButtonText}>
                            {isSubmitting ? 'Saving...' : 'Save Observation'}
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
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
    },
    helperText: {
        fontSize: 12,
        color: '#9CA3AF',
        marginBottom: 8,
    },
    timeDisplay: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        padding: 16,
        borderRadius: 12,
        gap: 8,
    },
    timeText: {
        fontSize: 16,
        color: '#111827',
        fontWeight: '500',
    },
    optionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    moodCard: {
        flex: 1,
        minWidth: '45%',
        backgroundColor: 'white',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#E5E7EB',
    },
    moodLabel: {
        fontSize: 14,
        color: '#6B7280',
        marginTop: 8,
        fontWeight: '500',
    },
    incidentsContainer: {
        gap: 8,
    },
    incidentChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        padding: 12,
        borderRadius: 12,
        gap: 8,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    incidentChipSelected: {
        borderColor: '#10B981',
        backgroundColor: '#F0FDF4',
    },
    incidentLabel: {
        fontSize: 14,
        color: '#6B7280',
        fontWeight: '500',
    },
    incidentLabelSelected: {
        color: '#10B981',
        fontWeight: '600',
    },
    textArea: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        color: '#111827',
        minHeight: 100,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    footer: {
        padding: 16,
        backgroundColor: 'white',
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
    },
    submitButton: {
        backgroundColor: '#10B981',
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
