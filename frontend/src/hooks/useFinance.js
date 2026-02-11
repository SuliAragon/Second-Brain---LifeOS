import { useState, useEffect, useCallback } from 'react';
import {
    fetchTransactions,
    createTransaction as apiCreateTransaction,
    deleteTransaction as apiDeleteTransaction,
    fetchFinanceCategories,
    createFinanceCategory as apiCreateCategory,
    fetchCurrentMonthBudgets,
    createBudget as apiCreateBudget,
    fetchSavingsGoals,
    createSavingsGoal as apiCreateGoal,
    addFundsToGoal as apiAddFunds,
    deleteSavingsGoal as apiDeleteGoal,
} from '../api';

/**
 * Custom hook for finance management
 * Handles transactions, budgets, and savings goals
 */
export function useFinance() {
    const [transactions, setTransactions] = useState([]);
    const [categories, setCategories] = useState([]);
    const [budgets, setBudgets] = useState([]);
    const [goals, setGoals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadAllData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const [txData, catData, budgetData, goalsData] = await Promise.all([
                fetchTransactions(),
                fetchFinanceCategories(),
                fetchCurrentMonthBudgets(),
                fetchSavingsGoals(),
            ]);
            setTransactions(txData);
            setCategories(catData);
            setBudgets(budgetData);
            setGoals(goalsData);
        } catch (err) {
            setError(err.message);
            console.error('Error loading finance data:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    const createTransaction = useCallback(async (data) => {
        const newTx = await apiCreateTransaction(data);
        setTransactions(prev => [newTx, ...prev]);
        // Reload budgets to update spent amounts
        const updatedBudgets = await fetchCurrentMonthBudgets();
        setBudgets(updatedBudgets);
        return newTx;
    }, []);

    const deleteTransaction = useCallback(async (id) => {
        await apiDeleteTransaction(id);
        setTransactions(prev => prev.filter(t => t.id !== id));
        // Reload budgets to update spent amounts
        const updatedBudgets = await fetchCurrentMonthBudgets();
        setBudgets(updatedBudgets);
    }, []);

    const createCategory = useCallback(async (data) => {
        const newCat = await apiCreateCategory(data);
        setCategories(prev => [...prev, newCat]);
        return newCat;
    }, []);

    const createBudget = useCallback(async (data) => {
        const newBudget = await apiCreateBudget(data);
        setBudgets(prev => [...prev, newBudget]);
        return newBudget;
    }, []);

    const createGoal = useCallback(async (data) => {
        const newGoal = await apiCreateGoal(data);
        setGoals(prev => [...prev, newGoal]);
        return newGoal;
    }, []);

    const addFundsToGoal = useCallback(async (id, amount) => {
        const updated = await apiAddFunds(id, amount);
        setGoals(prev => prev.map(g => g.id === id ? updated : g));
        return updated;
    }, []);

    const deleteGoal = useCallback(async (id) => {
        await apiDeleteGoal(id);
        setGoals(prev => prev.filter(g => g.id !== id));
    }, []);

    // Listen for refresh events from chat
    useEffect(() => {
        const handleRefresh = () => loadAllData();
        window.addEventListener('refresh-finance', handleRefresh);
        return () => window.removeEventListener('refresh-finance', handleRefresh);
    }, [loadAllData]);

    // Initial load
    useEffect(() => {
        loadAllData();
    }, [loadAllData]);

    // Computed values
    const totalIncome = transactions
        .filter(t => t.type === 'INCOME')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    const totalExpenses = transactions
        .filter(t => t.type === 'EXPENSE')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    const balance = totalIncome - totalExpenses;

    return {
        transactions,
        categories,
        budgets,
        goals,
        loading,
        error,
        totalIncome,
        totalExpenses,
        balance,
        loadAllData,
        createTransaction,
        deleteTransaction,
        createCategory,
        createBudget,
        createGoal,
        addFundsToGoal,
        deleteGoal,
    };
}
