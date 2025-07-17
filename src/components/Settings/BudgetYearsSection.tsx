import React, { useState } from 'react';
import { Calendar, Plus, Edit, Trash2 } from 'lucide-react';
import { BudgetYear } from '../../types';
import { formatBudgetYearName } from '../../utils/budgetUtils';
import { budgetYearsService } from '../../services/budgetYearsService';
import { useNotifications } from '../Notifications/NotificationSystem';
import SettingsSection from './SettingsSection';

interface BudgetYearsSectionProps {
  budgetYears: BudgetYear[];
  onBudgetYearsChange: (years: BudgetYear[]) => void;
  onConfirmDialog: (config: {
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }) => void;
}

const BudgetYearsSection: React.FC<BudgetYearsSectionProps> = ({
  budgetYears,
  onBudgetYearsChange,
  onConfirmDialog
}) => {
  const [isAddingYear, setIsAddingYear] = useState(false);
  const [newYearStart, setNewYearStart] = useState('');
  const [newYearEnd, setNewYearEnd] = useState('');
  const { addNotification } = useNotifications();

  const handleAddBudgetYear = async () => {
    if (newYearStart && newYearEnd) {
      try {
        const budgetYearData = {
          name: formatBudgetYearName(newYearStart, newYearEnd),
          start_date: newYearStart,
          end_date: newYearEnd
        };

        const newYear = await budgetYearsService.createBudgetYear(budgetYearData);
        onBudgetYearsChange([...budgetYears, newYear]);
        setNewYearStart('');
        setNewYearEnd('');
        setIsAddingYear(false);
        
        addNotification({
          type: 'success',
          title: 'שנת תקציב נוספה בהצלחה',
          message: `שנת התקציב ${newYear.name} נוספה בהצלחה`
        });
      } catch (error) {
        console.error('Failed to create budget year:', error);
        addNotification({
          type: 'error',
          title: 'שגיאה ביצירת שנת תקציב',
          message: 'אירעה שגיאה בעת יצירת שנת התקציב. נסה שוב.'
        });
      }
    }
  };

  const handleDeleteBudgetYear = (id: string) => {
    const yearToDelete = budgetYears.find(year => year.id === id);
    if (!yearToDelete) return;

    onConfirmDialog({
      isOpen: true,
      title: 'מחיקת שנת תקציב',
      message: `האם אתה בטוח שברצונך למחוק את שנת התקציב "${yearToDelete.name}"? פעולה זו אינה הפיכה.`,
      onConfirm: async () => {
        try {
          await budgetYearsService.deleteBudgetYear(id);
          onBudgetYearsChange(budgetYears.filter(year => year.id !== id));
          
          addNotification({
            type: 'success',
            title: 'שנת תקציב נמחקה',
            message: `שנת התקציב ${yearToDelete.name} נמחקה בהצלחה`
          });
        } catch (error) {
          console.error('Failed to delete budget year:', error);
          addNotification({
            type: 'error',
            title: 'שגיאה במחיקת שנת תקציב',
            message: 'אירעה שגיאה בעת מחיקת שנת התקציב. נסה שוב.'
          });
        }
      }
    });
  };

  const handleSetActive = async (id: string) => {
    try {
      await budgetYearsService.activateBudgetYear(id);
      onBudgetYearsChange(budgetYears.map(year => ({
        ...year,
        is_active: year.id === id
      })));
      
      const activatedYear = budgetYears.find(year => year.id === id);
      if (activatedYear) {
        addNotification({
          type: 'success',
          title: 'שנת תקציב הופעלה',
          message: `שנת התקציב ${activatedYear.name} הופעלה בהצלחה`
        });
      }
    } catch (error) {
      console.error('Failed to activate budget year:', error);
      addNotification({
        type: 'error',
        title: 'שגיאה בהפעלת שנת תקציב',
        message: 'אירעה שגיאה בעת הפעלת שנת התקציב. נסה שוב.'
      });
    }
  };

  return (
    <SettingsSection 
      icon={<Calendar size={24} className="text-blue-500" />}
      title="שנות תקציב"
      action={
        <button
          onClick={() => setIsAddingYear(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
        >
          <Plus size={16} />
          הוספת שנת תקציב
        </button>
      }
    >
      {isAddingYear && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="text-lg font-bold text-blue-800 mb-4">הוספת שנת תקציב חדשה</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                תחילת שנת תקציב
              </label>
              <input
                type="date"
                value={newYearStart}
                onChange={(e) => setNewYearStart(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                סוף שנת תקציב
              </label>
              <input
                type="date"
                value={newYearEnd}
                onChange={(e) => setNewYearEnd(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
              />
            </div>
          </div>

          {newYearStart && newYearEnd && (
            <div className="mb-4 p-3 bg-white rounded-lg border border-blue-200">
              <p className="text-sm text-blue-700">
                <strong>שם שנת התקציב:</strong> {formatBudgetYearName(newYearStart, newYearEnd)}
              </p>
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={handleAddBudgetYear}
              disabled={!newYearStart || !newYearEnd}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              הוספה
            </button>
            <button
              onClick={() => {
                setIsAddingYear(false);
                setNewYearStart('');
                setNewYearEnd('');
              }}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 rounded-lg hover:bg-gray-100 transition-colors"
            >
              ביטול
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {budgetYears.map(year => (
          <div key={year.id} className={`p-4 rounded-lg border-2 ${
            year.is_active 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-200 bg-white'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-800">{year.name}</h3>
                  {year.is_active && (
                    <span className="px-2 py-1 bg-blue-500 text-white text-xs rounded-full">
                      פעיל
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600">
                  {new Date(year.start_date).toLocaleDateString('he-IL')} - {new Date(year.end_date).toLocaleDateString('he-IL')}
                </p>
              </div>
              
              <div className="flex gap-2">
                {!year.is_active && (
                  <button
                    onClick={() => handleSetActive(year.id)}
                    className="px-3 py-1 text-sm bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                  >
                    הפעל
                  </button>
                )}
                <button
                  onClick={() => console.log('עריכה:', year.id)}
                  className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-md transition-colors"
                  title="עריכה"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => handleDeleteBudgetYear(year.id)}
                  className="p-2 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-md transition-colors"
                  title="מחיקה"
                  disabled={year.is_active}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </SettingsSection>
  );
};

export default BudgetYearsSection;