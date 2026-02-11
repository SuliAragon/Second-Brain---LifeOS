import React from 'react';
import { Trash2 } from 'lucide-react';
import { Card } from '../common';
import { useLanguage } from '../../context/LanguageContext';
import { format, parseISO } from 'date-fns';
import { formatCurrency } from '../../utils/formatters';

export function TransactionList({ transactions = [], onDelete }) {
    const { t } = useLanguage();

    return (
        <Card className="flex flex-col h-[400px]">
            <h3 className="text-sm font-bold uppercase tracking-widest text-life-text-muted mb-4">
                Transactions
            </h3>
            <div className="space-y-2 overflow-y-auto pr-2 scrollbar-thin flex-1 min-h-0">
                {transactions.length === 0 ? (
                    <div className="text-center text-life-text-muted text-sm py-10">
                        No transactions found.
                    </div>
                ) : transactions.map(tx => (
                    <div
                        key={tx.id}
                        className="flex justify-between items-center p-3 bg-life-bg-alt border border-life-border rounded hover:border-life-text-muted transition-colors group"
                    >
                        <div className="min-w-0">
                            <div className="font-bold text-sm text-life-text-base truncate">
                                {tx.title}
                            </div>
                            <div className="text-xs text-life-text-muted truncate">
                                {format(parseISO(tx.date), 'MMM d, yyyy')}
                            </div>
                        </div>
                        <div className="flex items-center gap-4 shrink-0">
                            <div className={`font-bold whitespace-nowrap ${tx.type === 'INCOME' ? 'text-green-600' : 'text-life-accent'}`}>
                                {tx.type === 'INCOME' ? '+' : '-'}
                                {formatCurrency(parseFloat(tx.amount))}
                            </div>
                            <button
                                onClick={() => onDelete(tx.id)}
                                className="text-life-text-muted hover:text-life-accent opacity-0 group-hover:opacity-100 transition-all"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    );
}

export function TransactionTable({ transactions = [], onDelete, viewMode, currentDate }) {
    const { t, getLocale } = useLanguage();
    const locale = getLocale();

    // Logic for footer totals should be passed in or calculated here
    const income = transactions.filter(tx => tx.type === 'INCOME').reduce((acc, tx) => acc + parseFloat(tx.amount), 0);
    const expense = transactions.filter(tx => tx.type === 'EXPENSE').reduce((acc, tx) => acc + parseFloat(tx.amount), 0);

    return (
        <div className="flex-1 flex flex-col bg-life-bg-base rounded border border-life-border overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-12 gap-4 p-4 bg-life-bg-alt border-b border-life-border text-xs font-bold uppercase tracking-wider text-life-text-muted">
                <div className="col-span-1">#</div>
                <div className="col-span-2">Fecha</div>
                <div className="col-span-4">Concepto</div>
                <div className="col-span-2">Tipo</div>
                <div className="col-span-2 text-right">Importe</div>
                <div className="col-span-1"></div>
            </div>

            {/* Rows */}
            <div className="flex-1 overflow-y-auto">
                {transactions.length === 0 ? (
                    <div className="text-center text-life-text-muted py-20">No hay transacciones.</div>
                ) : (
                    transactions.map((tx, index) => (
                        <div
                            key={tx.id}
                            className={`grid grid-cols-12 gap-4 p-4 items-center border-b border-life-border hover:bg-life-bg-alt/50 transition-colors group ${index % 2 === 0 ? '' : 'bg-life-bg-alt/20'}`}
                        >
                            <div className="col-span-1 text-life-text-muted text-sm">{index + 1}</div>
                            <div className="col-span-2 text-life-text-base text-sm font-medium">
                                {format(parseISO(tx.date), 'dd/MM/yyyy')}
                            </div>
                            <div className="col-span-4 text-life-text-base font-medium truncate">
                                {tx.title}
                            </div>
                            <div className="col-span-2">
                                <span className={`px-2 py-1 rounded text-xs font-bold ${tx.type === 'INCOME' ? 'bg-green-500/20 text-green-600' : 'bg-red-500/20 text-red-500'}`}>
                                    {tx.type === 'INCOME' ? 'Ingreso' : 'Gasto'}
                                </span>
                            </div>
                            <div className={`col-span-2 text-right font-bold ${tx.type === 'INCOME' ? 'text-green-600' : 'text-red-500'}`}>
                                {tx.type === 'INCOME' ? '+' : '-'}
                                {formatCurrency(parseFloat(tx.amount))}
                            </div>
                            <div className="col-span-1 text-right">
                                <button
                                    onClick={() => onDelete(tx.id)}
                                    className="p-1.5 text-life-text-muted hover:text-red-500 hover:bg-red-500/10 rounded opacity-0 group-hover:opacity-100 transition-all"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Footer */}
            <div className="grid grid-cols-12 gap-4 p-4 bg-life-bg-alt border-t border-life-border font-bold">
                <div className="col-span-7 text-life-text-muted uppercase text-sm">
                    Total {viewMode === 'MONTHLY' ? format(currentDate, 'MMMM yyyy', { locale }) : ''}
                </div>
                <div className="col-span-2">
                    <span className="text-green-600">+{formatCurrency(income)}</span>
                </div>
                <div className="col-span-2 text-right">
                    <span className="text-red-500">-{formatCurrency(expense)}</span>
                </div>
                <div className="col-span-1"></div>
            </div>
        </div>
    );
}
