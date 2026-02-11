import React, { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay, parseISO, addMonths, subMonths } from 'date-fns';
import { useDroppable } from '@dnd-kit/core';
import { TaskCard } from './TaskCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

function CalendarDay({ day, tasks }) {
    const dateStr = format(day, 'yyyy-MM-dd');
    const { setNodeRef, isOver } = useDroppable({
        id: `date-${dateStr}`,
        data: { date: dateStr },
    });

    return (
        <div
            ref={setNodeRef}
            className={`h-full border border-life-border p-2 transition-colors flex flex-col gap-1 ${isOver ? 'bg-life-bg-alt' : 'bg-life-bg-base'
                }`}
        >
            <div className={`text-xs font-bold mb-1 flex-shrink-0 ${isToday(day) ? 'text-life-accent' : 'text-life-text-muted'
                }`}>
                {format(day, 'd')}
            </div>
            <div className="flex-1 flex flex-col gap-1 overflow-y-auto min-h-0 scrollbar-hide">
                {tasks.map(task => (
                    <TaskCard
                        key={task.id}
                        task={task}
                        variant="compact"
                        onClick={() => window.dispatchEvent(new CustomEvent('edit-task', { detail: task }))}
                    />
                ))}
            </div>
        </div>
    );
}

export function Calendar({ tasks }) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const { getLocale } = useLanguage();
    const locale = getLocale();

    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    const days = eachDayOfInterval({ start, end });

    // Add empty days for filler at the start
    const startDay = start.getDay();
    const empties = Array(startDay).fill(null);

    const getTasksForDay = (day) => {
        return tasks
            .filter(t => t.due_date && isSameDay(parseISO(t.due_date), day))
            .sort((a, b) => {
                if (!a.due_time) return 1;
                if (!b.due_time) return -1;
                return a.due_time.localeCompare(b.due_time);
            });
    };

    const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
    const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

    return (
        <div className="flex-1 p-6 flex flex-col h-screen overflow-hidden bg-life-bg-alt transition-colors duration-300">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold tracking-tight text-life-text-base capitalize">{format(currentDate, 'MMMM yyyy', { locale })}</h2>
                <div className="flex gap-2">
                    <button onClick={prevMonth} className="p-2 hover:bg-life-bg-base rounded transition-colors text-life-text-base">
                        <ChevronLeft size={24} />
                    </button>
                    <button onClick={nextMonth} className="p-2 hover:bg-life-bg-base rounded transition-colors text-life-text-base">
                        <ChevronRight size={24} />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-7 border-b border-life-border">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d, i) => {
                    // Quick hack to get localized day name: create a dummy date for that day index
                    // Sunday = 0.
                    const dayName = locale.localize.day(i, { width: 'abbreviated' });
                    return (
                        <div key={d} className="p-2 text-center text-xs text-life-text-muted font-medium uppercase tracking-wider">
                            {dayName}
                        </div>
                    );
                })}
            </div>

            <div className="grid grid-cols-7 flex-1 overflow-y-auto auto-rows-fr bg-life-border gap-px border-l border-b border-life-border">
                {empties.map((_, i) => (
                    <div key={`empty-${i}`} className="bg-life-bg-alt/30" />
                ))}
                {days.map(day => (
                    <CalendarDay key={day.toString()} day={day} tasks={getTasksForDay(day)} />
                ))}
            </div>
        </div>
    );
}
