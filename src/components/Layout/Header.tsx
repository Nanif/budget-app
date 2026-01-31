import React from 'react';
import { Calendar } from 'lucide-react';
import { useBudgetYearStore } from '../../store/budgetYearStore';

const Header: React.FC = () => {
  const budgetYears = useBudgetYearStore(state => state.budgetYears);
  const selectedBudgetYearId = useBudgetYearStore(state => state.selectedBudgetYearId);
  const setSelectedBudgetYearId = useBudgetYearStore(state => state.setSelectedBudgetYearId);

  const hasBudgetYears = budgetYears.length > 0;

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-screen-xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Calendar size={18} className="text-gray-500" />
          <span className="text-sm text-gray-600">שנת תקציב</span>
          <select
            value={selectedBudgetYearId || ''}
            onChange={(e) => {
              const nextId = e.target.value;
              if (nextId) setSelectedBudgetYearId(nextId);
            }}
            className="p-2 border border-gray-300 rounded-md text-sm bg-white"
            disabled={!hasBudgetYears}
          >
            {!hasBudgetYears && <option value="">אין שנות תקציב</option>}
            {budgetYears.map(year => (
              <option key={year.id} value={year.id}>
                {year.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </header>
  );
};

export default Header;
