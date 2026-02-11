import React, { useEffect, useState } from 'react';
import { DndContext, DragOverlay, useSensor, useSensors, PointerSensor } from '@dnd-kit/core';
import { fetchTasks, updateTask, createTask, deleteTask } from './api';
import { Calendar } from './components/Calendar';
import { TaskCard } from './components/TaskCard';
import { TaskModal } from './components/TaskModal';
import { Home } from './components/Home';
import { ChatBubble } from './components/ChatBubble';
import { Sidebar } from './components/layout';
import { FinancePage, ProjectsPage, JournalPage, SettingsPage } from './pages';
import { LayoutDashboard } from 'lucide-react';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { PageContainer, PageHeader } from './components/layout';
import { EmptyState, Button } from './components/common';

function LifeOS() {
  const [view, setView] = useState('home');
  const [tasks, setTasks] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const { t } = useLanguage();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    loadTasks();
    const handleEditEvent = (e) => setEditingTask(e.detail);
    const handleRefreshTasks = () => loadTasks();

    window.addEventListener('edit-task', handleEditEvent);
    window.addEventListener('refresh-tasks', handleRefreshTasks);

    return () => {
      window.removeEventListener('edit-task', handleEditEvent);
      window.removeEventListener('refresh-tasks', handleRefreshTasks);
    };
  }, []);

  useEffect(() => {
    if (view === 'tasks') {
      loadTasks();
    }
  }, [view]);

  const loadTasks = async () => {
    try {
      const data = await fetchTasks();
      setTasks(data);
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
  };

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveId(null);

    if (over && over.id.startsWith('date-')) {
      const date = over.data.current.date;
      const taskId = active.id;
      const currentTask = active.data.current.task;
      const newStatus = currentTask.status === 'INBOX' ? 'TODO' : currentTask.status;

      setTasks(tasks.map(t =>
        t.id.toString() === taskId ? { ...t, due_date: date, status: newStatus } : t
      ));

      try {
        await updateTask(taskId, { due_date: date, status: newStatus });
        loadTasks(); // Refresh to be sure
      } catch (error) {
        console.error('Failed to update task date', error);
        loadTasks();
      }
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    const title = e.target.title.value;
    if (!title) return;

    try {
      const newTask = await createTask({ title, status: 'INBOX' });
      setTasks([...tasks, newTask]);
      e.target.reset();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateTask = async (id, updates) => {
    try {
      const updated = await updateTask(id, updates);
      setTasks(tasks.map(t => t.id === id ? updated : t));
    } catch (error) {
      console.error('Failed to update task', error);
    }
  };

  const handleDeleteTask = async (id) => {
    try {
      await deleteTask(id);
      setTasks(tasks.filter(t => t.id !== id));
    } catch (error) {
      console.error('Failed to delete task', error);
    }
  };

  const inboxTasks = tasks.filter(t => !t.due_date && t.status !== 'DONE');
  const activeTask = activeId ? tasks.find(t => t.id.toString() === activeId) : null;

  // Render Content based on view
  const renderContent = () => {
    switch (view) {
      case 'home':
        return <Home darkMode={darkMode} onNavigate={setView} />;
      case 'tasks':
        return (
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            <Calendar tasks={tasks} />
            <DragOverlay>
              {activeTask ? <TaskCard task={activeTask} /> : null}
            </DragOverlay>
          </div>
        );
      case 'finance':
        return <FinancePage darkMode={darkMode} />;
      case 'projects':
        return <ProjectsPage darkMode={darkMode} />;
      case 'journal':
        return <JournalPage darkMode={darkMode} />;
      case 'settings':
        return <SettingsPage darkMode={darkMode} />;
      default:
        return <Home darkMode={darkMode} onNavigate={setView} />;
    }
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex h-screen bg-life-bg-alt text-life-text-base font-sans transition-colors duration-300">

        <Sidebar
          view={view}
          onViewChange={setView}
          darkMode={darkMode}
          onToggleDarkMode={() => setDarkMode(!darkMode)}
        >
          {view === 'tasks' && (
            <div className="p-4 flex-1 overflow-y-auto border-t border-life-border mt-2">
              <h2 className="text-xs font-bold text-life-text-muted uppercase tracking-widest mb-4">{t('sidebar', 'inbox')}</h2>

              <form onSubmit={handleCreateTask} className="mb-4">
                <input
                  name="title"
                  type="text"
                  placeholder={t('sidebar', 'addTaskPlaceholder')}
                  className="w-full text-sm p-2 bg-life-bg-alt text-life-text-base rounded border border-transparent focus:bg-life-bg-base focus:border-life-accent focus:outline-none transition-colors placeholder-life-text-muted"
                />
              </form>

              <div className="space-y-2">
                {inboxTasks.map(task => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onClick={() => setEditingTask(task)}
                  />
                ))}
              </div>
            </div>
          )}
        </Sidebar>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col h-full overflow-hidden transition-all duration-300">
          {renderContent()}
        </div>

        {editingTask && (
          <TaskModal
            task={editingTask}
            onClose={() => setEditingTask(null)}
            onUpdate={handleUpdateTask}
            onDelete={handleDeleteTask}
          />
        )}

        <ChatBubble darkMode={darkMode} />
      </div>
    </DndContext>
  );
}

function App() {
  return (
    <LanguageProvider>
      <LifeOS />
    </LanguageProvider>
  );
}

export default App;
