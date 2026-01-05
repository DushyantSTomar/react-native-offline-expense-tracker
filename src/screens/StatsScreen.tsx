import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { PieChart } from 'react-native-chart-kit';
import dayjs from 'dayjs';
import Icon from '../components/Icon';
import { SafeAreaView } from 'react-native-safe-area-context';

const CATEGORY_COLORS: Record<string, string> = {
    Food: '#FF8787',
    Transport: '#4C6EF5',
    Shopping: '#20C997',
    Bills: '#FAB005',
    Health: '#FA5252',
    Entertainment: '#BE4BDB',
    Other: '#868E96'
};

const StatsScreen = () => {
    const navigation = useNavigation<any>();
    const { expenses = [], selectedDate } = useSelector((state: RootState) => state.expenses || {});

    // Filter by selected month from Redux
    const currentMonthExpenses = useMemo(() => {
        return expenses.filter(e => dayjs(e.date).isSame(selectedDate, 'month') && (e.type === 'expense' || !e.type));
    }, [expenses, selectedDate]);

    const totalExpense = currentMonthExpenses.reduce((sum, e) => sum + e.amount, 0);

    const chartData = useMemo(() => {
        const categoryMap: Record<string, number> = {};

        currentMonthExpenses.forEach(e => {
            categoryMap[e.category] = (categoryMap[e.category] || 0) + e.amount;
        });

        return Object.keys(categoryMap).map(cat => ({
            name: cat,
            population: categoryMap[cat],
            color: CATEGORY_COLORS[cat] || '#868E96',
            legendFontColor: "#7F7F7F",
            legendFontSize: 12
        })).sort((a, b) => b.population - a.population);
    }, [currentMonthExpenses]);

    // ... inside StatsScreen

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.navigate('HomeTab')}>
                    <Icon name="arrow-left" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Top Spend Areas</Text>
                <TouchableOpacity onPress={() => Alert.alert('Shopping', 'Detailed shopping breakdown coming soon!')}>
                    <Icon name="shopping" size={24} color="#333" />
                </TouchableOpacity>
            </View>

            {/* Center Chart */}
            <View style={styles.chartContainer}>
                <PieChart
                    data={chartData}
                    width={Dimensions.get('window').width}
                    height={220}
                    chartConfig={{
                        backgroundColor: '#ffffff',
                        backgroundGradientFrom: '#ffffff',
                        backgroundGradientTo: '#ffffff',
                        color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                    }}
                    accessor={"population"}
                    backgroundColor={"transparent"}
                    paddingLeft={"15"}
                    center={[Dimensions.get('window').width / 4, 0]}
                    absolute={false}
                    hasLegend={false}
                />
                <View style={styles.centerLabel}>
                    <Text style={styles.centerLabelTitle}>Total Expense</Text>
                    <Text style={styles.centerLabelAmount}>₹{totalExpense.toLocaleString()}</Text>
                </View>
            </View>

            {/* List Breakdown */}
            <FlatList
                data={chartData}
                keyExtractor={(item) => item.name}
                renderItem={({ item }) => (
                    <View style={styles.row}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <View style={[styles.dot, { backgroundColor: item.color }]} />
                            <Text style={styles.catName}>{item.name}</Text>
                        </View>
                        <View>
                            <Text style={styles.amount}>₹{item.population.toLocaleString()}</Text>
                            <Text style={styles.percent}>{((item.population / totalExpense) * 100).toFixed(1)}%</Text>
                        </View>
                    </View>
                )}
                contentContainerStyle={styles.list}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 20 },
    headerTitle: { fontSize: 18, fontWeight: '700', color: '#212529' },

    chartContainer: { alignItems: 'center', justifyContent: 'center', height: 250 },
    centerLabel: { position: 'absolute', alignItems: 'center' },
    centerLabelTitle: { fontSize: 12, color: '#868E96' },
    centerLabelAmount: { fontSize: 24, fontWeight: '700', color: '#212529' },

    list: { paddingHorizontal: 20, paddingBottom: 100 },
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    dot: { width: 40, height: 40, borderRadius: 12, marginRight: 12, opacity: 0.2 },
    catName: { fontSize: 16, fontWeight: '600', color: '#212529' },
    amount: { fontSize: 16, fontWeight: '700', color: '#212529', textAlign: 'right' },
    percent: { fontSize: 12, color: '#868E96', textAlign: 'right' },
});

export default StatsScreen;
