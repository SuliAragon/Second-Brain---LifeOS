import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Card } from '../common';

export function ProjectStats({ activeCount, archivedCount, totalTasks }) {
    const { t } = useLanguage();

    return (
        <div className="grid grid-cols-3 gap-4 mb-8">
            <Card className="flex flex-col items-center justify-center p-4">
                <div className="text-2xl font-bold text-life-text-base">
                    {activeCount}
                </div>
                <div className="text-sm text-life-text-muted">
                    {t('projects', 'active')}
                </div>
            </Card>
            <Card className="flex flex-col items-center justify-center p-4">
                <div className="text-2xl font-bold text-life-text-base">
                    {archivedCount}
                </div>
                <div className="text-sm text-life-text-muted">
                    {t('projects', 'archived')}
                </div>
            </Card>
            <Card className="flex flex-col items-center justify-center p-4">
                <div className="text-2xl font-bold text-life-text-base">
                    {totalTasks}
                </div>
                <div className="text-sm text-life-text-muted">
                    {t('projects', 'tasks')}
                </div>
            </Card>
        </div>
    );
}

export default ProjectStats;
