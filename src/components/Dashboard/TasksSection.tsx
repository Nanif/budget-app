import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Plus, Star, Trash2, CheckCircle2, Edit3 } from 'lucide-react';
import { Task } from '../../types';
import { tasksService } from '../../services/tasksService';

interface TasksSectionProps {
  tasks: Task[];
  onAddTask: (title: string, important: boolean) => void;
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
  onDeleteTask: (id: string) => void;
}

const TasksSection: React.FC<TasksSectionProps> = ({ 
  tasks: initialTasks, 
  onAddTask, 
  onUpdateTask, 
  onDeleteTask 
}) => {
  const [newTitle, setNewTitle] = useState('');
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [loading, setLoading] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  
  const editInputRef = useRef<HTMLInputElement>(null);

  // עדכון tasks כשמגיעים נתונים חדשים מהרכיב האב
  useEffect(() => {
    setTasks(initialTasks);
  }, [initialTasks]);

  // Focus on edit input when editing starts
  useEffect(() => {
    if (editingTaskId && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingTaskId]);

  const handleAddTaskLocal = useCallback(async () => {
    if (!newTitle.trim()) return;

    try {
      // קריאה לפונקציה מהרכיב האב - היא תטפל בכל הלוגיקה
      await onAddTask(newTitle.trim(), false);
      setNewTitle('');
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  }, [newTitle, onAddTask]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTaskLocal();
    }
  }, [handleAddTaskLocal]);

  const handleUpdateTaskLocal = useCallback(async (id: string, updates: Partial<Task>) => {
    try {
      // קריאה לפונקציה מהרכיב האב
      await onUpdateTask(id, updates);
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  }, [onUpdateTask]);

  const handleDeleteTaskLocal = useCallback(async (id: string) => {
    try {
      // קריאה לפונקציה מהרכיב האב
      await onDeleteTask(id);
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  }, [onDeleteTask]);

  const handleEditTask = useCallback((task: Task) => {
    setEditingTaskId(task.id);
    setEditingTitle(task.title);
  }, []);

  const handleSaveEdit = useCallback(async () => {
    if (editingTaskId && editingTitle.trim()) {
      try {
        await onUpdateTask(editingTaskId, { title: editingTitle.trim() });
        setEditingTaskId(null);
        setEditingTitle('');
      } catch (error) {
        console.error('Failed to update task title:', error);
      }
    }
  }, [editingTaskId, editingTitle, onUpdateTask]);

  const handleCancelEdit = useCallback(() => {
    setEditingTaskId(null);
    setEditingTitle('');
  }, []);

  const handleEditKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancelEdit();
    }
  }, [handleSaveEdit, handleCancelEdit]);

  const visibleTasks = tasks.filter(task => !task.completed);

  return (
    <div 
      className="relative bg-white rounded-xl  flex flex-col shadow-sm p-5 border-r-4 border-purple-400 hover:shadow-md transition-all duration-300"
      style={{ height: '700px', overflow: 'hidden' }}
    >
      <div className="flex items-center justify-center gap-2 mb-5">
        <CheckCircle2 size={18} className="text-violet-400" />
        <h3 className="text-lg font-semibold text-gray-700">תזכורות</h3>
        {loading && (
          <div className="w-4 h-4 border-2 border-violet-400 border-t-transparent rounded-full animate-spin"></div>
        )}
      </div>
      
      {/* רשימת המשימות */}
      <div className="flex-1 overflow-y-auto" >
        {visibleTasks.length > 0 ? (
          visibleTasks.map(task => (
            <div 
              key={task.id} 
              className={`group flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 ${
                task.important
                  ? 'bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200 shadow-sm'
                  : 'bg-gray-50 border-gray-100 hover:bg-gray-100 hover:border-gray-200'
              }`}
            >
              {/* תוכן המשימה */}
              {editingTaskId === task.id ? (
                <div className="flex-1 flex items-center gap-2">
                  <input
                    ref={editInputRef}
                    type="text"
                    value={editingTitle}
                    onChange={(e) => setEditingTitle(e.target.value)}
                    onKeyDown={handleEditKeyPress}
                    onBlur={handleSaveEdit}
                    className="flex-1 p-2 border border-blue-300 rounded-md text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                  />
                </div>
              ) : (
                <span 
                  className={`flex-1 transition-all break-words min-w-0 cursor-pointer hover:bg-blue-50 p-1 rounded ${
                    task.important
                      ? 'text-amber-800 font-semibold text-sm'
                      : 'text-gray-700 text-sm'
                  }`}
                  onDoubleClick={() => handleEditTask(task)}
                  title="לחץ פעמיים לעריכה"
                >
                  {task.title}
                </span>
              )}
              
              {/* אייקונים בצד ימין */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => handleUpdateTaskLocal(task.id, { important: !task.important })}
                  disabled={loading}
                  className={`transition-all duration-200 ${
                    task.important 
                      ? 'text-amber-500 scale-110' 
                      : 'text-gray-300 hover:text-amber-400 hover:scale-105'
                  } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  title={task.important ? 'הסר הדגשה' : 'הדגש משימה'}
                >
                  <Star 
                    size={task.important ? 16 : 14} 
                    fill={task.important ? 'currentColor' : 'none'} 
                  />
                </button>
                
                <button
                  onClick={() => {
                    if (window.confirm(`האם אתה בטוח שברצונך למחוק את המשימה "${task.title}"?`)) {
                      handleDeleteTaskLocal(task.id);
                    }
                  }}
                  disabled={loading}
                  className={`opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 p-1 rounded transition-all ${
                    loading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  title="מחק משימה"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-6 text-gray-400">
            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <CheckCircle2 size={14} className="text-gray-400" />
            </div>
            <p className="text-xs font-medium">אין משימות רשומות</p>
          </div>
        )}
      </div>

      {/* טופס הוספה */}
      <div className="space-y-3 p-3 bg-white border border-gray-100 rounded-lg mt-auto">
        <textarea
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          onKeyDown={handleKeyPress}
          disabled={loading}
          placeholder="תיאור המשימה..."
          rows={2}
          className={`w-full p-2 border border-gray-200 rounded-md text-sm bg-white focus:border-gray-300 focus:ring-1 focus:ring-gray-200 transition-all resize-none ${
            loading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        />
        
        <button
          onClick={handleAddTaskLocal}
          disabled={!newTitle.trim() || loading}
          className={`w-full py-2 rounded-md text-sm font-medium transition-all flex items-center justify-center gap-2 ${
            newTitle.trim() && !loading
              ? 'bg-gray-600 text-white hover:bg-gray-700 shadow-sm hover:shadow-md'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          <Plus size={14} />
          הוספה
        </button>
      </div>
    </div>
  );
};

export default TasksSection;