import React from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid
} from 'recharts';
import { Card } from '../common';
import { useLanguage } from '../../context/LanguageContext';
import { format, parseISO } from 'date-fns';
import { CHART_COLORS } from '../../utils/constants';

export function FinanceChart({
    data,
    viewMode,
    darkMode,
    expenseKeys = []
}) {
    const { t, getLocale } = useLanguage();
    // Use extracted palette from constants or passed props
    // We'll use the one from constants for consistency if needed, 
    // but here we follow the original logic which had specific sunset palettes.
    // For now, let's stick to the extracted constants if they match, or redefine locally if specific to this chart.
    // The implementation plan had CHART_COLORS in constants.js.

    // We'll use the constants.js CHART_COLORS.sunset for this visual style
    const PALETTE = darkMode ? CHART_COLORS.sunset.dark : CHART_COLORS.sunset.light;
    const INCOME_COLOR = darkMode ? '#F97316' : '#EF4444';

    return (
        <Card className="flex flex-col h-[400px]">
            <h3 className="text-sm font-bold uppercase tracking-widest text-life-text-muted mb-4">
                {t('finance', 'overview')}
            </h3>
            <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }}
                        />
                        <Tooltip
                            cursor={{ fill: 'transparent' }}
                            contentStyle={{
                                backgroundColor: 'var(--color-bg-base)',
                                borderColor: 'var(--color-border)',
                                borderRadius: '8px'
                            }}
                        />
                        {viewMode === 'TOTAL' ? (
                            <>
                                <Bar
                                    dataKey={t('finance', 'income')}
                                    fill={INCOME_COLOR}
                                    radius={[4, 4, 0, 0]}
                                />
                                <Bar
                                    dataKey={t('finance', 'expenses')}
                                    fill={PALETTE[0]}
                                    radius={[4, 4, 0, 0]}
                                />
                            </>
                        ) : (
                            <>
                                <Bar
                                    dataKey="amount"
                                    fill={INCOME_COLOR}
                                    radius={[4, 4, 0, 0]}
                                    name={t('finance', 'income')}
                                />
                                {expenseKeys.map((key, index) => (
                                    <Bar
                                        key={key}
                                        dataKey={key}
                                        stackId="expenses"
                                        fill={PALETTE[index % PALETTE.length]}
                                        radius={[
                                            index === expenseKeys.length - 1 ? 4 : 0,
                                            index === expenseKeys.length - 1 ? 4 : 0,
                                            0, 0
                                        ]}
                                    />
                                ))}
                            </>
                        )}
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </Card>
    );
}

export default FinanceChart;
