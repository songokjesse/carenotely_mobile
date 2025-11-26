import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ObservationModuleConfig } from '../lib/observation-modules';

interface ObservationGridProps {
    modules: ObservationModuleConfig[];
    onModulePress: (module: ObservationModuleConfig) => void;
}

export function ObservationGrid({ modules, onModulePress }: ObservationGridProps) {
    if (modules.length === 0) {
        return (
            <View style={styles.emptyState}>
                <Ionicons name="medical-outline" size={48} color="#9CA3AF" />
                <Text style={styles.emptyTitle}>No Observations Configured</Text>
                <Text style={styles.emptyText}>
                    This client doesn't have any observation modules enabled
                </Text>
            </View>
        );
    }

    return (
        <View style={styles.grid}>
            {modules.map((module) => (
                <TouchableOpacity
                    key={module.type}
                    style={styles.moduleCard}
                    onPress={() => onModulePress(module)}
                    activeOpacity={0.7}
                >
                    <View style={[styles.iconContainer, { backgroundColor: module.color + '20' }]}>
                        <Ionicons name={module.icon as any} size={28} color={module.color} />
                    </View>
                    <Text style={styles.moduleTitle}>{module.title}</Text>
                    <Text style={styles.moduleDescription}>{module.description}</Text>
                    <View style={styles.addButton}>
                        <Ionicons name="add-circle" size={20} color={module.color} />
                        <Text style={[styles.addButtonText, { color: module.color }]}>Add</Text>
                    </View>
                </TouchableOpacity>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        padding: 12,
        gap: 12,
    },
    moduleCard: {
        width: '48%',
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    iconContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    moduleTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 4,
    },
    moduleDescription: {
        fontSize: 12,
        color: '#6B7280',
        marginBottom: 12,
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    addButtonText: {
        fontSize: 14,
        fontWeight: '600',
    },
    emptyState: {
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
});
