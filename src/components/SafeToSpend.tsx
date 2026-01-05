import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

interface SafeToSpendProps {
    totalBudget: number;
    spent: number;
    daysLeft: number;
}

const SafeToSpend: React.FC<SafeToSpendProps> = ({ totalBudget, spent, daysLeft }) => {
    const size = 200;
    const strokeWidth = 15;
    const center = size / 2;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;

    // Calculate progress (inverse because we want visual "remaining" or "spent"?)
    // Figma shows a green circle that is incomplete. Let's assume it represents "Safe to Spend" amount remaining relative to budget.
    // Or it represents "Spent" amount. Let's assume it's "Spent" but colored green if safe.
    // The text says "Safe to Spend ₹27,678".

    const budgetSafe = isNaN(totalBudget) ? 0 : totalBudget;
    const spentSafe = isNaN(spent) ? 0 : spent;
    const remaining = budgetSafe - spentSafe;

    // Prevent division by zero or NaN results
    const progress = budgetSafe > 0 ? Math.min(Math.max(remaining / budgetSafe, 0), 1) : 0;
    const strokeDashoffset = isNaN(circumference * (1 - progress)) ? 0 : circumference * (1 - progress);

    // Safeguard for text display
    const remainingDisplay = isNaN(remaining) ? "0" : remaining.toFixed(0);
    const daysLeftDisplay = isNaN(daysLeft) ? "-" : daysLeft;

    return (
        <View style={styles.container}>
            <View style={styles.svgContainer}>
                <Svg width={size} height={size}>
                    <Circle
                        stroke="#E9ECEF"
                        cx={center}
                        cy={center}
                        r={radius}
                        strokeWidth={strokeWidth}
                    />
                    <Circle
                        stroke="#00C48C" // Green
                        cx={center}
                        cy={center}
                        r={radius}
                        strokeWidth={strokeWidth}
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        transform={`rotate(-90 ${center} ${center})`}
                    />
                </Svg>
                <View style={styles.innerContent}>
                    <Text style={styles.label}>Safe to spend</Text>
                    <Text style={styles.amount}>₹{remainingDisplay}</Text>
                    <Text style={styles.daysLeft}>{daysLeftDisplay} days left</Text>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { alignItems: 'center', justifyContent: 'center', marginVertical: 20 },
    svgContainer: { position: 'relative', width: 200, height: 200, alignItems: 'center', justifyContent: 'center' },
    innerContent: { position: 'absolute', alignItems: 'center' },
    label: { fontSize: 14, color: '#868E96', fontWeight: '500' },
    amount: { fontSize: 24, fontWeight: '700', color: '#212529', marginVertical: 4 },
    daysLeft: { fontSize: 12, color: '#ADB5BD' },
});

export default SafeToSpend;
