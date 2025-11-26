import { Ionicons } from '@expo/vector-icons';
import { addDays, endOfDay, startOfDay } from 'date-fns';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CalendarView } from '../components/calendar-view';
import { ShiftList } from '../components/shift-list';
import { useAuth } from '../lib/auth-context';
import { shiftService } from '../lib/shifts';
import { Shift } from '../lib/types';

type ViewMode = 'list' | 'calendar';

export default function Dashboard() {
    const router = useRouter();
    const { signOut } = useAuth();
    const [viewMode, setViewMode] = useState<ViewMode>('list');
    const [shifts, setShifts] = useState<Shift[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadShifts();
    }, []);

    const loadShifts = async () => {
        setIsLoading(true);
        try {
            const today = startOfDay(new Date());
            const endDate = endOfDay(addDays(today, 30));
            const data = await shiftService.getShifts({
                startDate: today,
                endDate: endDate,
            });
            setShifts(data);
        } catch (error) {
            Alert.alert('Error', 'Failed to load shifts');
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = async () => {
        await signOut();
        router.replace('/login');
    };

    const handleShiftPress = (shift: Shift) => {
        Alert.alert('Shift Details', `${shift.client.name}\n${shift.location}`);
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.title}>My Shifts</Text>
                    <Text style={styles.subtitle}>Manage your schedule</Text>
                </View>
                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Ionicons name="log-out-outline" size={24} color="#EF4444" />
                </TouchableOpacity>
            </View>

            {/* View Toggle */}
            <View style={styles.toggleContainer}>
                <TouchableOpacity
                    style={[styles.toggleButton, viewMode === 'list' && styles.toggleButtonActive]}
                    onPress={() => setViewMode('list')}
                >
                    <Ionicons
                        name="list-outline"
                        size={20}
                        color={viewMode === 'list' ? '#FFFFFF' : '#6B7280'}
                    />
                    <Text style={[styles.toggleText, viewMode === 'list' && styles.toggleTextActive]}>
                        List
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.toggleButton, viewMode === 'calendar' && styles.toggleButtonActive]}
                    onPress={() => setViewMode('calendar')}
                >
                    <Ionicons
                        name="calendar-outline"
                        size={20}
                        color={viewMode === 'calendar' ? '#FFFFFF' : '#6B7280'}
                    />
                    <Text style={[styles.toggleText, viewMode === 'calendar' && styles.toggleTextActive]}>
                        Calendar
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Content */}
            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#4F46E5" />
                    <Text style={styles.loadingText}>Loading shifts...</Text>
                </View>
            ) : viewMode === 'list' ? (
                <ShiftList
                    shifts={shifts}
                    isLoading={isLoading}
                    onRefresh={loadShifts}
                    onShiftPress={handleShiftPress}
                />
            ) : (
                <CalendarView shifts={shifts} onShiftPress={handleShiftPress} />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 16,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: '#111827',
    },
    subtitle: {
        fontSize: 14,
        color: '#6B7280',
        marginTop: 2,
    },
    logoutButton: {
        padding: 8,
    },
    toggleContainer: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        margin: 16,
        padding: 4,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    toggleButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        borderRadius: 8,
        gap: 6,
    },
    toggleButtonActive: {
        backgroundColor: '#4F46E5',
    },
    toggleText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#6B7280',
    },
    toggleTextActive: {
        color: '#FFFFFF',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 14,
        color: '#6B7280',
    },
});
