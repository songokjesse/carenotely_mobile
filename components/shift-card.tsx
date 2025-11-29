import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { isSILShift, Shift } from '../lib/types';

interface ShiftCardProps {
    shift: Shift;
    onPress?: () => void;
}

export function ShiftCard({ shift, onPress }: ShiftCardProps) {
    const startTime = new Date(shift.startTime);
    const endTime = new Date(shift.endTime);
    const duration = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'IN_PROGRESS': return '#10B981'; // Green
            case 'COMPLETED': return '#6B7280'; // Gray
            case 'CANCELLED': return '#EF4444'; // Red
            case 'NO_SHOW': return '#F59E0B'; // Amber
            default: return '#4F46E5'; // Indigo (PLANNED)
        }
    };

    const getStatusLabel = (status: string) => {
        return status.replace('_', ' ');
    };

    return (
        <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.9}>
            <View style={styles.leftStrip} />
            <View style={styles.content}>
                <View style={styles.dateRow}>
                    <Ionicons name="calendar-outline" size={14} color="#6B7280" />
                    <Text style={styles.date}>
                        {format(startTime, 'EEEE, MMM d, yyyy')}
                    </Text>
                </View>

                <View style={styles.header}>
                    <Text style={styles.time}>
                        {format(startTime, 'h:mm a')} - {format(endTime, 'h:mm a')}
                    </Text>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(shift.status) + '20' }]}>
                        <Text style={[styles.statusText, { color: getStatusColor(shift.status) }]}>
                            {getStatusLabel(shift.status)}
                        </Text>
                    </View>
                </View>

                <Text style={styles.clientName}>{isSILShift(shift) ? shift.site.name : shift.client?.name || 'Unknown'}</Text>

                <View style={styles.row}>
                    <Ionicons name="location-outline" size={16} color="#6B7280" />
                    <Text style={styles.location} numberOfLines={1}>{shift.location}</Text>
                </View>

                <View style={styles.footer}>
                    <View style={styles.tag}>
                        <Ionicons name="medical-outline" size={14} color="#4F46E5" />
                        <Text style={styles.tagText}>{shift.serviceType}</Text>
                    </View>
                    <Text style={styles.duration}>{duration}h</Text>
                </View>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        borderRadius: 16,
        marginVertical: 8,
        marginHorizontal: 4,
        flexDirection: 'row',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
        overflow: 'hidden',
    },
    leftStrip: {
        width: 6,
        backgroundColor: '#4F46E5',
    },
    content: {
        flex: 1,
        padding: 16,
    },
    dateRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        gap: 6,
    },
    date: {
        fontSize: 13,
        fontWeight: '600',
        color: '#6B7280',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    time: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 10,
        fontWeight: '700',
    },
    clientName: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 8,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    location: {
        fontSize: 14,
        color: '#6B7280',
        marginLeft: 4,
        flex: 1,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
        paddingTop: 12,
    },
    tag: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#EEF2FF',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    tagText: {
        fontSize: 12,
        color: '#4F46E5',
        marginLeft: 4,
        fontWeight: '500',
    },
    duration: {
        fontSize: 12,
        color: '#9CA3AF',
    },
});
