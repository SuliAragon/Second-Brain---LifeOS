import React, { useState } from 'react';
import { PiggyBank, Plus, Trash2, TrendingUp } from 'lucide-react';
import { Card, Modal } from '../common';
import { useLanguage } from '../../context/LanguageContext';
import { formatCurrency } from '../../utils/formatters';
import { format, parseISO } from 'date-fns';

export function SavingsGoalsList({
    goals = [],
    onAddGoal,
    onAddFunds,
    onDelete,
    onPromptInput,
    onConfirmDelete
}) {
    const { t } = useLanguage();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newGoalName, setNewGoalName] = useState('');
    const [newGoalAmount, setNewGoalAmount] = useState('');
    const [loading, setLoading] = useState(false);

    const handleCreate = async () => {
        if (!newGoalName || !newGoalAmount) return;
        setLoading(true);
        try {
            await onAddGoal({
                name: newGoalName,
                target_amount: parseFloat(newGoalAmount),
                current_amount: 0
            });
            setNewGoalName('');
            setNewGoalAmount('');
            setIsModalOpen(false);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="mb-8">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-bold uppercase tracking-widest text-life-text-muted flex items-center gap-2">
                    <PiggyBank size={16} /> Metas de Ahorro
                </h3>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="px-3 py-1.5 bg-life-bg-alt text-life-text-base rounded border border-life-border hover:bg-life-accent hover:text-life-bg-base transition-colors flex items-center gap-2 text-sm font-medium"
                >
                    <Plus size={14} /> Nueva Meta
                </button>
            </div>

            {goals.length === 0 ? (
                <div className="text-center text-life-text-muted py-8">
                    No tienes metas de ahorro. ¡Crea una para empezar!
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {goals.map(goal => (
                        <div
                            key={goal.id}
                            className={`p-4 rounded border ${goal.is_completed ? 'bg-green-500/10 border-green-500/30' : 'bg-life-bg-alt border-life-border'}`}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <span className="font-medium text-life-text-base flex items-center gap-2">
                                        {goal.is_completed && <span className="text-green-500">✓</span>}
                                        {goal.name}
                                    </span>
                                    {goal.deadline && (
                                        <span className="text-xs text-life-text-muted">
                                            Fecha límite: {format(parseISO(goal.deadline), 'dd/MM/yyyy')}
                                        </span>
                                    )}
                                </div>
                                <span className={`text-sm font-bold ${goal.is_completed ? 'text-green-500' : 'text-life-accent'}`}>
                                    {goal.percentage}%
                                </span>
                            </div>
                            <div className="w-full bg-life-border rounded h-3 mb-2 overflow-hidden">
                                <div
                                    className={`h-full rounded transition-all ${goal.is_completed ? 'bg-green-500' : 'bg-life-accent'}`}
                                    style={{ width: `${Math.min(goal.percentage, 100)}%` }}
                                />
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-life-text-muted">
                                    {formatCurrency(parseFloat(goal.current_amount))} / {formatCurrency(parseFloat(goal.target_amount))}
                                </span>
                                <div className="flex items-center gap-2">
                                    {!goal.is_completed && (
                                        <button
                                            onClick={() => onPromptInput(goal)}
                                            className="px-2 py-1 text-xs bg-life-accent text-life-bg-base rounded hover:opacity-90 transition-opacity flex items-center gap-1"
                                        >
                                            <TrendingUp size={12} /> Añadir
                                        </button>
                                    )}
                                    <button
                                        onClick={() => onConfirmDelete(goal)}
                                        className="p-1 text-life-text-muted hover:text-red-500 hover:bg-red-500/10 rounded transition-all"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Nueva Meta de Ahorro"
            >
                <div className="space-y-4">
                    <input
                        type="text"
                        placeholder="Nombre de la meta (ej: Vacaciones)"
                        value={newGoalName}
                        onChange={e => setNewGoalName(e.target.value)}
                        className="w-full p-3 bg-life-bg-alt text-life-text-base rounded border border-life-border focus:border-life-accent focus:outline-none placeholder-life-text-muted"
                    />
                    <input
                        type="number"
                        placeholder="Cantidad objetivo (ej: 1000)"
                        value={newGoalAmount}
                        onChange={e => setNewGoalAmount(e.target.value)}
                        className="w-full p-3 bg-life-bg-alt text-life-text-base rounded border border-life-border focus:border-life-accent focus:outline-none placeholder-life-text-muted"
                    />
                    <div className="flex gap-3 justify-end pt-4">
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="px-4 py-2 text-life-text-muted hover:text-life-text-base transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleCreate}
                            disabled={loading}
                            className="px-4 py-2 bg-life-accent text-life-bg-base rounded hover:opacity-90 transition-opacity font-medium disabled:opacity-50"
                        >
                            {loading ? 'Creando...' : 'Crear Meta'}
                        </button>
                    </div>
                </div>
            </Modal>
        </Card>
    );
}

export default SavingsGoalsList;
