import React from 'react';
import { X, Calendar, TrendingUp, TrendingDown, PieChart } from 'lucide-react';
import { AssetSnapshot } from '../../types';

interface AssetsHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  snapshots: AssetSnapshot[];
  onDeleteSnapshot?: (index: number) => void;
}

const AssetsHistoryModal: React.FC<AssetsHistoryModalProps> = ({
  isOpen,
  onClose,
  snapshots,
  onDeleteSnapshot
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: 'ILS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('he-IL');
  };

  const calculateTotals = (snapshot: AssetSnapshot) => {
    const totalAssets = Object.values(snapshot.assets || {}).reduce((sum, val) => sum + val.amount, 0);
    const totalLiabilities = Object.values(snapshot.liabilities || {}).reduce((sum, val) => sum + val.amount, 0);
    const netWorth = totalAssets - totalLiabilities;
    return { totalAssets, totalLiabilities, netWorth };
  };

  const calculateChange = (current: AssetSnapshot, previous: AssetSnapshot | undefined) => {
    if (!previous) return null;
    
    const currentTotals = calculateTotals(current);
    const previousTotals = calculateTotals(previous);
    
    return {
      assetsChange: currentTotals.totalAssets - previousTotals.totalAssets,
      liabilitiesChange: currentTotals.totalLiabilities - previousTotals.totalLiabilities,
      netWorthChange: currentTotals.netWorth - previousTotals.netWorth
    };
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* כותרת */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-6 rounded-t-xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <PieChart size={24} className="text-white" />
              <div>
                <h2 className="text-xl font-bold text-white">היסטוריית תמונות מצב נכסים</h2>
                <p className="text-indigo-100 text-sm">{snapshots.length} תמונות מצב</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-indigo-200 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* תוכן */}
        <div className="p-6">
          {snapshots.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-right p-3 text-sm font-semibold text-gray-700">תאריך</th>
                    <th className="text-right p-3 text-sm font-semibold text-gray-700">נכסים</th>
                    <th className="text-right p-3 text-sm font-semibold text-gray-700">התחייבויות</th>
                    <th className="text-right p-3 text-sm font-semibold text-gray-700">שווי נטו</th>
                    <th className="text-right p-3 text-sm font-semibold text-gray-700">שינוי</th>
                    <th className="text-right p-3 text-sm font-semibold text-gray-700">הערה</th>
                    <th className="text-right p-3 text-sm font-semibold text-gray-700">פעולות</th>
                  </tr>
                </thead>
                <tbody>
                  {snapshots.map((snapshot, index) => {
                    const totals = calculateTotals(snapshot);
                    const change = calculateChange(snapshot, snapshots[index + 1]);
                    
                    return (
                      <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="p-3 text-sm text-gray-900">
                          <div className="flex items-center gap-2">
                            <Calendar size={14} className="text-gray-500" />
                            {formatDate(snapshot.date)}
                          </div>
                        </td>
                        
                        <td className="p-3 text-sm">
                          <div className="text-emerald-600 font-semibold">
                            {formatCurrency(totals.totalAssets)}
                          </div>
                          {change && (
                            <div className={`text-xs ${change.assetsChange >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                              {change.assetsChange >= 0 ? '+' : ''}{formatCurrency(change.assetsChange)}
                            </div>
                          )}
                        </td>
                        
                        <td className="p-3 text-sm">
                          <div className="text-red-600 font-semibold">
                            {formatCurrency(totals.totalLiabilities)}
                          </div>
                          {change && (
                            <div className={`text-xs ${change.liabilitiesChange >= 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                              {change.liabilitiesChange >= 0 ? '+' : ''}{formatCurrency(change.liabilitiesChange)}
                            </div>
                          )}
                        </td>
                        
                        <td className="p-3 text-sm">
                          <div className={`font-bold ${totals.netWorth >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                            {formatCurrency(totals.netWorth)}
                          </div>
                          {change && (
                            <div className={`text-xs flex items-center gap-1 ${change.netWorthChange >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                              {change.netWorthChange >= 0 ? (
                                <TrendingUp size={12} />
                              ) : (
                                <TrendingDown size={12} />
                              )}
                              {change.netWorthChange >= 0 ? '+' : ''}{formatCurrency(change.netWorthChange)}
                            </div>
                          )}
                        </td>
                        
                        <td className="p-3 text-sm">
                          {change ? (
                            <div className="space-y-1">
                              <div className={`text-xs ${change.netWorthChange >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                {change.netWorthChange >= 0 ? '📈 עלייה' : '📉 ירידה'}
                              </div>
                              <div className="text-xs text-gray-500">
                                {Math.abs(((change.netWorthChange / calculateTotals(snapshots[index + 1]).netWorth) * 100)).toFixed(1)}%
                              </div>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400">תמונת מצב ראשונה</span>
                          )}
                        </td>
                        
                        <td className="p-3 text-sm text-gray-700 max-w-xs">
                          <div className="truncate" title={snapshot.note}>
                            {snapshot.note || 'אין הערה'}
                          </div>
                        </td>
                        
                        <td className="p-3 text-sm">
                          {onDeleteSnapshot && (
                            <button
                              onClick={() => {
                                if (window.confirm('האם אתה בטוח שברצונך למחוק תמונת מצב זו?')) {
                                  onDeleteSnapshot(index);
                                }
                              }}
                              className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-100 transition-colors"
                              title="מחיקת תמונת מצב"
                            >
                              <X size={14} />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <PieChart size={48} className="text-gray-300 mx-auto mb-3" />
              <p className="text-lg font-medium">אין תמונות מצב רשומות</p>
              <p className="text-sm">תמונות מצב יופיעו כאן לאחר שתוסיף את הראשונה</p>
            </div>
          )}
        </div>

        {/* סיכום בתחתית */}
        {snapshots.length > 0 && (
          <div className="bg-gray-50 p-4 rounded-b-xl border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="bg-white rounded-lg p-3 border border-emerald-200">
                <p className="text-sm text-emerald-700 font-medium">תמונות מצב כולל</p>
                <p className="text-lg font-bold text-emerald-600">{snapshots.length}</p>
              </div>
              
              <div className="bg-white rounded-lg p-3 border border-blue-200">
                <p className="text-sm text-blue-700 font-medium">שווי נטו נוכחי</p>
                <p className="text-lg font-bold text-blue-600">
                  {formatCurrency(calculateTotals(snapshots[0]).netWorth)}
                </p>
              </div>
              
              <div className="bg-white rounded-lg p-3 border border-purple-200">
                <p className="text-sm text-purple-700 font-medium">תמונת מצב אחרונה</p>
                <p className="text-lg font-bold text-purple-600">
                  {formatDate(snapshots[0].date)}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssetsHistoryModal;