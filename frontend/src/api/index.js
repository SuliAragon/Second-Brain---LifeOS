/**
 * API Module Index
 * Re-exports all API functions for easy importing
 */

// Config
export { API_URL, apiRequest } from './config';

// Tasks
export {
    fetchTasks,
    createTask,
    updateTask,
    deleteTask
} from './tasks';

// Finance
export {
    fetchTransactions,
    createTransaction,
    deleteTransaction,
    fetchFinanceCategories,
    createFinanceCategory,
    deleteFinanceCategory,
    fetchBudgets,
    fetchCurrentMonthBudgets,
    createBudget,
    updateBudget,
    deleteBudget,
    fetchSavingsGoals,
    createSavingsGoal,
    updateSavingsGoal,
    addFundsToGoal,
    deleteSavingsGoal
} from './finance';

// Projects
export {
    fetchProjects,
    createProject,
    updateProject,
    deleteProject,
    fetchObjectives,
    createObjective,
    updateObjective,
    deleteObjective
} from './projects';

// Journal
export {
    fetchEntries,
    createEntry,
    updateEntry,
    deleteEntry,
    fetchCategories,
    createCategory,
    deleteCategory
} from './journal';

// Backup
export {
    exportAllData,
    importAllData
} from './backup';
