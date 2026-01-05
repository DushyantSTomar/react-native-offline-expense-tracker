import SQLite from 'react-native-sqlite-storage';
import { Expense } from '../types';

SQLite.enablePromise(true);

const database_name = 'ExpenseTracker.db';
const database_version = '1.0';
const database_displayname = 'Expense Tracker Database';
const database_size = 200000;

export const getDBConnection = async () => {
    return SQLite.openDatabase(
        { name: database_name, location: 'default' },
        () => { console.log('DB opened'); },
        (err) => { console.log('Error opening DB: ', err); }
    );
};

export const createTables = async (db: SQLite.SQLiteDatabase) => {
    const query = `CREATE TABLE IF NOT EXISTS expenses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        amount REAL NOT NULL,
        category TEXT NOT NULL,
        type TEXT DEFAULT 'expense', 
        date TEXT NOT NULL
    );`;

    try {
        await db.executeSql(query);
        // Migration attempt for existing users (simplistic)
        try {
            await db.executeSql(`ALTER TABLE expenses ADD COLUMN type TEXT DEFAULT 'expense'`);
            console.log("Migrated 'type' column");
        } catch (e) {
            // Column likely exists
        }
    } catch (error) {
        console.error('Error creating table', error);
        throw error;
    }
};

export const insertExpense = async (db: SQLite.SQLiteDatabase, expense: Omit<Expense, 'id'>) => {
    const query = `INSERT INTO expenses (title, amount, category, type, date) VALUES (?, ?, ?, ?, ?)`;
    const params = [expense.title, expense.amount, expense.category, expense.type, expense.date];

    try {
        const results = await db.executeSql(query, params);
        return results[0];
    } catch (error) {
        console.error('Error adding expense', error);
        throw error;
    }
};

export const getExpenses = async (db: SQLite.SQLiteDatabase): Promise<Expense[]> => {
    try {
        const expenses: Expense[] = [];
        const results = await db.executeSql(`SELECT * FROM expenses ORDER BY date DESC`);
        results.forEach(result => {
            for (let index = 0; index < result.rows.length; index++) {
                expenses.push(result.rows.item(index));
            }
        });
        return expenses;
    } catch (error) {
        console.error('Error getting expenses', error);
        throw error;
    }
};

export const deleteExpense = async (db: SQLite.SQLiteDatabase, id: number) => {
    const query = `DELETE FROM expenses WHERE id = ?`;
    try {
        const results = await db.executeSql(query, [id]);
        return results[0];
    } catch (error) {
        console.error('Error deleting expense', error);
        throw error;
    }
};
