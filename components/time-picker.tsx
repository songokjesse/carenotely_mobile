import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import React, { useState } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface TimePickerProps {
    value: Date;
    onChange: (date: Date) => void;
    label?: string;
}

export function TimePicker({ value, onChange, label = 'Time' }: TimePickerProps) {
    const [showPicker, setShowPicker] = useState(false);

    const handleChange = (event: any, selectedDate?: Date) => {
        if (Platform.OS === 'android') {
            setShowPicker(false);
        }
        if (selectedDate) {
            onChange(selectedDate);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.label}>{label}</Text>
            <TouchableOpacity
                style={styles.timeButton}
                onPress={() => setShowPicker(true)}
            >
                <Ionicons name="time" size={20} color="#6B7280" />
                <Text style={styles.timeText}>{format(value, 'h:mm a')}</Text>
                <Ionicons name="chevron-down" size={20} color="#6B7280" />
            </TouchableOpacity>

            {showPicker && (
                <DateTimePicker
                    value={value}
                    mode="time"
                    is24Hour={false}
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={handleChange}
                />
            )}

            {showPicker && Platform.OS === 'ios' && (
                <View style={styles.iosPickerActions}>
                    <TouchableOpacity
                        style={styles.doneButton}
                        onPress={() => setShowPicker(false)}
                    >
                        <Text style={styles.doneButtonText}>Done</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 24,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
    },
    timeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        padding: 16,
        borderRadius: 12,
        gap: 8,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    timeText: {
        flex: 1,
        fontSize: 16,
        color: '#111827',
        fontWeight: '500',
    },
    iosPickerActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        paddingTop: 8,
    },
    doneButton: {
        backgroundColor: '#4F46E5',
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 8,
    },
    doneButtonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '600',
    },
});
