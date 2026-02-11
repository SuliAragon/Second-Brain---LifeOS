import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Card } from '../common';

export function TransactionForm({ onSubmit, categories = [] }) {
    const { t } = useLanguage();
    const [title, setTitle] = useState('');
    const [amount, setAmount] = useState('');
    const [type, setType] = useState('EXPENSE');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title || !amount) return;

        setLoading(true);
        try {
            await onSubmit({
                title,
                amount: parseFloat(amount),
                type,
                category: selectedCategory || null,
                date: new Date().toISOString().split('T')[0]
            });
            // Reset form on success
            setTitle('');
            setAmount('');
            setSelectedCategory('');
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="mb-8">
            <h3 className="text-sm font-bold uppercase tracking-widest text-life-text-muted mb-4 text-center">
                {t('finance', 'addBtn')}
            </h3>
            <form onSubmit={handleSubmit} className="flex gap-4 flex-wrap justify-center">
                <input
                    type="text"
                    placeholder={t('finance', 'addPlaceholder')}
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    disabled={loading}
                    className="flex-1 min-w-[200px] p-3 bg-life-bg-alt text-life-text-base rounded border border-transparent focus:bg-life-bg-base focus:border-life-accent focus:outline-none placeholder-life-text-muted transition-colors"
                />
                <input
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    disabled={loading}
                    className="w-28 p-3 bg-life-bg-alt text-life-text-base rounded border border-transparent focus:bg-life-bg-base focus:border-life-accent focus:outline-none placeholder-life-text-muted transition-colors"
                />
                <select
                    value={type}
                    onChange={e => setType(e.target.value)}
                    disabled={loading}
                    className="p-3 bg-life-bg-alt text-life-text-base rounded border border-transparent focus:bg-life-bg-base focus:border-life-accent focus:outline-none cursor-pointer"
                >
                    <option value="EXPENSE">{t('finance', 'exp')}</option>
                    <option value="INCOME">{t('finance', 'inc')}</option>
                </select>
                {categories.length > 0 && (
                    <select
                        value={selectedCategory}
                        onChange={e => setSelectedCategory(e.target.value)}
                        disabled={loading}
                        className="p-3 bg-life-bg-alt text-life-text-base rounded border border-transparent focus:bg-life-bg-base focus:border-life-accent focus:outline-none cursor-pointer"
                    >
                        <option value="">Sin Categoría</option>
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>
                )}
                <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-3 bg-life-text-base text-life-bg-base rounded hover:opacity-90 transition-opacity flex items-center justify-center font-bold disabled:opacity-50"
                >
                    {loading ? '...' : t('finance', 'addBtn')}
                </button>
            </form>
        </Card>
    );
}

export default TransactionForm;
