import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Resident } from '../lib/types';

interface ResidentSelectorProps {
    residents: Resident[];
    selectedResidentId?: string;
    onSelect: (residentId: string) => void;
}

export function ResidentSelector({
    residents,
    selectedResidentId,
    onSelect
}: ResidentSelectorProps) {
    return (
        <View style={styles.container}>
            <Text style={styles.label}>Select Resident</Text>
            {residents.map(resident => (
                <TouchableOpacity
                    key={resident.id}
                    style={[
                        styles.residentCard,
                        selectedResidentId === resident.id && styles.selected
                    ]}
                    onPress={() => onSelect(resident.id)}
                >
                    <Text style={styles.residentName}>{resident.name}</Text>
                    {resident.ndisNumber && (
                        <Text style={styles.ndisNumber}>
                            NDIS: {resident.ndisNumber}
                        </Text>
                    )}
                </TouchableOpacity>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 8,
        color: '#333',
    },
    residentCard: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 16,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    selected: {
        borderColor: '#007bff',
        borderWidth: 2,
    },
    residentName: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    ndisNumber: {
        fontSize: 14,
        color: '#666',
        marginTop: 4,
    },
});