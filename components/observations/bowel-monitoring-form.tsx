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

interface BowelMonitoringFormProps {
    visible: boolean;
    onClose: () => void;
    onSubmit: (data: any) => Promise<void>;
}

export function BowelMonitoringForm({ visible, onClose, onSubmit }: BowelMonitoringFormProps) {
    const [time, setTime] = useState(new Date());
    const [consistency, setConsistency] = useState<string>('');
    const [notes, setNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const consistencyOptions = [
        { value: 'NORMAL', label: 'Normal', icon: 'checkmark-circle' },
        { value: 'SOFT', label: 'Soft', icon: 'water' },
        { value: 'HARD', label: 'Hard', icon: 'square' },
        { value: 'LOOSE', label: 'Loose', icon: 'warning' },
    ];

    const handleSubmit = async () => {
        if (!consistency) {
            Alert.alert('Required', 'Please select consistency');
            return;
        }

        setIsSubmitting(true);
        try {
            await onSubmit({
                moduleType: 'BOWEL_MONITORING',
                data: {
                    time: time.toISOString(),
                    consistency,
                    notes,
                },
                recordedAt: time.toISOString(),
            });
            // Reset form
            setConsistency('');
            setNotes('');
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
                    <Text style={styles.title}>Bowel Monitoring</Text>
                    <View style={{ width: 24 }} />
                </View>

                <ScrollView style={styles.content}>
                    {/* Time */}
                    <TimePicker
                        value={time}
                        onChange={setTime}
                        label="Time *"
                    />

                    {/* Consistency */}
                    <View style={styles.section}>
                        <Text style={styles.label}>Consistency *</Text>
                        <View style={styles.optionsGrid}>
                            {consistencyOptions.map((option) => (
                                <TouchableOpacity
                                    key={option.value}
                                    style={[
                                        styles.optionCard,
                                        consistency === option.value && styles.optionCardSelected,
                                    ]}
                                    onPress={() => setConsistency(option.value)}
                                >
                                    <Ionicons
                                        name={option.icon as any}
                                        size={24}
                                        color={consistency === option.value ? '#8B5CF6' : '#6B7280'}
                                    />
                                    <Text
                                        style={[
                                            styles.optionLabel,
                                            consistency === option.value && styles.optionLabelSelected,
                                        ]}
                                    >
                                        {option.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Notes */}
                    <View style={styles.section}>
                        <Text style={styles.label}>Notes (Optional)</Text>
                        <TextInput
                            style={styles.textArea}
                            placeholder="Add any additional notes..."
                            value={notes}
                            onChangeText={setNotes}
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
    optionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    optionCard: {
        flex: 1,
        minWidth: '45%',
        backgroundColor: 'white',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#E5E7EB',
    },
    optionCardSelected: {
        borderColor: '#8B5CF6',
        backgroundColor: '#F3E8FF',
    },
    optionLabel: {
        fontSize: 14,
        color: '#6B7280',
        marginTop: 8,
        fontWeight: '500',
    },
    optionLabelSelected: {
        color: '#8B5CF6',
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
        backgroundColor: '#8B5CF6',
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
