// AssetsSection.tsx
import React, { useState } from 'react';
import { Plus, TrendingUp, TrendingDown, PieChart, History } from 'lucide-react';
import { AssetSnapshot } from '../../types';
import AssetsHistoryModal from './AssetsHistoryModal';
import { formatNumber, cleanNumber, getNumericValue } from '../../utils/formatUtils';

interface AssetValue {
  amount: number;
}

interface AssetsSectionProps {
  snapshots: AssetSnapshot[];
  onAddSnapshot: (
    assets: Record<string, AssetValue>,
    liabilities: Record<string, AssetValue>,
    note: string
  ) => void;
}

const AssetsSection: React.FC<AssetsSectionProps> = ({ snapshots, onAddSnapshot }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [note, setNote] = useState('');
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  const assetTypes = [
    { id: 'compensation', name: 'פיצויים' },
    { id: 'pension_naomi', name: 'קה״ש נעמי שכירה' },
    { id: 'pension_yossi', name: 'קה״ש יוסי' },
    { id: 'savings_children', name: 'חסכון לכל ילד' },
  ];

  const liabilityTypes = [
    { id: 'anchor', name: 'עוגן' },
    { id: 'gmach_glik', name: 'גמ״ח גליק' },
    { id: 'mortgage', name: 'משכנתא' },
  ];

  const [assets, setAssets] = useState<Record<string, { amount: string }>>(
    assetTypes.reduce((acc, type) => ({ ...acc, [type.id]: { amount: '' } }), {})
  );

  const [liabilities, setLiabilities] = useState<Record<string, { amount: string }>>(
    liabilityTypes.reduce((acc, type) => ({ ...acc, [type.id]: { amount: '' } }), {})
  );

  const latestSnapshot = snapshots[0];
  const previousSnapshot = snapshots[1];

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: 'ILS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);

  const handleAddSnapshot = () => {
    // בדיקה שיש לפחות נתון אחד
    const hasAssetData = Object.values(assets).some(asset => asset.amount.trim() !== '');
    const hasLiabilityData = Object.values(liabilities).some(liability => liability.amount.trim() !== '');
    
    if (!hasAssetData && !hasLiabilityData) {
      alert('יש להזין לפחות נתון אחד');
      return;
    }

    const parsedAssets = Object.keys(assets).reduce((acc, key) => {
      const amount = Number(assets[key].amount || 0);
      if (amount > 0) {
        acc[key] = { amount };
      }
      return acc;
    }, {} as Record<string, AssetValue>);

    const parsedLiabilities = Object.keys(liabilities).reduce((acc, key) => {
      const amount = Number(liabilities[key].amount || 0);
      if (amount > 0) {
        acc[key] = { amount };
      }
      return acc;
    }, {} as Record<string, AssetValue>);

    console.log('שומר תמונת מצב:', { parsedAssets, parsedLiabilities, note });
    
    onAddSnapshot(parsedAssets, parsedLiabilities, note);

    // איפוס הטופס רק אחרי שמירה מוצלחת
    setAssets(assetTypes.reduce((acc, type) => ({ ...acc, [type.id]: { amount: '' } }), {}));
    setLiabilities(liabilityTypes.reduce((acc, type) => ({ ...acc, [type.id]: { amount: '' } }), {}));
    setNote('');
    setIsAdding(false);
    
    alert('תמונת מצב נשמרה בהצלחה!');
  };

  const total = (records: Record<string, AssetValue>) =>
    Object.values(records || {}).reduce((sum, val) => sum + val.amount, 0);

  const totalAssets = total(latestSnapshot?.assets || {});
  const totalLiabilities = total(latestSnapshot?.liabilities || {});

  const netWorth = totalAssets - totalLiabilities;

  const previousNetWorth = previousSnapshot
    ? total(previousSnapshot.assets) - total(previousSnapshot.liabilities)
    : 0;
  const netWorthChange = latestSnapshot && previousSnapshot ? netWorth - previousNetWorth : 0;

  return (
    <>
      <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-700 flex items-center gap-2">
            <PieChart size={20} /> תמונת מצב נכסים
          </h3>
          <div className="flex gap-2">
            {snapshots.length > 0 && (
              <button
                onClick={() => setShowHistoryModal(true)}
                className="px-3 py-1 text-sm rounded-md bg-indigo-600 text-white flex items-center gap-1 hover:bg-indigo-700 transition-colors"
              >
                <History size={16} />
                היסטוריה ({snapshots.length})
              </button>
            )}
            <button
              onClick={() => setIsAdding(true)}
              className="px-3 py-1 text-sm rounded-md bg-slate-600 text-white flex items-center gap-1 hover:bg-slate-700 transition-colors"
            >
              <Plus size={16} /> עדכון מצב
            </button>
          </div>
        </div>

        {isAdding && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-emerald-700 font-bold mb-2">נכסים</h4>
              {assetTypes.map((type) => (
                <div key={type.id} className="mb-2">
                  <label className="block text-sm font-semibold text-gray-600">{type.name}</label>
                  <input
                    type="number"
                    placeholder="יתרה"
                    value={assets[type.id].amount}
                    onChange={(e) =>
                      setAssets((prev) => ({
                        ...prev,
                        [type.id]: {
                          amount: formatNumber(e.target.value),
                        },
                      }))
                    }
                    className="w-full p-2 border border-emerald-300 rounded mb-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
              ))}
            </div>
            <div>
              <h4 className="text-red-700 font-bold mb-2">התחייבויות</h4>
              {liabilityTypes.map((type) => (
                <div key={type.id} className="mb-2">
                  <label className="block text-sm font-semibold text-gray-600">{type.name}</label>
                  <input
                    type="number"
                    placeholder="יתרה"
                    value={liabilities[type.id].amount}
                    onChange={(e) =>
                      setLiabilities((prev) => ({
                        ...prev,
                        [type.id]: {
                          amount: e.target.value,
                        },
                      }))
                    }
                    className="w-full p-2 border border-red-300 rounded mb-1"
                  />
                </div>
              ))}
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-gray-600 mb-1">הערה</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            <div className="col-span-2 flex justify-end gap-2">
              <button onClick={() => setIsAdding(false)} className="text-sm text-gray-600 hover:text-gray-800 px-3 py-1 rounded hover:bg-gray-100 transition-colors">ביטול</button>
              <button onClick={handleAddSnapshot} className="bg-slate-600 text-white px-4 py-1 rounded text-sm hover:bg-slate-700 transition-colors">
                שמירה
              </button>
            </div>
          </div>
        )}

        {latestSnapshot && (
          <div className="mt-6">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-emerald-50 text-center p-4 rounded border border-emerald-200">
                <p className="text-sm font-medium text-emerald-800">נכסים</p>
                <p className="text-lg font-bold text-emerald-700">{formatCurrency(totalAssets)}</p>
              </div>
              <div className="bg-red-50 text-center p-4 rounded border border-red-200">
                <p className="text-sm font-medium text-red-800">התחייבויות</p>
                <p className="text-lg font-bold text-red-700">{formatCurrency(totalLiabilities)}</p>
              </div>
            </div>
            <div className="bg-blue-50 text-center p-4 rounded border border-blue-200">
              <p className="text-sm font-medium text-blue-700">שווי נטו</p>
              <p className="text-xl font-bold text-blue-800">{formatCurrency(netWorth)}</p>
              {previousSnapshot && (
                <div className="flex justify-center items-center gap-2 mt-2">
                  {netWorthChange >= 0 ? (
                    <TrendingUp size={16} className="text-emerald-500" />
                  ) : (
                    <TrendingDown size={16} className="text-red-500" />
                  )}
                  <span className={`text-sm font-bold ${netWorthChange >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {netWorthChange >= 0 ? '+' : ''}{formatCurrency(netWorthChange)}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal היסטוריה */}
      <AssetsHistoryModal
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        snapshots={snapshots}
        onDeleteSnapshot={(index) => {
          // כאן תוכל להוסיף לוגיקה למחיקת תמונת מצב
          console.log('מחיקת תמונת מצב:', index);
        }}
      />
    </>
  );
};

export default AssetsSection;