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

interface BowelMonitoringFormProps {
    visible: boolean;
    onClose: () => void;
    onSubmit: (data: any) => Promise<void>;
    shift?: Shift;
}

export function BowelMonitoringForm({
    visible,
    onClose,
    onSubmit,
    shift,
}: BowelMonitoringFormProps) {
    const [time, setTime] = useState(new Date());
    const [consistency, setConsistency] = useState<string>('');
    const [color, setColor] = useState<string>('');
    const [notes, setNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const consistencyOptions = [
        { value: 'TYPE_1', label: 'Type 1', description: 'Separate hard lumps, like nuts (hard to pass)' },
        { value: 'TYPE_2', label: 'Type 2', description: 'Sausage-shaped but lumpy' },
        { value: 'TYPE_3', label: 'Type 3', description: 'Like a sausage but with cracks on surface' },
        { value: 'TYPE_4', label: 'Type 4', description: 'Like a sausage or snake, smooth and soft' },
        { value: 'TYPE_5', label: 'Type 5', description: 'Soft blobs with clear-cut edges' },
        { value: 'TYPE_6', label: 'Type 6', description: 'Fluffy pieces with ragged edges, a mushy stool' },
        { value: 'TYPE_7', label: 'Type 7', description: 'Watery, no solid pieces' },
    ];

    const colorOptions = [
        { value: 'BROWN', label: 'Brown', color: '#8B4513' },
        { value: 'YELLOW', label: 'Yellow', color: '#F59E0B' },
        { value: 'GREEN', label: 'Green', color: '#10B981' },
        { value: 'BLACK', label: 'Black', color: '#1F2937' },
        { value: 'RED', label: 'Red', color: '#EF4444' },
    ];

    const handleSubmit = async () => {
        if (!consistency || !color) {
            Alert.alert('Required', 'Please select consistency and color');
            return;
        }

        setIsSubmitting(true);
        try {
            await onSubmit({
                moduleType: 'BOWEL_MONITORING',
                data: {
                    time: time.toISOString(),
                    consistency,
                    color,
                    notes,
                },
                recordedAt: time.toISOString(),
            });
            // Reset form
            setConsistency('');
            setColor('');
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
                        <View style={styles.optionsList}>
                            {consistencyOptions.map((option) => (
                                <TouchableOpacity
                                    key={option.value}
                                    style={[
                                        styles.optionRow,
                                        consistency === option.value && styles.optionRowSelected,
                                    ]}
                                    onPress={() => setConsistency(option.value)}
                                >
                                    <View style={styles.optionTextContainer}>
                                        <Text
                                            style={[
                                                styles.optionLabel,
                                                consistency === option.value && styles.optionLabelSelected,
                                            ]}
                                        >
                                            {option.label}
                                        </Text>
                                        <Text style={styles.optionDescription}>{option.description}</Text>
                                    </View>
                                    {consistency === option.value && (
                                        <Ionicons name="checkmark-circle" size={24} color="#8B5CF6" />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Color */}
                    <View style={styles.section}>
                        <Text style={styles.label}>Color *</Text>
                        <View style={styles.optionsGrid}>
                            {colorOptions.map((option) => (
                                <TouchableOpacity
                                    key={option.value}
                                    style={[
                                        styles.optionCard,
                                        color === option.value && styles.optionCardSelected,
                                    ]}
                                    onPress={() => setColor(option.value)}
                                >
                                    <View
                                        style={[
                                            styles.colorSwatch,
                                            { backgroundColor: option.color },
                                        ]}
                                    />
                                    <Text
                                        style={[
                                            styles.optionLabel,
                                            color === option.value && styles.optionLabelSelected,
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
    optionsList: {
        gap: 12,
    },
    optionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'white',
        padding: 16,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#E5E7EB',
    },
    optionRowSelected: {
        borderColor: '#8B5CF6',
        backgroundColor: '#F3E8FF',
    },
    optionTextContainer: {
        flex: 1,
        marginRight: 12,
    },
    optionLabel: {
        fontSize: 16,
        color: '#374151',
        fontWeight: '600',
        marginBottom: 4,
    },
    optionDescription: {
        fontSize: 14,
        color: '#6B7280',
    },
    optionLabelSelected: {
        color: '#8B5CF6',
    },
    colorSwatch: {
        width: 32,
        height: 32,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: '#E5E7EB',
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
