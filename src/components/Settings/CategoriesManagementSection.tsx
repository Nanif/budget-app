import React, { useState } from 'react';
import { Tag, Plus } from 'lucide-react';
import { GetCategoryRequest, CreateCategoryRequest } from '../../services/categoriesService';
import { GetFundRequest } from '../../services/fundsService';
import { categoriesService } from '../../services/categoriesService';
import { useNotifications } from '../Notifications/NotificationSystem';
import SettingsSection from './SettingsSection';

interface CategoriesManagementSectionProps {
  categories: GetCategoryRequest[];
  funds: GetFundRequest[];
  onCategoriesChange: () => void;
}

const CategoriesManagementSection: React.FC<CategoriesManagementSectionProps> = ({
  categories,
  funds,
  onCategoriesChange
}) => {
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryFundId, setNewCategoryFundId] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState('#3b82f6');
  const { addNotification } = useNotifications();

  const handleAddCategory = async () => {
    if (!newCategoryName.trim() || !newCategoryFundId) {
      addNotification({
        type: 'error',
        title: 'שגיאה',
        message: 'יש למלא את שם הקטגוריה ולבחור קופה'
      });
      return;
    }

    try {
      const categoryData: CreateCategoryRequest = {
        name: newCategoryName.trim(),
        fund_id: newCategoryFundId,
        color_class: newCategoryColor
      };

      await categoriesService.createCategory(categoryData);
      onCategoriesChange();
      
      addNotification({
        type: 'success',
        title: 'קטגוריה נוספה',
        message: `הקטגוריה ${newCategoryName} נוספה בהצלחה`
      });

      // Reset form
      setNewCategoryName('');
      setNewCategoryFundId('');
      setNewCategoryColor('#3b82f6');
      setIsAddingCategory(false);
    } catch (error) {
      console.error('Failed to create category:', error);
      addNotification({
        type: 'error',
        title: 'שגיאה ביצירת קטגוריה',
        message: 'אירעה שגיאה בעת יצירת הקטגוריה. נסה שוב.'
      });
    }
  };

  return (
    <SettingsSection 
      icon={<Tag size={24} className="text-orange-500" />}
      title="ניהול קטגוריות"
      action={
        <button 
          onClick={() => setIsAddingCategory(true)} 
          className="bg-orange-500 text-white px-3 py-1 rounded-md hover:bg-orange-600 transition-colors flex items-center gap-1 text-xs"
        >
          <Plus size={12} />הוספת קטגוריה
        </button>
      }
    >
      {isAddingCategory && (
        <div className="mb-3 p-2 bg-orange-50 rounded border border-orange-200 text-xs">
          <div className="flex gap-2 mb-2">
            <input 
              type="text" 
              value={newCategoryName} 
              onChange={(e) => setNewCategoryName(e.target.value)} 
              className="flex-1 px-2 py-1 border border-gray-300 rounded" 
              placeholder="שם הקטגוריה" 
            />
            <select 
              value={newCategoryFundId} 
              onChange={(e) => setNewCategoryFundId(e.target.value)}
              className="w-24 px-2 py-1 border border-gray-300 rounded"
            >
              <option value="">קופה</option>
              {funds.map(fund => (
                <option key={fund.id} value={fund.id}>{fund.name}</option>
              ))}
            </select>
            <input 
              type="color" 
              value={newCategoryColor} 
              onChange={(e) => setNewCategoryColor(e.target.value)} 
              className="w-8 h-6 rounded border border-gray-300" 
            />
          </div>
          <div className="flex gap-1 justify-end">
            <button 
              onClick={() => {
                setIsAddingCategory(false); 
                setNewCategoryName(''); 
                setNewCategoryFundId(''); 
                setNewCategoryColor('#3b82f6');
              }} 
              className="px-2 py-1 text-gray-600 hover:bg-gray-100 rounded"
            >
              ביטול
            </button>
            <button 
              onClick={handleAddCategory} 
              disabled={!newCategoryName.trim() || !newCategoryFundId}
              className="bg-orange-600 text-white px-2 py-1 rounded hover:bg-orange-700 disabled:bg-gray-300"
            >
              הוספה
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
        {categories.map(category => (
          <div key={category.id} className="p-2 rounded border border-gray-200 bg-white text-xs">
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: category.color_class || '#6b7280' }}
              />
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{category.name}</div>
                <div className="text-gray-500 truncate">{category.funds?.name || category.fund}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </SettingsSection>
  );
};

export default CategoriesManagementSection;