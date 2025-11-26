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
import { TimePicker } from '../time-picker';

interface SeizureMonitoringFormProps {
    visible: boolean;
    onClose: () => void;
    onSubmit: (data: any) => Promise<void>;
}

export function SeizureMonitoringForm({ visible, onClose, onSubmit }: SeizureMonitoringFormProps) {
    const [time, setTime] = useState(new Date());
    const [duration, setDuration] = useState('');
    const [severity, setSeverity] = useState<string>('');
    const [description, setDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const severityOptions = [
        { value: 'MILD', label: 'Mild', icon: 'remove-circle', color: '#10B981' },
        { value: 'MODERATE', label: 'Moderate', icon: 'alert-circle', color: '#F59E0B' },
        { value: 'SEVERE', label: 'Severe', icon: 'warning', color: '#EF4444' },
    ];

    const handleSubmit = async () => {
        if (!duration || !severity) {
            Alert.alert('Required', 'Please enter duration and select severity');
            return;
        }

        const durationNum = parseFloat(duration);
        if (isNaN(durationNum) || durationNum <= 0) {
            Alert.alert('Invalid', 'Please enter a valid duration');
            return;
        }

        setIsSubmitting(true);
        try {
            await onSubmit({
                moduleType: 'SEIZURE_MONITORING',
                data: {
                    time: time.toISOString(),
                    duration: durationNum,
                    severity,
                    description,
                },
                recordedAt: time.toISOString(),
            });
            // Reset form
            setDuration('');
            setSeverity('');
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
                    <Text style={styles.title}>Seizure Monitoring</Text>
                    <View style={{ width: 24 }} />
                </View>

                <ScrollView style={styles.content}>
                    {/* Time */}
                    <TimePicker
                        value={time}
                        onChange={setTime}
                        label="Time *"
                    />

                    {/* Duration */}
                    <View style={styles.section}>
                        <Text style={styles.label}>Duration (minutes) *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g., 5"
                            value={duration}
                            onChangeText={setDuration}
                            keyboardType="numeric"
                        />
                    </View>

                    {/* Severity */}
                    <View style={styles.section}>
                        <Text style={styles.label}>Severity *</Text>
                        <View style={styles.optionsColumn}>
                            {severityOptions.map((option) => (
                                <TouchableOpacity
                                    key={option.value}
                                    style={[
                                        styles.optionCard,
                                        severity === option.value && {
                                            borderColor: option.color,
                                            backgroundColor: option.color + '10',
                                        },
                                    ]}
                                    onPress={() => setSeverity(option.value)}
                                >
                                    <Ionicons
                                        name={option.icon as any}
                                        size={24}
                                        color={severity === option.value ? option.color : '#6B7280'}
                                    />
                                    <Text
                                        style={[
                                            styles.optionLabel,
                                            severity === option.value && { color: option.color, fontWeight: '600' },
                                        ]}
                                    >
                                        {option.label}
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
                            placeholder="Describe what happened, any triggers, recovery time, etc..."
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
    input: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        color: '#111827',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    optionsColumn: {
        gap: 12,
    },
    optionCard: {
        backgroundColor: 'white',
        padding: 16,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        borderWidth: 2,
        borderColor: '#E5E7EB',
    },
    optionLabel: {
        fontSize: 16,
        color: '#6B7280',
        fontWeight: '500',
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
        backgroundColor: '#F59E0B',
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
