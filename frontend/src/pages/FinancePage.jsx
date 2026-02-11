import React, { useState, useMemo } from 'react';
import {
    LayoutDashboard,
    List,
    ChevronLeft,
    ChevronRight,
    Wallet
} from 'lucide-react';
import { format, parseISO, startOfMonth, addMonths, subMonths, isSameMonth } from 'date-fns';
import { useLanguage } from '../context/LanguageContext';
import { useFinance } from '../hooks/useFinance';
import { useConfirmModal } from '../components/ConfirmModal';
import { PageContainer, PageHeader } from '../components/layout';
import { LoadingPage } from '../components/common';
import {
    FinanceStats,
    FinanceChart,
    TransactionForm,
    TransactionList,
    TransactionTable,
    BudgetList,
    SavingsGoalsList
} from '../components/finance';
import { formatCurrency } from '../utils/formatters';

export function FinancePage({ darkMode }) {
    const { t, getLocale } = useLanguage();
    const locale = getLocale();
    const {
        transactions,
        categories,
        budgets,
        goals,
        loading,
        createTransaction,
        deleteTransaction,
        createGoal,
        addFundsToGoal,
        deleteGoal
    } = useFinance();

    const { showAlert, showInput, showDelete, ModalComponent } = useConfirmModal();

    // View State
    const [viewMode, setViewMode] = useState('MONTHLY'); // 'MONTHLY' | 'TOTAL'
    const [financeView, setFinanceView] = useState('DASHBOARD'); // 'DASHBOARD' | 'LIST'
    const [currentDate, setCurrentDate] = useState(new Date());

    // Derived Data Logic
    const filteredTransactions = useMemo(() => {
        return viewMode === 'TOTAL'
            ? transactions
            : transactions.filter(tx => isSameMonth(parseISO(tx.date), currentDate));
    }, [transactions, viewMode, currentDate]);

    const { income, expense, balance } = useMemo(() => {
        const income = filteredTransactions
            .filter(tx => tx.type === 'INCOME')
            .reduce((acc, tx) => acc + parseFloat(tx.amount), 0);
        const expense = filteredTransactions
            .filter(tx => tx.type === 'EXPENSE')
            .reduce((acc, tx) => acc + parseFloat(tx.amount), 0);
        return { income, expense, balance: income - expense };
    }, [filteredTransactions]);

    // Chart Data Preparation
    const { chartData, expenseKeys } = useMemo(() => {
        let chartData = [];
        let expenseKeys = [];

        if (viewMode === 'TOTAL') {
            const monthlyStats = {};
            transactions.forEach(tx => {
                const monthKey = tx.date.substring(0, 7);
                if (!monthlyStats[monthKey]) monthlyStats[monthKey] = { income: 0, expense: 0 };
                if (tx.type === 'INCOME') monthlyStats[monthKey].income += parseFloat(tx.amount);
                else monthlyStats[monthKey].expense += parseFloat(tx.amount);
            });

            const sortedMonths = Object.keys(monthlyStats).sort();
            chartData = sortedMonths.map(month => ({
                name: format(parseISO(month + '-01'), 'MMM', { locale }),
                [t('finance', 'income')]: monthlyStats[month].income,
                [t('finance', 'expenses')]: monthlyStats[month].expense
            }));
        } else {
            const expenseTransactions = filteredTransactions.filter(tx => tx.type === 'EXPENSE');
            const expenseBreakdown = {};

            expenseTransactions.forEach(tx => {
                const key = tx.title;
                if (!expenseBreakdown[key]) expenseBreakdown[key] = 0;
                expenseBreakdown[key] += parseFloat(tx.amount);
            });

            expenseKeys = Object.keys(expenseBreakdown);

            chartData = [
                {
                    name: t('finance', 'income'),
                    amount: income,
                },
                {
                    name: t('finance', 'expenses'),
                    ...expenseBreakdown
                }
            ];
        }
        return { chartData, expenseKeys };
    }, [transactions, filteredTransactions, viewMode, income, t, locale]);

    // Handlers
    const handleTransactionSubmit = async (data) => {
        await createTransaction(data);
    };

    const handleDeleteTransaction = async (id) => {
        try {
            await deleteTransaction(id);
        } catch (error) {
            console.error(error);
            showAlert('Error', 'Failed to delete transaction');
        }
    };

    const handleAddFunds = async (goal) => {
        const addAmount = await showInput('Añadir Fondos', `¿Cuánto quieres añadir a "${goal.name}"?`);
        if (addAmount && !isNaN(parseFloat(addAmount))) {
            try {
                await addFundsToGoal(goal.id, parseFloat(addAmount));
            } catch (error) {
                showAlert('Error', 'Failed to add funds');
            }
        }
    };

    const handleDeleteGoal = async (goal) => {
        const confirmed = await showDelete('Eliminar Meta', `¿Estás seguro de eliminar "${goal.name}"?`);
        if (confirmed) {
            try {
                await deleteGoal(goal.id);
            } catch (error) {
                showAlert('Error', 'Failed to delete goal');
            }
        }
    };

    if (loading) return <LoadingPage message="Loading finance data..." />;

    const viewToggleAction = (
        <div className="flex items-center gap-4">
            <div className="flex bg-life-bg-base p-1 rounded border border-life-border">
                <button
                    onClick={() => setFinanceView('DASHBOARD')}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all flex items-center gap-2 ${financeView === 'DASHBOARD' ? 'bg-life-text-base text-life-bg-base shadow-sm' : 'text-life-text-muted hover:text-life-text-base'}`}
                >
                    <LayoutDashboard size={16} /> Dashboard
                </button>
                <button
                    onClick={() => setFinanceView('LIST')}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all flex items-center gap-2 ${financeView === 'LIST' ? 'bg-life-text-base text-life-bg-base shadow-sm' : 'text-life-text-muted hover:text-life-text-base'}`}
                >
                    <List size={16} /> Lista
                </button>
            </div>

            <div className="flex bg-life-bg-base p-1 rounded border border-life-border">
                <button
                    onClick={() => setViewMode('MONTHLY')}
                    className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${viewMode === 'MONTHLY' ? 'bg-life-text-base text-life-bg-base shadow-sm' : 'text-life-text-muted hover:text-life-text-base'}`}
                >
                    {t('finance', 'monthly')}
                </button>
                <button
                    onClick={() => setViewMode('TOTAL')}
                    className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${viewMode === 'TOTAL' ? 'bg-life-text-base text-life-bg-base shadow-sm' : 'text-life-text-muted hover:text-life-text-base'}`}
                >
                    {t('finance', 'total')}
                </button>
            </div>
        </div>
    );

    return (
        <PageContainer>
            {ModalComponent}

            <PageHeader
                title={t('finance', 'title')}
                action={viewToggleAction}
            />

            {/* Month Selector */}
            {viewMode === 'MONTHLY' && (
                <div className="flex justify-center mb-8">
                    <div className="flex items-center gap-4 bg-life-bg-base px-4 py-2 rounded border border-life-border shadow-sm">
                        <button
                            onClick={() => setCurrentDate(subMonths(currentDate, 1))}
                            className="p-1 hover:bg-life-bg-alt rounded transition-colors text-life-text-base"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <span className="text-lg font-bold text-life-text-base min-w-[140px] text-center capitalize">
                            {format(currentDate, 'MMMM yyyy', { locale })}
                        </span>
                        <button
                            onClick={() => setCurrentDate(addMonths(currentDate, 1))}
                            className="p-1 hover:bg-life-bg-alt rounded transition-colors text-life-text-base"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>
            )}

            {financeView === 'LIST' ? (
                <TransactionTable
                    transactions={filteredTransactions}
                    onDelete={handleDeleteTransaction}
                    viewMode={viewMode}
                    currentDate={currentDate}
                />
            ) : (
                <>
                    <FinanceStats income={income} expense={expense} />

                    <TransactionForm
                        onSubmit={handleTransactionSubmit}
                        categories={categories}
                    />

                    <BudgetList budgets={budgets} />

                    <SavingsGoalsList
                        goals={goals}
                        onAddGoal={createGoal}
                        onPromptInput={handleAddFunds}
                        onConfirmDelete={handleDeleteGoal}
                    />

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8 flex-1 min-h-[400px]">
                        <FinanceChart
                            data={chartData}
                            viewMode={viewMode}
                            darkMode={darkMode}
                            expenseKeys={expenseKeys}
                        />
                        <TransactionList
                            transactions={filteredTransactions}
                            onDelete={handleDeleteTransaction}
                        />
                    </div>

                    {/* Total Balance Footer */}
                    <div className="p-8 bg-life-text-base text-life-bg-base rounded shadow-xl flex items-center justify-between mt-auto">
                        <div>
                            <div className="text-life-text-muted mb-1 text-sm uppercase tracking-wider">
                                {t('finance', 'totalBalance')}
                            </div>
                            <div className="text-5xl font-bold tracking-tight">
                                {formatCurrency(balance)}
                            </div>
                        </div>
                        <div className="p-4 bg-life-bg-base/10 rounded">
                            <Wallet size={32} className="text-life-bg-base" />
                        </div>
                    </div>
                </>
            )}
        </PageContainer>
    );
}

export default FinancePage;
