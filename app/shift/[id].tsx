import { Ionicons } from '@expo/vector-icons';
import { differenceInHours, format } from 'date-fns';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SceneMap, TabBar, TabView } from 'react-native-tab-view';
import { ObservationGrid } from '../../components/observation-grid';
import { ObservationTimeline } from '../../components/observation-timeline';
import { BehaviourObservationForm } from '../../components/observations/behaviour-observation-form';
import { BGLMonitoringForm } from '../../components/observations/bgl-monitoring-form';
import { BowelMonitoringForm } from '../../components/observations/bowel-monitoring-form';
import { FluidIntakeForm } from '../../components/observations/fluid-intake-form';
import { SeizureMonitoringForm } from '../../components/observations/seizure-monitoring-form';
import { ProgressNoteForm } from '../../components/progress-note-form';
import { ProgressNotesTimeline } from '../../components/progress-notes-timeline';
import { ResidentSelector } from '../../components/resident-selector';
import { locationService } from '../../lib/location';
import { notesService } from '../../lib/notes';
import { getEnabledModules, ObservationModuleConfig } from '../../lib/observation-modules';
import { observationsService } from '../../lib/observations';
import { shiftUtils } from '../../lib/shift-utils';
import { shiftService } from '../../lib/shifts';
import { isSILShift, Observation, ProgressNote, Shift } from '../../lib/types';

const initialLayout = { width: Dimensions.get('window').width };

export default function ShiftDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const [shift, setShift] = useState<Shift | null>(null);
    const [observations, setObservations] = useState<Observation[]>([]);
    const [progressNotes, setProgressNotes] = useState<ProgressNote[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isClocking, setIsClocking] = useState(false);
    const [isLoadingObservations, setIsLoadingObservations] = useState(false);
    const [isLoadingNotes, setIsLoadingNotes] = useState(false);
    const [selectedResidentId, setSelectedResidentId] = useState<string>();

    // Tab state
    const [index, setIndex] = useState(0);
    const [routes] = useState([
        { key: 'overview', title: 'Overview' },
        { key: 'observations', title: 'Observations' },
        { key: 'notes', title: 'Notes' },
    ]);

    // Form modals
    const [selectedModule, setSelectedModule] = useState<ObservationModuleConfig | null>(null);
    const [showNoteForm, setShowNoteForm] = useState(false);

    useEffect(() => {
        loadShift();
    }, [id]);

    useEffect(() => {
        if (shift && index === 1) {
            loadObservations();
        }
        if (shift && index === 2) {
            loadProgressNotes();
        }
    }, [shift, index]);

    const loadShift = async () => {
        try {
            const data = await shiftService.getShiftDetails(id);
            console.log('📋 Shift loaded:', {
                id: data.id,
                startTime: data.startTime,
                endTime: data.endTime,
                clockInTime: data.clockInTime,
                hasClient: !!data.client,
            });
            setShift(data);
        } catch (error) {
            Alert.alert('Error', 'Failed to load shift details');
            router.back();
        } finally {
            setIsLoading(false);
        }
    };

    const loadObservations = async () => {
        if (!shift) return;
        setIsLoadingObservations(true);
        try {
            const data = await observationsService.getObservations(shift.id);
            setObservations(data);
        } catch (error) {
            console.error('Failed to load observations:', error);
        } finally {
            setIsLoadingObservations(false);
        }
    };

    const loadProgressNotes = async () => {
        if (!shift) return;
        setIsLoadingNotes(true);
        try {
            const data = await notesService.getProgressNotes(shift.id);
            setProgressNotes(data);
        } catch (error) {
            console.error('Failed to load progress notes:', error);
        } finally {
            setIsLoadingNotes(false);
        }
    };

    const handleClockIn = async () => {
        if (!shift) return;

        const { canClock, reason } = shiftUtils.canClockIn(shift);
        if (!canClock) {
            Alert.alert('Cannot Clock In', reason);
            return;
        }

        setIsClocking(true);
        try {
            const location = await locationService.getCurrentLocation();
            await shiftService.clockIn(shift.id, location);

            // After successful clock-in, reload the entire shift details
            await loadShift(); 
            
            Alert.alert('Success', 'Clocked in successfully!');
        } catch (error: any) {
            Alert.alert('Clock In Failed', error.message || 'An error occurred');
        } finally {
            setIsClocking(false);
        }
    };

    const handleClockOut = async () => {
        if (!shift) return;

        const { canClock, reason } = shiftUtils.canClockOut(shift);
        if (!canClock) {
            Alert.alert('Cannot Clock Out', reason);
            return;
        }

        Alert.alert(
            'Clock Out',
            'Are you sure you want to clock out?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Clock Out',
                    style: 'destructive',
                    onPress: async () => {
                        setIsClocking(true);
                        try {
                            const location = await locationService.getCurrentLocation();
                            const updatedShift = await shiftService.clockOut(shift.id, location);
                            setShift(updatedShift);
                            Alert.alert(
                                'Success',
                                'Clocked out successfully!',
                                [
                                    {
                                        text: 'OK',
                                        onPress: () => router.replace('/dashboard'),
                                    },
                                ]
                            );
                        } catch (error: any) {
                            Alert.alert('Clock Out Failed', error.message || 'An error occurred');
                        } finally {
                            setIsClocking(false);
                        }
                    },
                },
            ]
        );
    };

    const handleObservationSubmit = async (data: any) => {
        if (!shift) return;

        if (isSILShift(shift)) {
            if (!selectedResidentId) {
                Alert.alert('Select Resident', 'Please select a resident first.');
                setSelectedModule(null); // Close form
                return;
            }
            data.clientId = selectedResidentId;
        }

        await observationsService.createObservation(shift.id, data);
        await loadObservations();
        setSelectedModule(null); // Close form
    };

    const handleModulePress = (module: ObservationModuleConfig) => {
        if (!shift?.clockInTime) {
            Alert.alert('Clock In Required', 'You must clock in before adding observations.');
            return;
        }
        setSelectedModule(module);
    };

    const handleNoteSubmit = async (data: any) => {
        if (!shift) return;

        if (isSILShift(shift)) {
            if (!selectedResidentId) {
                Alert.alert('Select Resident', 'Please select a resident first.');
                return;
            }
            data.clientId = selectedResidentId;
        }

        await notesService.createProgressNote(shift.id, data);
        await loadProgressNotes();
        setShowNoteForm(false);
    };

    if (isLoading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#4F46E5" />
                </View>
            </SafeAreaView>
        );
    }

    if (!shift) {
        return null;
    }

    const startTime = shift.startTime ? new Date(shift.startTime) : null;
    const endTime = shift.endTime ? new Date(shift.endTime) : null;

    if (!startTime || !endTime || isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
        // Log detailed information about the invalid data
        console.error('❌ Invalid shift data detected:', {
            shiftId: shift.id,
            startTime: shift.startTime,
            endTime: shift.endTime,
            startTimeValid: startTime ? !isNaN(startTime.getTime()) : false,
            endTimeValid: endTime ? !isNaN(endTime.getTime()) : false,
            hasClient: !!shift.client,
        });

        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <Text style={styles.errorText}>Invalid shift data</Text>
                    <Text style={styles.errorDetail}>
                        {!shift.startTime && 'Missing start time. '}
                        {!shift.endTime && 'Missing end time. '}
                        {shift.startTime && startTime && isNaN(startTime.getTime()) && 'Invalid start time format. '}
                        {shift.endTime && endTime && isNaN(endTime.getTime()) && 'Invalid end time format. '}
                    </Text>
                    <TouchableOpacity
                        style={styles.retryButton}
                        onPress={() => {
                            router.back();
                            setTimeout(() => router.push(`/shift/${shift.id}`), 100);
                        }}
                    >
                        <Text style={styles.retryButtonText}>Retry</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    const statusInfo = shiftUtils.getShiftStatusInfo(shift);
    const duration = differenceInHours(endTime, startTime);
    const clockInCheck = shiftUtils.canClockIn(shift);
    const clockOutCheck = shiftUtils.canClockOut(shift);
    const enabledModules = isSILShift(shift) && selectedResidentId
        ? getEnabledModules(
            shift.site.residents.find(r => r.id === selectedResidentId)?.enabledModules
        )
        : shift.client
            ? getEnabledModules(shift.client.enabledModules)
            : [];

    // Tab scenes
    const OverviewRoute = () => (
        <ScrollView style={styles.tabContent}>
            {/* Date & Time */}
            <View style={styles.section}>
                <View style={styles.dateTimeCard}>
                    <Ionicons name="calendar" size={24} color="#4F46E5" />
                    <View style={styles.dateTimeInfo}>
                        <Text style={styles.dateText}>
                            {format(startTime, 'EEEE, MMMM d, yyyy')}
                        </Text>
                        <Text style={styles.timeText}>
                            {format(startTime, 'h:mm a')} - {format(endTime, 'h:mm a')}
                        </Text>
                        <Text style={styles.durationText}>{duration} hours</Text>
                    </View>
                </View>
            </View>

            {/* Client/Site Info */}
            {isSILShift(shift) ? (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Site</Text>
                    <View style={styles.card}>
                        <Text style={styles.clientName}>{shift.site.name}</Text>
                        <Text style={styles.locationText}>{shift.site.address}</Text>
                        <Text style={styles.residentCount}>
                            {shift.site.residents.length} residents
                        </Text>
                    </View>
                </View>
            ) : shift.client ? (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Client</Text>
                    <View style={styles.card}>
                        <Text style={styles.clientName}>{shift.client.name}</Text>
                        {shift.client.ndisNumber && (
                            <Text style={styles.ndisNumber}>
                                NDIS: {shift.client.ndisNumber}
                            </Text>
                        )}
                    </View>
                </View>
            ) : null}

            {isSILShift(shift) && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Residents</Text>
                    <ResidentSelector
                        residents={shift.site.residents}
                        selectedResidentId={selectedResidentId}
                        onSelect={setSelectedResidentId}
                    />
                </View>
            )}

            {/* Location */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Location</Text>
                <View style={styles.card}>
                    <View style={styles.row}>
                        <Ionicons name="location" size={20} color="#4F46E5" />
                        <Text style={styles.locationText}>{shift.location}</Text>
                    </View>
                </View>
            </View>

            {/* Service Type */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Service</Text>
                <View style={styles.card}>
                    <View style={styles.row}>
                        <Ionicons name="medical" size={20} color="#4F46E5" />
                        <Text style={styles.serviceText}>{shift.serviceType}</Text>
                    </View>
                </View>
            </View>

            {/* Clock In/Out Times */}
            {(shift.clockInTime || shift.clockOutTime) && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Time Tracking</Text>
                    <View style={styles.card}>
                        {shift.clockInTime && (
                            <View style={styles.timeRow}>
                                <Ionicons name="log-in" size={20} color="#10B981" />
                                <View style={styles.timeInfo}>
                                    <Text style={styles.timeLabel}>Clocked In</Text>
                                    <Text style={styles.timeValue}>
                                        {format(new Date(shift.clockInTime), 'h:mm a')}
                                    </Text>
                                </View>
                            </View>
                        )}
                        {shift.clockOutTime && (
                            <View style={[styles.timeRow, { marginTop: 12 }]}>
                                <Ionicons name="log-out" size={20} color="#EF4444" />
                                <View style={styles.timeInfo}>
                                    <Text style={styles.timeLabel}>Clocked Out</Text>
                                    <Text style={styles.timeValue}>
                                        {format(new Date(shift.clockOutTime), 'h:mm a')}
                                    </Text>
                                </View>
                            </View>
                        )}
                    </View>
                </View>
            )}

            {/* Clock In/Out Buttons */}
            <View style={styles.actionSection}>
                {!shift.clockInTime && (
                    <TouchableOpacity
                        style={[
                            styles.clockButton,
                            styles.clockInButton,
                            !clockInCheck.canClock && styles.disabledButton,
                        ]}
                        onPress={handleClockIn}
                        disabled={!clockInCheck.canClock || isClocking}
                    >
                        {isClocking ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <>
                                <Ionicons name="log-in" size={24} color="white" />
                                <Text style={styles.clockButtonText}>Clock In</Text>
                            </>
                        )}
                    </TouchableOpacity>
                )}

                {shift.clockInTime && !shift.clockOutTime && (
                    <TouchableOpacity
                        style={[
                            styles.clockButton,
                            styles.clockOutButton,
                            !clockOutCheck.canClock && styles.disabledButton,
                        ]}
                        onPress={handleClockOut}
                        disabled={!clockOutCheck.canClock || isClocking}
                    >
                        {isClocking ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <>
                                <Ionicons name="log-out" size={24} color="white" />
                                <Text style={styles.clockButtonText}>Clock Out</Text>
                            </>
                        )}
                    </TouchableOpacity>
                )}

                {!clockInCheck.canClock && !shift.clockInTime && (
                    <Text style={styles.helperText}>{clockInCheck.reason}</Text>
                )}
            </View>
        </ScrollView>
    );

    const ObservationsRoute = () => (
        <View style={styles.tabContent}>
            <ObservationGrid modules={enabledModules} onModulePress={handleModulePress} />
            <View style={styles.timelineDivider}>
                <Text style={styles.timelineTitle}>Recent Observations</Text>
            </View>
            <ObservationTimeline
                observations={observations}
                onRefresh={loadObservations}
                refreshing={isLoadingObservations}
            />
        </View>
    );

    const NotesRoute = () => (
        <View style={styles.tabContent}>
            <ProgressNotesTimeline
                notes={progressNotes}
                onRefresh={loadProgressNotes}
                refreshing={isLoadingNotes}
            />
            <TouchableOpacity
                style={[styles.fab, !shift?.clockInTime && { opacity: 0.5, backgroundColor: '#9CA3AF' }]}
                onPress={() => {
                    if (!shift?.clockInTime) {
                        Alert.alert('Clock In Required', 'You must clock in before adding progress notes.');
                        return;
                    }
                    setShowNoteForm(true);
                }}
            >
                <Ionicons name="add" size={24} color="white" />
            </TouchableOpacity>
        </View>
    );

    const renderScene = SceneMap({
        overview: OverviewRoute,
        observations: ObservationsRoute,
        notes: NotesRoute,
    });

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#111827" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Shift Details</Text>
                <View style={{ width: 24 }} />
            </View>

            {/* Status Badge */}
            <View style={styles.statusContainer}>
                <View style={[styles.statusBadge, { backgroundColor: statusInfo.color + '20' }]}>
                    <Ionicons name={statusInfo.icon as any} size={16} color={statusInfo.color} />
                    <Text style={[styles.statusText, { color: statusInfo.color }]}>
                        {statusInfo.label}
                    </Text>
                </View>
            </View>

            {/* Tabs */}
            <TabView
                navigationState={{ index, routes }}
                renderScene={renderScene}
                onIndexChange={setIndex}
                initialLayout={initialLayout}
                renderTabBar={(props) => (
                    <TabBar
                        {...props}
                        indicatorStyle={styles.tabIndicator}
                        style={styles.tabBar}
                        activeColor="#4F46E5"
                        inactiveColor="#6B7280"
                    />
                )}
            />

            {/* Observation Forms */}
            {selectedModule?.type === 'BOWEL_MONITORING' && (
                <BowelMonitoringForm
                    visible={true}
                    onClose={() => setSelectedModule(null)}
                    onSubmit={handleObservationSubmit}
                    shift={shift}
                />
            )}
            {selectedModule?.type === 'FLUID_INTAKE' && (
                <FluidIntakeForm
                    visible={true}
                    onClose={() => setSelectedModule(null)}
                    onSubmit={handleObservationSubmit}
                    shift={shift}
                />
            )}
            {selectedModule?.type === 'BGL_MONITORING' && (
                <BGLMonitoringForm
                    visible={true}
                    onClose={() => setSelectedModule(null)}
                    onSubmit={handleObservationSubmit}
                    shift={shift}
                />
            )}
            {selectedModule?.type === 'SEIZURE_MONITORING' && (
                <SeizureMonitoringForm
                    visible={true}
                    onClose={() => setSelectedModule(null)}
                    onSubmit={handleObservationSubmit}
                    shift={shift}
                />
            )}
            {selectedModule?.type === 'BEHAVIOUR_OBSERVATION' && (
                <BehaviourObservationForm
                    visible={true}
                    onClose={() => setSelectedModule(null)}
                    onSubmit={handleObservationSubmit}
                    shift={shift}
                />
            )}
            {showNoteForm && (
                <ProgressNoteForm
                    visible={true}
                    onClose={() => setShowNoteForm(false)}
                    onSubmit={handleNoteSubmit}
                    shift={shift}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    errorText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#EF4444',
        marginBottom: 8,
    },
    errorDetail: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
        marginBottom: 24,
    },
    retryButton: {
        backgroundColor: '#4F46E5',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    retryButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
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
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
    },
    statusContainer: {
        alignItems: 'center',
        paddingVertical: 16,
        backgroundColor: 'white',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        gap: 6,
    },
    statusText: {
        fontSize: 14,
        fontWeight: '700',
    },
    tabBar: {
        backgroundColor: 'white',
    },
    tabIndicator: {
        backgroundColor: '#4F46E5',
    },
    tabLabel: {
        fontWeight: '600',
        fontSize: 14,
    },
    tabContent: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    section: {
        paddingHorizontal: 16,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '700',
        color: '#6B7280',
        textTransform: 'uppercase',
        marginBottom: 8,
        letterSpacing: 0.5,
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    dateTimeCard: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    dateTimeInfo: {
        flex: 1,
    },
    dateText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 4,
    },
    timeText: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 2,
    },
    durationText: {
        fontSize: 12,
        color: '#9CA3AF',
    },
    clientName: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 4,
    },
    ndisNumber: {
        fontSize: 14,
        color: '#6B7280',
    },
    residentCount: {
        fontSize: 14,
        color: '#6B7280',
        marginTop: 4,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    locationText: {
        fontSize: 14,
        color: '#374151',
        flex: 1,
    },
    serviceText: {
        fontSize: 14,
        color: '#374151',
        fontWeight: '500',
    },
    timeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    timeInfo: {
        flex: 1,
    },
    timeLabel: {
        fontSize: 12,
        color: '#6B7280',
        marginBottom: 2,
    },
    timeValue: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
    },
    actionSection: {
        paddingHorizontal: 16,
        paddingVertical: 24,
    },
    clockButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 12,
        gap: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    clockInButton: {
        backgroundColor: '#10B981',
    },
    clockOutButton: {
        backgroundColor: '#EF4444',
    },
    disabledButton: {
        opacity: 0.5,
    },
    clockButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '700',
    },
    helperText: {
        textAlign: 'center',
        marginTop: 12,
        fontSize: 14,
        color: '#6B7280',
    },
    timelineDivider: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#F3F4F6',
    },
    timelineTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#374151',
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
    fab: {
        position: 'absolute',
        right: 16,
        bottom: 16,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#4F46E5',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
});
