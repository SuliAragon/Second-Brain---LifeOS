import React from 'react';
import { ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { Card } from '../common';
import { useLanguage } from '../../context/LanguageContext';
import { formatCurrency } from '../../utils/formatters';

export function FinanceStats({ income, expense }) {
    const { t } = useLanguage();

    return (
        <div className="grid grid-cols-2 gap-6 mb-8">
            <Card className="flex flex-col items-center justify-center relative overflow-hidden h-32">
                <div className="absolute top-0 left-0 w-1 h-full bg-green-500"></div>
                <div className="flex items-center gap-2 mb-2 text-life-text-muted">
                    <ArrowUpRight size={18} className="text-green-500" />
                    {t('finance', 'income')}
                </div>
                <div className="text-3xl font-bold text-life-text-base">
                    {formatCurrency(income)}
                </div>
            </Card>

            <Card className="flex flex-col items-center justify-center relative overflow-hidden h-32">
                <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
                <div className="flex items-center gap-2 mb-2 text-life-text-muted">
                    <ArrowDownLeft size={18} className="text-life-accent" />
                    {t('finance', 'expenses')}
                </div>
                <div className="text-3xl font-bold text-life-text-base">
                    {formatCurrency(expense)}
                </div>
            </Card>
        </div>
    );
}

export default FinanceStats;
