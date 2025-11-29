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

interface FluidIntakeFormProps {
    visible: boolean;
    onClose: () => void;
    onSubmit: (data: any) => Promise<void>;
    shift?: Shift;
}

export function FluidIntakeForm({ visible, onClose, onSubmit, shift }: FluidIntakeFormProps) {
    const [time, setTime] = useState(new Date());
    const [amount, setAmount] = useState('');
    const [fluidType, setFluidType] = useState<string>('');
    const [notes, setNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fluidTypes = [
        { value: 'WATER', label: 'Water', icon: 'water' },
        { value: 'JUICE', label: 'Juice', icon: 'wine' },
        { value: 'TEA', label: 'Tea/Coffee', icon: 'cafe' },
        { value: 'OTHER', label: 'Other', icon: 'ellipsis-horizontal' },
    ];

    const handleSubmit = async () => {
        if (!amount || !fluidType) {
            Alert.alert('Required', 'Please enter amount and select fluid type');
            return;
        }

        const amountNum = parseFloat(amount);
        if (isNaN(amountNum) || amountNum <= 0) {
            Alert.alert('Invalid', 'Please enter a valid amount');
            return;
        }

        setIsSubmitting(true);
        try {
            await onSubmit({
                moduleType: 'FLUID_INTAKE',
                data: {
                    time: time.toISOString(),
                    amount: amountNum,
                    fluidType,
                    notes,
                },
                recordedAt: time.toISOString(),
            });
            // Reset form
            setAmount('');
            setFluidType('');
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
                    <Text style={styles.title}>Fluid Intake</Text>
                    <View style={{ width: 24 }} />
                </View>

                <ScrollView style={styles.content}>
                    {/* Time */}
                    <TimePicker
                        value={time}
                        onChange={setTime}
                        label="Time *"
                    />

                    {/* Amount */}
                    <View style={styles.section}>
                        <Text style={styles.label}>Amount (mL) *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g., 250"
                            value={amount}
                            onChangeText={setAmount}
                            keyboardType="numeric"
                        />
                    </View>

                    {/* Fluid Type */}
                    <View style={styles.section}>
                        <Text style={styles.label}>Fluid Type *</Text>
                        <View style={styles.optionsGrid}>
                            {fluidTypes.map((option) => (
                                <TouchableOpacity
                                    key={option.value}
                                    style={[
                                        styles.optionCard,
                                        fluidType === option.value && styles.optionCardSelected,
                                    ]}
                                    onPress={() => setFluidType(option.value)}
                                >
                                    <Ionicons
                                        name={option.icon as any}
                                        size={24}
                                        color={fluidType === option.value ? '#3B82F6' : '#6B7280'}
                                    />
                                    <Text
                                        style={[
                                            styles.optionLabel,
                                            fluidType === option.value && styles.optionLabelSelected,
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
    input: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        color: '#111827',
        borderWidth: 1,
        borderColor: '#E5E7EB',
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
        borderColor: '#3B82F6',
        backgroundColor: '#EFF6FF',
    },
    optionLabel: {
        fontSize: 14,
        color: '#6B7280',
        marginTop: 8,
        fontWeight: '500',
    },
    optionLabelSelected: {
        color: '#3B82F6',
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
        backgroundColor: '#3B82F6',
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
