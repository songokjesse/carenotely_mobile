import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { OBSERVATION_MODULES } from '../lib/observation-modules';
import { Observation } from '../lib/types';

interface ObservationTimelineProps {
    observations: Observation[];
    onRefresh?: () => void;
    refreshing?: boolean;
}

export function ObservationTimeline({ observations, onRefresh, refreshing }: ObservationTimelineProps) {
    const renderObservation = ({ item }: { item: Observation }) => {
        const module = OBSERVATION_MODULES[item.type];
        if (!module) return null;

        return (
            <View style={styles.observationCard}>
                <View style={[styles.iconBadge, { backgroundColor: module.color + '20' }]}>
                    <Ionicons name={module.icon as any} size={20} color={module.color} />
                </View>
                <View style={styles.observationContent}>
                    <View style={styles.observationHeader}>
                        <Text style={styles.observationTitle}>{module.title}</Text>
                        <Text style={styles.observationTime}>
                            {format(new Date(item.recordedAt), 'h:mm a')}
                        </Text>
                    </View>
                    <View style={styles.observationData}>
                        {renderObservationData(item)}
                    </View>
                </View>
            </View>
        );
    };

    const renderObservationData = (observation: Observation) => {
        const data = observation.data;

        switch (observation.type) {
            case 'BOWEL_MONITORING':
                return (
                    <Text style={styles.dataText}>
                        Consistency: <Text style={styles.dataValue}>{data.consistency}</Text>
                        {data.notes && `\n${data.notes}`}
                    </Text>
                );
            case 'FLUID_INTAKE':
                return (
                    <Text style={styles.dataText}>
                        Amount: <Text style={styles.dataValue}>{data.amount}mL</Text> ({data.fluidType})
                        {data.notes && `\n${data.notes}`}
                    </Text>
                );
            case 'BGL_MONITORING':
                return (
                    <Text style={styles.dataText}>
                        Reading: <Text style={styles.dataValue}>{data.reading} mmol/L</Text>
                        {data.notes && `\n${data.notes}`}
                    </Text>
                );
            default:
                return <Text style={styles.dataText}>Observation recorded</Text>;
        }
    };

    if (observations.length === 0) {
        return (
            <View style={styles.emptyState}>
                <Ionicons name="document-text-outline" size={48} color="#9CA3AF" />
                <Text style={styles.emptyTitle}>No Observations Yet</Text>
                <Text style={styles.emptyText}>
                    Observations will appear here once you start recording them
                </Text>
            </View>
        );
    }

    return (
        <FlatList
            data={observations}
            renderItem={renderObservation}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            onRefresh={onRefresh}
            refreshing={refreshing}
        />
    );
}

const styles = StyleSheet.create({
    list: {
        padding: 16,
    },
    observationCard: {
        flexDirection: 'row',
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    iconBadge: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    observationContent: {
        flex: 1,
    },
    observationHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    observationTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111827',
    },
    observationTime: {
        fontSize: 12,
        color: '#6B7280',
    },
    observationData: {
        marginTop: 4,
    },
    dataText: {
        fontSize: 14,
        color: '#6B7280',
        lineHeight: 20,
    },
    dataValue: {
        fontWeight: '600',
        color: '#111827',
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
