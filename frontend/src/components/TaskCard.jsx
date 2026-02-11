import React from 'react';
import { useDraggable } from '@dnd-kit/core';

export function TaskCard({ task, onClick, variant = 'default' }) {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id: task.id.toString(),
        data: { task },
    });

    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: 50,
    } : undefined;

    const isCompact = variant === 'compact';
    const isDone = task.status === 'DONE';
    const isTodo = task.status === 'TODO';

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            onClick={onClick}
            className={`
                border shadow-sm rounded cursor-move transition-all group relative
                ${isCompact ? 'p-1 mb-1 hover:shadow-md' : 'p-3 mb-2'}
                ${isDone ? 'bg-life-bg-base border-life-border opacity-60' : ''}
                ${isTodo ? 'bg-life-accent border-life-accent shadow-md text-white' : ''}
                ${!isDone && !isTodo ? 'bg-life-bg-base border-life-border hover:border-life-accent' : ''}
            `}
        >
            <div className="flex justify-between items-center gap-2">
                <div className={`font-medium truncate text-life-text-base ${isCompact ? 'text-xs' : 'text-sm'} ${isDone ? 'line-through text-life-text-muted' : ''} ${isTodo ? 'text-white' : ''}`}>
                    {task.title}
                </div>
                {task.due_time && (
                    <div className={`font-bold rounded flex-shrink-0 
                        ${isCompact ? 'text-[9px] px-1' : 'text-[10px] px-1.5'}
                        ${isDone ? 'bg-life-bg-alt text-life-text-muted' : ''}
                        ${isTodo ? 'bg-white text-gray-500' : ''}
                        ${!isDone && !isTodo ? 'bg-life-accent/10 text-life-accent' : ''}
                    `}>
                        {task.due_time.substring(0, 5)}
                    </div>
                )}
            </div>
            {!isCompact && task.description && (
                <div className={`text-xs mt-1 truncate ${isTodo ? 'text-white/80' : 'text-life-text-muted'}`}>{task.description}</div>
            )}
        </div>
    );
}
