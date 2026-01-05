import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, Platform, KeyboardAvoidingView } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { addExpense, deleteExpense } from '../store/expenseSlice';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import Icon from '../components/Icon';
import dayjs from 'dayjs';
import { SafeAreaView } from 'react-native-safe-area-context';

type Props = {
    navigation: NativeStackNavigationProp<RootStackParamList, 'AddExpense'>;
};

const CATEGORIES = ['Food', 'Transport', 'Shopping', 'Bills', 'Health', 'Entertainment', 'Other'];

const AddExpenseScreen: React.FC<Props> = ({ navigation }) => {
    const dispatch = useDispatch<AppDispatch>();
    const { expenses = [], selectedDate } = useSelector((state: RootState) => state.expenses || {});

    const [title, setTitle] = useState('');
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('');
    const [type, setType] = useState<'income' | 'expense'>('expense');

    // Find existing income for the selected month to pre-fill
    const existingIncome = React.useMemo(() => {
        return expenses
            .filter(e => e.type === 'income' && dayjs(e.date).isSame(selectedDate, 'month'))
            .reduce((sum, e) => sum + e.amount, 0); // Sum because we want to show total monthly income
    }, [expenses, selectedDate]);

    // Handle Tab Change and Form Reset
    React.useEffect(() => {
        if (type === 'income') {
            // If switching to Income, pre-fill with existing income if any
            if (existingIncome > 0) {
                setAmount(existingIncome.toString());
            } else {
                setAmount('');
            }
        } else {
            // Expense mode: clear fields
            setTitle('');
            setAmount('');
            setCategory('');
        }
    }, [type, existingIncome]); // Re-run when type changes or existingIncome updates (e.g. initial load)

    const handleSave = async () => {
        // Validation
        if (type === 'expense' && (!title || !amount || !category)) {
            Alert.alert('Error', 'Please fill all fields for expense');
            return;
        }

        // Prevent adding expense if no income is set for this month
        if (type === 'expense' && existingIncome <= 0) {
            Alert.alert(
                'Income Required',
                'You cannot add expenses without setting a monthly income first. Please switch to the Income tab to set your budget.'
            );
            return;
        }
        if (type === 'income' && !amount) {
            Alert.alert('Error', 'Please enter income amount');
            return;
        }

        const numAmount = parseFloat(amount);
        if (isNaN(numAmount) || numAmount <= 0) {
            Alert.alert('Error', 'Invalid amount');
            return;
        }

        try {
            if (type === 'income') {
                // Logic: "Upsert" Income. 
                // 1. Delete all existing income transactions for this month to avoid duplicates/messy history since we treat it as a budget setting.
                const oldIncomes = expenses.filter(e => e.type === 'income' && dayjs(e.date).isSame(selectedDate, 'month'));
                for (const inc of oldIncomes) {
                    await dispatch(deleteExpense(inc.id)).unwrap();
                }

                // 2. Add new single income entry
                await dispatch(addExpense({
                    title: 'Monthly Income',
                    amount: numAmount,
                    category: 'Income',
                    type: 'income',
                    date: selectedDate // Use selectedDate to ensure it stays in currently viewed month
                })).unwrap();

            } else {
                // Normal Expense Addition
                await dispatch(addExpense({
                    title,
                    amount: numAmount,
                    category,
                    type,
                    date: new Date().toISOString() // Expenses are "Now"
                })).unwrap();
            }

            navigation.goBack();
        } catch (error) {
            Alert.alert('Error', 'Could not save transaction');
        }
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#F8F9FA' }} edges={['top', 'left', 'right']}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.container}
            >
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Icon name="arrow-left" size={24} color="#333" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Add Transaction</Text>
                    <View style={{ width: 40 }} />
                </View>

                <ScrollView contentContainerStyle={styles.content}>

                    {/* Type Segmented Control */}
                    <View style={styles.segmentContainer}>
                        <TouchableOpacity
                            style={[styles.segmentBtn, type === 'expense' && styles.segmentBtnActive, { backgroundColor: type === 'expense' ? '#FA5252' : '#F1F3F5' }]}
                            onPress={() => setType('expense')}
                        >
                            <Text style={[styles.segmentText, type === 'expense' && styles.segmentTextActive]}>Expense</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.segmentBtn, type === 'income' && styles.segmentBtnActive, { backgroundColor: type === 'income' ? '#20C997' : '#F1F3F5' }]}
                            onPress={() => setType('income')}
                        >
                            <Text style={[styles.segmentText, type === 'income' && styles.segmentTextActive]}>Income</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.amountSection}>
                        <Text style={[styles.currencySymbol, { color: type === 'income' ? '#20C997' : '#FA5252' }]}>₹</Text>
                        <TextInput
                            style={[styles.amountInput, { color: type === 'income' ? '#20C997' : '#FA5252' }]}
                            placeholder="0.00"
                            placeholderTextColor="#ADB5BD"
                            keyboardType="numeric"
                            value={amount}
                            onChangeText={setAmount}
                            autoFocus
                        />
                    </View>

                    {/* Only show Title and Category for Expense */}
                    {type === 'expense' && (
                        <>
                            <Text style={styles.label}>Title</Text>
                            <View style={styles.inputContainer}>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Grocery, Rent, etc."
                                    value={title}
                                    onChangeText={setTitle}
                                />
                            </View>

                            <Text style={styles.label}>Category</Text>
                            <View style={styles.categoryContainer}>
                                {CATEGORIES.map((cat) => (
                                    <TouchableOpacity
                                        key={cat}
                                        style={[styles.categoryChip, category === cat && { backgroundColor: '#FA5252', borderColor: '#FA5252' }]}
                                        onPress={() => setCategory(cat)}
                                    >
                                        <Text style={[styles.categoryText, category === cat && styles.categoryTextSelected]}>{cat}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </>
                    )}

                    {type === 'income' && (
                        <Text style={{ textAlign: 'center', color: '#868E96', marginTop: 20 }}>
                            Setting monthly income for {dayjs(selectedDate).format('MMMM YYYY')}
                        </Text>
                    )}

                </ScrollView>

                <View style={styles.footer}>
                    <TouchableOpacity style={[styles.saveBtn, { backgroundColor: type === 'income' ? '#20C997' : '#FA5252' }]} onPress={handleSave}>
                        <Text style={styles.saveText}>{type === 'income' ? 'Set Income' : 'Save Expense'}</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FA' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16 },
    backBtn: { padding: 8, backgroundColor: 'white', borderRadius: 12, elevation: 1 },
    headerTitle: { fontSize: 20, fontWeight: '700', color: '#212529' },

    content: { padding: 24, paddingBottom: 100 },

    amountSection: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 40, marginTop: 20 },
    currencySymbol: { fontSize: 32, fontWeight: '700', color: '#ADB5BD', marginRight: 4 },
    amountInput: { fontSize: 48, fontWeight: '700', color: '#212529', minWidth: 100, textAlign: 'center' },

    label: { fontSize: 14, fontWeight: '600', color: '#868E96', marginBottom: 12, marginLeft: 4 },
    inputContainer: { backgroundColor: 'white', borderRadius: 16, marginBottom: 24, shadowColor: '#000', shadowOpacity: 0.02, shadowRadius: 4, elevation: 1 },
    input: { padding: 16, fontSize: 16, color: '#212529' },

    categoryContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    categoryChip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, backgroundColor: 'white', borderWidth: 1, borderColor: '#DEE2E6' },
    categoryChipSelected: { backgroundColor: '#4C6EF5', borderColor: '#4C6EF5' },
    categoryText: { fontSize: 14, color: '#495057', fontWeight: '500' },
    categoryTextSelected: { color: 'white' },

    footer: { padding: 24, backgroundColor: 'white', borderTopWidth: 1, borderTopColor: '#F1F3F5' },
    saveBtn: { backgroundColor: '#212529', padding: 18, borderRadius: 16, alignItems: 'center' },
    saveText: { color: 'white', fontSize: 18, fontWeight: '700' },

    segmentContainer: { flexDirection: 'row', backgroundColor: '#F1F3F5', borderRadius: 12, padding: 4, marginBottom: 20 },
    segmentBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
    segmentBtnActive: {},
    segmentText: { fontSize: 14, fontWeight: '600', color: '#ADB5BD' },
    segmentTextActive: { color: 'white' },
});

export default AddExpenseScreen;
