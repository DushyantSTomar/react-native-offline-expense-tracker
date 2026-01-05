import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, StatusBar, Modal, Platform, Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { loadExpenses, deleteExpense, setSelectedDate } from '../store/expenseSlice';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { Expense } from '../types';
import dayjs from 'dayjs';
import Icon, { IconName } from '../components/Icon';
import SafeToSpend from '../components/SafeToSpend';
import { SafeAreaView } from 'react-native-safe-area-context';

type HomeScreenProps = {
    navigation: NativeStackNavigationProp<RootStackParamList, 'Home'>;
};

const CATEGORY_ICONS: Record<string, IconName> = {
    Food: 'food',
    Transport: 'transport',
    Shopping: 'shopping',
    Bills: 'bills',
    Health: 'health',
    Entertainment: 'entertainment',
    Other: 'other'
};

const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
    const dispatch = useDispatch<AppDispatch>();
    const { expenses = [], selectedDate, loading } = useSelector((state: RootState) => state.expenses || {});
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [activeFilters, setActiveFilters] = useState<string[]>([]);
    const [showDatePicker, setShowDatePicker] = useState(false);

    useEffect(() => {
        dispatch(loadExpenses());
    }, [dispatch]);

    // Filter logic
    const currentMonthExpenses = useMemo(() => {
        return expenses.filter(e => {
            const matchesDate = dayjs(e.date).isSame(selectedDate, 'month');
            const matchesCategory = activeFilters.length === 0 || activeFilters.includes(e.category);
            return matchesDate && matchesCategory;
        });
    }, [expenses, selectedDate, activeFilters]);

    const totalIncome = useMemo(() => currentMonthExpenses.filter(e => e.type === 'income').reduce((sum, e) => sum + e.amount, 0), [currentMonthExpenses]);
    const totalExpense = useMemo(() => currentMonthExpenses.filter(e => e.type === 'expense' || !e.type).reduce((sum, e) => sum + e.amount, 0), [currentMonthExpenses]);

    const daysLeft = dayjs(selectedDate).daysInMonth() - dayjs().date();
    // Use Income as budget, or default 5000 if 0
    const budget = totalIncome > 0 ? totalIncome : 0;

    const changeMonth = (direction: 'prev' | 'next') => {
        const newDate = dayjs(selectedDate).add(direction === 'prev' ? -1 : 1, 'month').toISOString();
        dispatch(setSelectedDate(newDate));
    };

    const toggleFilter = (category: string) => {
        setActiveFilters(prev =>
            prev.includes(category)
                ? prev.filter(c => c !== category)
                : [...prev, category]
        );
    };

    const handleDelete = (id: number) => {
        Alert.alert(
            "Delete Transaction",
            "Are you sure you want to delete this?",
            [
                { text: "Cancel", style: "cancel" },
                { text: "Delete", style: "destructive", onPress: () => dispatch(deleteExpense(id)) }
            ]
        );
    };

    const renderItem = ({ item }: { item: Expense }) => {
        const isIncome = item.type === 'income';
        const iconName = CATEGORY_ICONS[item.category] || 'other';

        return (
            <TouchableOpacity
                activeOpacity={0.7}
                onLongPress={() => handleDelete(item.id)}
            >
                <View style={styles.transactionRow}>
                    <View style={styles.iconBox}>
                        <Icon name={iconName} size={20} color="#fff" />
                        <View style={[styles.iconBg, { backgroundColor: isIncome ? '#00C48C' : '#FF6B6B' }]} />
                    </View>
                    <View style={styles.transDetails}>
                        <Text style={styles.transTitle}>{item.title}</Text>
                        <Text style={styles.transDate}>{dayjs(item.date).format('DD MMM YYYY | hh:mm a')}</Text>
                    </View>
                    <Text style={[styles.transAmount, { color: isIncome ? '#00C48C' : '#FF6B6B' }]}>
                        {isIncome ? '+' : '-'}₹{item.amount.toFixed(0)}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />

            {/* Header with Date Picker */}
            <View style={styles.header}>
                {/* Replaced confused Home icon with simple Spacer or Logo text if desired, or just empty View to keep alignment */}
                <View style={{ width: 40 }} />
                <View style={styles.datePicker}>
                    <TouchableOpacity onPress={() => changeMonth('prev')}>
                        <Icon name="arrow-left" size={16} color="#333" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                        <Text style={styles.dateText}>{dayjs(selectedDate).format('MMMM YYYY')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => changeMonth('next')}>
                        {/* Right arrow simulated by rotating left arrow */}
                        <View style={{ transform: [{ rotate: '180deg' }] }}>
                            <Icon name="arrow-left" size={16} color="#333" />
                        </View>
                    </TouchableOpacity>
                </View>
                <View style={styles.profilePic}>
                    {/* Placeholder Profile */}
                    <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: '#ADB5BD' }} />
                </View>
            </View>

            {/* Income / Expense Summary Row */}
            <View style={styles.summaryRow}>
                <View style={styles.summaryItem}>
                    <Text style={styles.summaryLabel}>Income</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Icon name="arrow-left" size={12} color="#00C48C" />
                        <Text style={[styles.summaryValue, { color: '#212529', marginLeft: 4 }]}>₹{totalIncome.toLocaleString()}</Text>
                    </View>
                </View>
                <View style={styles.summaryItem}>
                    <Text style={styles.summaryLabel}>Expense</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <View style={{ transform: [{ rotate: '180deg' }] }}><Icon name="arrow-left" size={12} color="#FF6B6B" /></View>
                        <Text style={[styles.summaryValue, { color: '#212529', marginLeft: 4 }]}>₹{totalExpense.toLocaleString()}</Text>
                    </View>
                </View>
            </View>

            {/* Safe To Spend Circle */}
            <SafeToSpend
                totalBudget={budget}
                spent={totalExpense}
                daysLeft={daysLeft > 0 ? daysLeft : 0}
            />

            {/* Recent Transactions List */}
            <View style={styles.listContainer}>
                <View style={styles.listHeader}>
                    <Text style={styles.listTitle}>Recent Transactions</Text>
                    <TouchableOpacity onPress={() => setShowFilterModal(true)}>
                        <Icon name="filter" size={20} color={activeFilters.length > 0 ? "#4C6EF5" : "#333"} />
                    </TouchableOpacity>
                </View>

                <FlatList
                    data={currentMonthExpenses}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <Text style={{ textAlign: 'center', color: '#ADB5BD', marginTop: 20 }}>No transactions in {dayjs(selectedDate).format('MMMM')}</Text>
                    }
                />
            </View>



            <Modal visible={showDatePicker} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <TouchableOpacity onPress={() => dispatch(setSelectedDate(dayjs(selectedDate).subtract(1, 'year').toISOString()))}>
                                <Icon name="arrow-left" size={20} color="#333" />
                            </TouchableOpacity>
                            <Text style={styles.modalYear}>{dayjs(selectedDate).year()}</Text>
                            <TouchableOpacity onPress={() => dispatch(setSelectedDate(dayjs(selectedDate).add(1, 'year').toISOString()))}>
                                <View style={{ transform: [{ rotate: '180deg' }] }}><Icon name="arrow-left" size={20} color="#333" /></View>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.monthsGrid}>
                            {MONTHS.map((month, index) => (
                                <TouchableOpacity
                                    key={month}
                                    style={[styles.monthBtn, dayjs(selectedDate).month() === index && { backgroundColor: '#4C6EF5' }]}
                                    onPress={() => {
                                        const newDate = dayjs(selectedDate).month(index).toISOString();
                                        dispatch(setSelectedDate(newDate));
                                        setShowDatePicker(false);
                                    }}
                                >
                                    <Text style={[styles.monthText, dayjs(selectedDate).month() === index && { color: 'white' }]}>{month.substring(0, 3)}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                        <TouchableOpacity style={styles.closeBtn} onPress={() => setShowDatePicker(false)}>
                            <Text style={styles.closeText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Filter Modal */}
            <Modal visible={showFilterModal} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalYear}>Filter Categories</Text>
                            <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                                <Icon name="close" size={24} color="#333" />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.monthsGrid}>
                            {Object.keys(CATEGORY_ICONS).map((category) => (
                                <TouchableOpacity
                                    key={category}
                                    style={[styles.monthBtn, activeFilters.includes(category) && { backgroundColor: '#4C6EF5' }]}
                                    onPress={() => toggleFilter(category)}
                                >
                                    <Text style={[styles.monthText, activeFilters.includes(category) && { color: 'white' }]}>{category}</Text>
                                </TouchableOpacity>
                            ))}
                            {/* Clear Filters Button */}
                            <TouchableOpacity
                                style={[styles.monthBtn, { backgroundColor: '#FF8787', width: '100%', marginTop: 10 }]}
                                onPress={() => { setActiveFilters([]); setShowFilterModal(false); }}
                            >
                                <Text style={[styles.monthText, { color: 'white' }]}>Clear All Filters</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FA', paddingHorizontal: 20, },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    menuBtn: { padding: 8, backgroundColor: '#fff', borderRadius: 8, elevation: 1 },
    datePicker: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    dateText: { fontSize: 16, fontWeight: '700', color: '#212529', textTransform: 'uppercase' },
    profilePic: { padding: 4, backgroundColor: '#fff', borderRadius: 20, elevation: 1 },

    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20, paddingHorizontal: 20 },
    summaryItem: { alignItems: 'center', flex: 1 },
    summaryLabel: { fontSize: 12, color: '#868E96', marginBottom: 4 },
    summaryValue: { fontSize: 20, fontWeight: '700' },

    listContainer: { flex: 1 },
    listHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    listTitle: { fontSize: 18, fontWeight: '700', color: '#212529' },
    listContent: { paddingBottom: 150 },

    transactionRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 16, borderRadius: 16, marginBottom: 12, elevation: 1 },
    iconBox: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
    iconBg: { position: 'absolute', width: 40, height: 40, borderRadius: 12, opacity: 0.2 },
    transDetails: { flex: 1 },
    transTitle: { fontSize: 16, fontWeight: '600', color: '#212529', marginBottom: 2 },
    transDate: { fontSize: 12, color: '#ADB5BD' },
    transAmount: { fontSize: 16, fontWeight: '700', color: '#212529' },



    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
    modalContent: { width: '85%', backgroundColor: 'white', borderRadius: 20, padding: 20, elevation: 5 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    modalYear: { fontSize: 20, fontWeight: '700', color: '#212529' },
    monthsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
    monthBtn: { width: '30%', paddingVertical: 12, alignItems: 'center', marginBottom: 12, borderRadius: 8, backgroundColor: '#F8F9FA' },
    monthText: { fontSize: 14, fontWeight: '600', color: '#495057' },
    closeBtn: { marginTop: 12, alignItems: 'center', padding: 12 },
    closeText: { color: '#FA5252', fontWeight: '600' }
});

export default HomeScreen;
