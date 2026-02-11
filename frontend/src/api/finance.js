import { apiRequest } from './config';

/**
 * Finance API
 * Transactions, Categories, Budgets, and Savings Goals
 */

// Transactions
export const fetchTransactions = () => apiRequest('/transactions/');

export const createTransaction = (transaction) =>
    apiRequest('/transactions/', {
        method: 'POST',
        body: JSON.stringify(transaction),
    });

export const deleteTransaction = (id) =>
    apiRequest(`/transactions/${id}/`, { method: 'DELETE' });

// Finance Categories
export const fetchFinanceCategories = () => apiRequest('/finance-categories/');

export const createFinanceCategory = (category) =>
    apiRequest('/finance-categories/', {
        method: 'POST',
        body: JSON.stringify(category),
    });

export const deleteFinanceCategory = (id) =>
    apiRequest(`/finance-categories/${id}/`, { method: 'DELETE' });

// Budgets
export const fetchBudgets = () => apiRequest('/budgets/');

export const fetchCurrentMonthBudgets = () => apiRequest('/budgets/current_month/');

export const createBudget = (budget) =>
    apiRequest('/budgets/', {
        method: 'POST',
        body: JSON.stringify(budget),
    });

export const updateBudget = (id, updates) =>
    apiRequest(`/budgets/${id}/`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
    });

export const deleteBudget = (id) =>
    apiRequest(`/budgets/${id}/`, { method: 'DELETE' });

// Savings Goals
export const fetchSavingsGoals = () => apiRequest('/savings-goals/');

export const createSavingsGoal = (goal) =>
    apiRequest('/savings-goals/', {
        method: 'POST',
        body: JSON.stringify(goal),
    });

export const updateSavingsGoal = (id, updates) =>
    apiRequest(`/savings-goals/${id}/`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
    });

export const addFundsToGoal = (id, amount) =>
    apiRequest(`/savings-goals/${id}/add_funds/`, {
        method: 'POST',
        body: JSON.stringify({ amount }),
    });

export const deleteSavingsGoal = (id) =>
    apiRequest(`/savings-goals/${id}/`, { method: 'DELETE' });
