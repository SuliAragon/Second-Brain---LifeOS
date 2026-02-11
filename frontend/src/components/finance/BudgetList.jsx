import React from 'react';
import { Target } from 'lucide-react';
import { Card } from '../common';
import { useLanguage } from '../../context/LanguageContext';
import { formatCurrency } from '../../utils/formatters';

export function BudgetList({ budgets = [] }) {
    const { t } = useLanguage();

    if (!budgets.length) return null;

    return (
        <Card className="mb-8">
            <h3 className="text-sm font-bold uppercase tracking-widest text-life-text-muted mb-4 flex items-center gap-2">
                <Target size={16} /> Presupuestos del Mes
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {budgets.map(budget => {
                    const spent = budget.spent || 0;
                    const amount = parseFloat(budget.amount);
                    const percentage = Math.min((spent / amount) * 100, 100);

                    let colorClass = 'bg-green-500';
                    let textClass = 'text-green-500';

                    if (percentage >= 90) {
                        colorClass = 'bg-red-500';
                        textClass = 'text-red-500';
                    } else if (percentage >= 70) {
                        colorClass = 'bg-yellow-500';
                        textClass = 'text-yellow-500';
                    }

                    return (
                        <div key={budget.id} className="p-4 bg-life-bg-alt rounded border border-life-border">
                            <div className="flex justify-between items-center mb-2">
                                <span className="font-medium text-life-text-base">
                                    {budget.category_name}
                                </span>
                                <span className={`text-sm font-bold ${textClass}`}>
                                    {Math.round(percentage)}%
                                </span>
                            </div>
                            <div className="w-full bg-life-border rounded h-3 mb-2 overflow-hidden">
                                <div
                                    className={`h-full rounded transition-all ${colorClass}`}
                                    style={{ width: `${percentage}%` }}
                                />
                            </div>
                            <div className="flex justify-between text-xs text-life-text-muted">
                                <span>{formatCurrency(spent)} gastado</span>
                                <span>de {formatCurrency(amount)}</span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </Card>
    );
}

export default BudgetList;
