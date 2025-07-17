import React from 'react';
import { Wallet, Check, X } from 'lucide-react';
import { GetFundRequest } from '../../services/fundsService';
import { GetCategoryRequest } from '../../services/categoriesService';
import ColorBadge from '../UI/ColorBadge';

interface FundsGridViewProps {
  funds: GetFundRequest[];
  categories: GetCategoryRequest[];
}

const FundsGridView: React.FC<FundsGridViewProps> = ({ funds, categories }) => {
  const formatCurrency = (amount: number | undefined | null) => {
    if (!amount) return '₪0';
    return new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: 'ILS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'monthly': return 'חודשי';
      case 'annual': return 'שנתי';
      case 'savings': return 'חיסכון';
      default: return type;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'monthly': return '#10b981';
      case 'annual': return '#3b82f6';
      case 'savings': return '#8b5cf6';
      default: return '#6b7280';
    }
  };

  const getFundCategories = (fund: GetFundRequest) => {
    return categories.filter(cat => 
      fund.categories?.includes(cat.id) || fund.categories?.includes(cat.name)
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <Wallet size={20} />
          גריד קופות ({funds.length})
        </h2>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {funds.map(fund => {
            const fundCategories = getFundCategories(fund);
            
            return (
              <div 
                key={fund.id} 
                className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:shadow-md transition-all duration-200"
              >
                {/* שם קופה */}
                <div className="mb-3">
                  <h3 className="text-lg font-bold text-gray-800 mb-1">{fund.name}</h3>
                  {fund.color_class && (
                    <ColorBadge color={fund.color_class} size="sm">
                      צבע קופה
                    </ColorBadge>
                  )}
                </div>

                {/* סוג */}
                <div className="mb-3">
                  <p className="text-sm text-gray-600 mb-1">סוג:</p>
                  <ColorBadge color={getTypeColor(fund.type)}>
                    {getTypeLabel(fund.type)}
                  </ColorBadge>
                </div>

                {/* סכום */}
                <div className="mb-3">
                  <p className="text-sm text-gray-600 mb-1">סכום:</p>
                  <p className="text-lg font-semibold text-blue-600">
                    {formatCurrency(fund.amount)}
                  </p>
                </div>

                {/* האם בתקציב */}
                <div className="mb-3">
                  <p className="text-sm text-gray-600 mb-1">בתקציב:</p>
                  <div className="flex items-center gap-2">
                    {fund.include_in_budget ? (
                      <>
                        <Check size={16} className="text-green-600" />
                        <span className="text-sm font-medium text-green-600">כן</span>
                      </>
                    ) : (
                      <>
                        <X size={16} className="text-red-600" />
                        <span className="text-sm font-medium text-red-600">לא</span>
                      </>
                    )}
                  </div>
                </div>

                {/* קטגוריות */}
                <div>
                  <p className="text-sm text-gray-600 mb-2">קטגוריות:</p>
                  <div className="flex flex-wrap gap-1">
                    {fundCategories.length > 0 ? (
                      fundCategories.map(category => (
                        <ColorBadge key={category.id} color={category.color_class} size="sm">
                          {category.name}
                        </ColorBadge>
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

        {funds.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <Wallet size={48} className="mx-auto mb-3 text-gray-300" />
            <p className="text-lg font-medium">אין קופות להצגה</p>
            <p className="text-sm">הוסף קופות כדי לראות אותן כאן</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FundsGridView;