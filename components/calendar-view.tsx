import { format } from 'date-fns';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { shiftService } from '../lib/shifts';
import { Shift } from '../lib/types';
import { ShiftCard } from './shift-card';

interface CalendarViewProps {
    shifts: Shift[];
    onShiftPress?: (shift: Shift) => void;
}

export function CalendarView({ shifts, onShiftPress }: CalendarViewProps) {
    const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [selectedDayShifts, setSelectedDayShifts] = useState<Shift[]>([]);
    const [isLoadingDay, setIsLoadingDay] = useState(false);

    // Create marked dates object for the calendar
    const markedDates = React.useMemo(() => {
        const marked: { [key: string]: any } = {};

        shifts.forEach(shift => {
            const dateKey = format(new Date(shift.startTime), 'yyyy-MM-dd');
            if (!marked[dateKey]) {
                marked[dateKey] = {
                    marked: true,
                    dotColor: '#4F46E5',
                };
            }
        });

        // Add selection styling
        if (selectedDate) {
            marked[selectedDate] = {
                ...marked[selectedDate],
                selected: true,
                selectedColor: '#4F46E5',
            };
        }

        return marked;
    }, [shifts, selectedDate]);

    // Load shifts for selected day
    useEffect(() => {
        const loadDayShifts = async () => {
            setIsLoadingDay(true);
            try {
                const dayShifts = await shiftService.getShiftsByDate(new Date(selectedDate));
                setSelectedDayShifts(dayShifts);
            } catch (error) {
                console.error('Failed to load day shifts', error);
            } finally {
                setIsLoadingDay(false);
            }
        };

        loadDayShifts();
    }, [selectedDate]);

    const handleDayPress = (day: DateData) => {
        setSelectedDate(day.dateString);
    };

    return (
        <View style={styles.container}>
            <Calendar
                current={selectedDate}
                onDayPress={handleDayPress}
                markedDates={markedDates}
                theme={{
                    backgroundColor: '#ffffff',
                    calendarBackground: '#ffffff',
                    textSectionTitleColor: '#6B7280',
                    selectedDayBackgroundColor: '#4F46E5',
                    selectedDayTextColor: '#ffffff',
                    todayTextColor: '#4F46E5',
                    dayTextColor: '#111827',
                    textDisabledColor: '#D1D5DB',
                    dotColor: '#4F46E5',
                    selectedDotColor: '#ffffff',
                    arrowColor: '#4F46E5',
                    monthTextColor: '#111827',
                    textDayFontWeight: '500',
                    textMonthFontWeight: '700',
                    textDayHeaderFontWeight: '600',
                    textDayFontSize: 15,
                    textMonthFontSize: 18,
                    textDayHeaderFontSize: 13,
                }}
                style={styles.calendar}
            />

            <View style={styles.divider} />

            <View style={styles.selectedDayHeader}>
                <Text style={styles.selectedDayTitle}>
                    {format(new Date(selectedDate), 'EEEE, MMMM d')}
                </Text>
                {selectedDayShifts.length > 0 && (
                    <View style={styles.countBadge}>
                        <Text style={styles.countText}>{selectedDayShifts.length}</Text>
                    </View>
                )}
            </View>

            <ScrollView style={styles.shiftsContainer} showsVerticalScrollIndicator={false}>
                {isLoadingDay ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#4F46E5" />
                    </View>
                ) : selectedDayShifts.length > 0 ? (
                    selectedDayShifts.map(shift => (
                        <ShiftCard key={shift.id} shift={shift} onPress={() => onShiftPress?.(shift)} />
                    ))
                ) : (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No shifts scheduled for this day</Text>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    calendar: {
        borderRadius: 16,
        margin: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
    },
    divider: {
        height: 1,
        backgroundColor: '#E5E7EB',
        marginHorizontal: 16,
    },
    selectedDayHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    selectedDayTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111827',
    },
    countBadge: {
        backgroundColor: '#4F46E5',
        borderRadius: 12,
        paddingHorizontal: 10,
        paddingVertical: 4,
    },
    countText: {
        color: 'white',
        fontSize: 12,
        fontWeight: '700',
    },
    shiftsContainer: {
        flex: 1,
        paddingHorizontal: 16,
    },
    loadingContainer: {
        paddingVertical: 40,
        alignItems: 'center',
    },
    emptyContainer: {
        paddingVertical: 40,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 14,
        color: '#9CA3AF',
    },
});
