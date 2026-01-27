import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface TopActionsProps {
  onAddExpense: () => void;
  onAddIncome: () => void;
}

const TopActions: React.FC<TopActionsProps> = ({
  onAddExpense,
  onAddIncome
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex gap-2">
          <button
            onClick={onAddExpense}
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600 transition-colors shadow-md hover:shadow-lg"
          >
            <TrendingDown size={18} />
            הוצאה חדשה
          </button>
          
          <button
            onClick={onAddIncome}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-md hover:bg-emerald-600 transition-colors shadow-md hover:shadow-lg"
          >
            <TrendingUp size={18} />
            הוספת הכנסה
          </button>
        </div>
      </div>
    </div>
  );
};

export default TopActions
