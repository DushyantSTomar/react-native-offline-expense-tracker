export interface Expense {
  id: number;
  title: string;
  amount: number;
  category: string;
  type: 'income' | 'expense';
  date: string; // ISO 8601
}
