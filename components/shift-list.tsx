import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { Shift } from '../lib/types';
import { ShiftCard } from './shift-card';

interface ShiftListProps {
    shifts: Shift[];
    isLoading?: boolean;
    onRefresh?: () => void;
    onShiftPress?: (shift: Shift) => void;
    ListHeaderComponent?: React.ComponentType<any> | React.ReactElement | null;
}

export function ShiftList({ shifts, isLoading, onRefresh, onShiftPress, ListHeaderComponent }: ShiftListProps) {
    const renderEmpty = () => (
        <View style={styles.emptyContainer}>
            <View style={styles.iconCircle}>
                <Ionicons name="calendar-outline" size={48} color="#9CA3AF" />
            </View>
            <Text style={styles.emptyTitle}>No Shifts Found</Text>
            <Text style={styles.emptySubtitle}>You don't have any shifts scheduled for this period.</Text>
        </View>
    );

    return (
        <FlatList
            data={shifts}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
                <ShiftCard shift={item} onPress={() => onShiftPress?.(item)} />
            )}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={!isLoading ? renderEmpty : null}
            ListHeaderComponent={ListHeaderComponent}
            refreshControl={
                onRefresh ? (
                    <RefreshControl refreshing={!!isLoading} onRefresh={onRefresh} tintColor="#4F46E5" />
                ) : undefined
            }
        />
    );
}

const styles = StyleSheet.create({
    listContent: {
        padding: 16,
        paddingBottom: 100, // Space for bottom tab bar if needed
        flexGrow: 1,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 60,
    },
    iconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
        paddingHorizontal: 32,
    },
});
