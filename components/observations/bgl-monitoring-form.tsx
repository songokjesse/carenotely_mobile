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

interface BGLMonitoringFormProps {
    visible: boolean;
    onClose: () => void;
    onSubmit: (data: any) => Promise<void>;
    shift?: Shift;
}

export function BGLMonitoringForm({ visible, onClose, onSubmit, shift }: BGLMonitoringFormProps) {
    const [time, setTime] = useState(new Date());
    const [reading, setReading] = useState('');
    const [context, setContext] = useState<string>('');
    const [notes, setNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const contextOptions = [
        { value: 'BEFORE_MEAL', label: 'Before Meal' },
        { value: 'AFTER_MEAL', label: 'After Meal' },
        { value: 'FASTING', label: 'Fasting' },
        { value: 'BEDTIME', label: 'Bedtime' },
        { value: 'OTHER', label: 'Other' },
    ];

    const handleSubmit = async () => {
        if (!reading) {
            Alert.alert('Required', 'Please enter blood glucose reading');
            return;
        }

        const readingNum = parseFloat(reading);
        if (isNaN(readingNum) || readingNum <= 0) {
            Alert.alert('Invalid', 'Please enter a valid reading');
            return;
        }

        setIsSubmitting(true);
        try {
            await onSubmit({
                moduleType: 'BGL_MONITORING',
                data: {
                    time: time.toISOString(),
                    reading: readingNum,
                    context,
                    notes,
                },
                recordedAt: time.toISOString(),
            });
            // Reset form
            setReading('');
            setContext('');
            setNotes('');
            setTime(new Date());
            onClose();
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to save observation');
        } finally {
            setIsSubmitting(false);
        }
    };

    const getReadingStatus = (value: number) => {
        if (value < 4) return { label: 'Low', color: '#EF4444' };
        if (value > 10) return { label: 'High', color: '#F59E0B' };
        return { label: 'Normal', color: '#10B981' };
    };

    const readingNum = parseFloat(reading);
    const status = !isNaN(readingNum) ? getReadingStatus(readingNum) : null;

    return (
        <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={onClose}>
                        <Ionicons name="close" size={24} color="#111827" />
                    </TouchableOpacity>
                    <Text style={styles.title}>Blood Glucose</Text>
                    <View style={{ width: 24 }} />
                </View>

                <ScrollView style={styles.content}>
                    {/* Time */}
                    <TimePicker
                        value={time}
                        onChange={setTime}
                        label="Time *"
                    />

                    {/* Reading */}
                    <View style={styles.section}>
                        <Text style={styles.label}>Reading (mmol/L) *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g., 5.5"
                            value={reading}
                            onChangeText={setReading}
                            keyboardType="decimal-pad"
                        />
                        {status && (
                            <View style={[styles.statusBadge, { backgroundColor: status.color + '20' }]}>
                                <Ionicons name="information-circle" size={16} color={status.color} />
                                <Text style={[styles.statusText, { color: status.color }]}>
                                    {status.label}
                                </Text>
                            </View>
                        )}
                    </View>

                    {/* Context */}
                    <View style={styles.section}>
                        <Text style={styles.label}>Context (Optional)</Text>
                        <View style={styles.optionsGrid}>
                            {contextOptions.map((option) => (
                                <TouchableOpacity
                                    key={option.value}
                                    style={[
                                        styles.optionCard,
                                        context === option.value && styles.optionCardSelected,
                                    ]}
                                    onPress={() => setContext(option.value)}
                                >
                                    <Text
                                        style={[
                                            styles.optionLabel,
                                            context === option.value && styles.optionLabelSelected,
                                        ]}
                                    >
                                        {option.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Reference Ranges */}
                    <View style={styles.referenceCard}>
                        <Text style={styles.referenceTitle}>Reference Ranges</Text>
                        <View style={styles.referenceRow}>
                            <View style={[styles.dot, { backgroundColor: '#EF4444' }]} />
                            <Text style={styles.referenceText}>Low: {'<'} 4.0 mmol/L</Text>
                        </View>
                        <View style={styles.referenceRow}>
                            <View style={[styles.dot, { backgroundColor: '#10B981' }]} />
                            <Text style={styles.referenceText}>Normal: 4.0 - 10.0 mmol/L</Text>
                        </View>
                        <View style={styles.referenceRow}>
                            <View style={[styles.dot, { backgroundColor: '#F59E0B' }]} />
                            <Text style={styles.referenceText}>High: {'>'} 10.0 mmol/L</Text>
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
    input: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        color: '#111827',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 8,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        alignSelf: 'flex-start',
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
    },
    optionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    optionCard: {
        minWidth: '30%',
        backgroundColor: 'white',
        padding: 12,
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#E5E7EB',
        flexGrow: 1,
    },
    optionCardSelected: {
        borderColor: '#EF4444',
        backgroundColor: '#FEF2F2',
    },
    optionLabel: {
        fontSize: 14,
        color: '#374151',
        fontWeight: '600',
        textAlign: 'center',
    },
    optionLabelSelected: {
        color: '#EF4444',
    },
    referenceCard: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
    },
    referenceTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 12,
    },
    referenceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    referenceText: {
        fontSize: 14,
        color: '#6B7280',
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
        backgroundColor: '#EF4444',
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
