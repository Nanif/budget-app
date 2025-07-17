import React, { useState } from 'react';
import { Wallet, Plus, Edit, Trash2, Loader } from 'lucide-react';
import { GetFundRequest, CreateFundRequest, UpdateFundRequest } from '../../services/fundsService';
import { GetCategoryRequest } from '../../services/categoriesService';
import { useNotifications } from '../Notifications/NotificationSystem';
import SettingsSection from './SettingsSection';
import FundModal from '../Funds/FundModal';

interface FundsManagementSectionProps {
  funds: GetFundRequest[];
  categories: GetCategoryRequest[];
  loading: boolean;
  onCreateFund: (fund: CreateFundRequest) => Promise<void>;
  onUpdateFund: (id: string, fund: UpdateFundRequest) => Promise<void>;
  onDeleteFund: (id: string) => Promise<void>;
  onGetEditingFund: (id: string) => UpdateFundRequest | null;
  onConfirmDialog: (config: {
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }) => void;
}

const FundsManagementSection: React.FC<FundsManagementSectionProps> = ({
  funds,
  categories,
  loading,
  onCreateFund,
  onUpdateFund,
  onDeleteFund,
  onGetEditingFund,
  onConfirmDialog
}) => {
  const [isFundModalOpen, setIsFundModalOpen] = useState(false);
  const [editingFund, setEditingFund] = useState<UpdateFundRequest | null>(null);
  const [editingFundId, setEditingFundId] = useState<string>('');
  const { addNotification } = useNotifications();

  const handleAddFund = () => {
    setEditingFund(null);
    setEditingFundId('');
    setIsFundModalOpen(true);
  };

  const handleEditFund = (id: string) => {
    const fund = onGetEditingFund(id);
    if (fund) {
      setEditingFund(fund);
      setEditingFundId(id);
      setIsFundModalOpen(true);
    }
  };

  const handleDeleteFund = (id: string) => {
    const fundToDelete = funds.find(fund => fund.id === id);
    if (!fundToDelete) return;

    onConfirmDialog({
      isOpen: true,
      title: 'מחיקת קופה',
      message: `האם אתה בטוח שברצונך למחוק את הקופה "${fundToDelete.name}"? פעולה זו אינה הפיכה.`,
      onConfirm: async () => {
        try {
          await onDeleteFund(id);
          addNotification({
            type: 'success',
            title: 'קופה נמחקה',
            message: `הקופה ${fundToDelete.name} נמחקה בהצלחה`
          });
        } catch (error) {
          console.error('Failed to delete fund:', error);
          addNotification({
            type: 'error',
            title: 'שגיאה במחיקת קופה',
            message: 'אירעה שגיאה בעת מחיקת הקופה. נסה שוב.'
          });
        }
      }
    });
  };

  const handleFundModalSubmit = async (fundData: CreateFundRequest) => {
    try {
      if (editingFund && editingFundId) {
        await onUpdateFund(editingFundId, fundData);
        addNotification({
          type: 'success',
          title: 'קופה עודכנה',
          message: `הקופה ${fundData.name} עודכנה בהצלחה`
        });
      } else {
        await onCreateFund(fundData);
        addNotification({
          type: 'success',
          title: 'קופה נוספה',
          message: `הקופה ${fundData.name} נוספה בהצלחה`
        });
      }
      setIsFundModalOpen(false);
      setEditingFund(null);
      setEditingFundId('');
    } catch (error) {
      console.error('Failed to save fund:', error);
      addNotification({
        type: 'error',
        title: 'שגיאה בשמירת קופה',
        message: 'אירעה שגיאה בעת שמירת הקופה. נסה שוב.'
      });
    }
  };

  return (
    <>
      <SettingsSection 
        icon={<Wallet size={24} className="text-blue-500" />}
        title="ניהול קופות"
        action={
          <button
            onClick={handleAddFund}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
          >
            <Plus size={16} />
            הוספת קופה
          </button>
        }
      >
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="mr-3 text-gray-600">טוען קופות...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {funds.map(fund => {
              const fundCategories = categories.filter(cat => 
                fund.categories?.includes(cat.id) || fund.categories?.includes(cat.name)
              );
              
              return (
                <div 
                  key={fund.id} 
                  className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:shadow-md transition-all duration-200"
                >
                  {/* שם קופה */}
                  <div className="mb-3 flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-gray-800 mb-1">{fund.name}</h3>
                      {fund.color_class && (
                        <div 
                          className="w-4 h-4 rounded-full border border-gray-300 inline-block"
                          style={{ backgroundColor: fund.color_class }}
                        />
                      )}
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleEditFund(fund.id)}
                        className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-md transition-colors"
                        title="עריכה"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteFund(fund.id)}
                        className="p-2 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-md transition-colors"
                        title="מחיקה"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {/* פרטי הקופה */}
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">סוג:</span>
                      <span className="font-medium">
                        {fund.type === 'monthly' ? 'חודשי' : fund.type === 'annual' ? 'שנתי' : 'חיסכון'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">סכום:</span>
                      <span className="font-medium text-blue-600">
                        {new Intl.NumberFormat('he-IL', {
                          style: 'currency',
                          currency: 'ILS',
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        }).format(fund.amount || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">בתקציב:</span>
                      <span className={`font-medium ${fund.include_in_budget ? 'text-green-600' : 'text-red-600'}`}>
                        {fund.include_in_budget ? 'כן' : 'לא'}
                      </span>
                    </div>
                  </div>

                  {/* קטגוריות */}
                  <div className="mt-3">
                    <p className="text-sm text-gray-600 mb-2">קטגוריות:</p>
                    <div className="flex flex-wrap gap-1">
                      {fundCategories.length > 0 ? (
                        fundCategories.map(category => (
                          <span
                            key={category.id}
                            className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full"
                            style={{
                              backgroundColor: category.color_class ? `${category.color_class}20` : '#f3f4f6',
                              color: category.color_class || '#6b7280'
                            }}
                          >
                            {category.name}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-gray-400 italic">אין קטגוריות</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </SettingsSection>

      {/* Fund Modal */}
      <FundModal
        isOpen={isFundModalOpen}
        onClose={() => {
          setIsFundModalOpen(false);
          setEditingFund(null);
          setEditingFundId('');
        }}
        onAddFund={handleFundModalSubmit}
        onEditFund={handleFundModalSubmit}
        editingFund={editingFund}
        fundId={editingFundId}
        categories={categories}
      />
    </>
  );
};

export default FundsManagementSection;