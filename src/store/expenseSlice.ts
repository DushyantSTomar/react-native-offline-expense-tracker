import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Expense } from '../types';
import { getDBConnection, getExpenses, insertExpense, deleteExpense as deleteExpenseDB } from '../db/Database';

interface ExpenseState {
    expenses: Expense[];
    totalIncome: number;
    totalExpense: number;
    selectedDate: string;
    loading: boolean;
    error: string | null;
}

const initialState: ExpenseState = {
    expenses: [],
    totalIncome: 0,
    totalExpense: 0,
    selectedDate: new Date().toISOString(),
    loading: false,
    error: null,
};

export const loadExpenses = createAsyncThunk('expenses/loadExpenses', async () => {
    try {
        const db = await getDBConnection();
        const expenses = await getExpenses(db);
        return expenses;
    } catch (error) {
        throw error;
    }
});

export const addExpense = createAsyncThunk('expenses/addExpense', async (expense: Omit<Expense, 'id'>) => {
    try {
        const db = await getDBConnection();
        await insertExpense(db, expense);
        const expenses = await getExpenses(db);
        return expenses;
    } catch (error) {
        throw error;
    }
});

export const deleteExpense = createAsyncThunk('expenses/deleteExpense', async (id: number) => {
    try {
        const db = await getDBConnection();
        await deleteExpenseDB(db, id);
        return id;
    } catch (error) {
        throw error;
    }
});

const expenseSlice = createSlice({
    name: 'expenses',
    initialState,
    reducers: {
        setSelectedDate: (state, action: PayloadAction<string>) => {
            state.selectedDate = action.payload;
        }
    },
    extraReducers: (builder) => {
        // Load Expenses
        builder.addCase(loadExpenses.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(loadExpenses.fulfilled, (state, action: PayloadAction<Expense[]>) => {
            state.loading = false;
            state.expenses = action.payload;
            state.totalIncome = action.payload
                .filter(e => e.type === 'income')
                .reduce((sum, item) => sum + item.amount, 0);
            state.totalExpense = action.payload
                .filter(e => e.type === 'expense' || !e.type)
                .reduce((sum, item) => sum + item.amount, 0);
        });
        builder.addCase(loadExpenses.rejected, (state, action) => {
            state.loading = false;
            state.error = action.error.message || 'Failed to load expenses';
        });

        // Add Expense
        builder.addCase(addExpense.fulfilled, (state, action: PayloadAction<Expense[]>) => {
            state.expenses = action.payload;
            state.totalIncome = action.payload
                .filter(e => e.type === 'income')
                .reduce((sum, item) => sum + item.amount, 0);
            state.totalExpense = action.payload
                .filter(e => e.type === 'expense' || !e.type)
                .reduce((sum, item) => sum + item.amount, 0);
        });

        // Delete Expense
        builder.addCase(deleteExpense.fulfilled, (state, action: PayloadAction<number>) => {
            state.expenses = state.expenses.filter((item) => item.id !== action.payload);
            state.totalIncome = state.expenses
                .filter(e => e.type === 'income')
                .reduce((sum, item) => sum + item.amount, 0);
            state.totalExpense = state.expenses
                .filter(e => e.type === 'expense' || !e.type)
                .reduce((sum, item) => sum + item.amount, 0);
        });
    },
});

export const { setSelectedDate } = expenseSlice.actions;
export default expenseSlice.reducer;
