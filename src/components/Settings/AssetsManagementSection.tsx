import React, { useState } from 'react';
import { PieChart, Plus, Edit, Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import SettingsSection from './SettingsSection';
import { useNotifications } from '../Notifications/NotificationSystem';

interface AssetType {
  id: string;
  name: string;
  type: 'asset' | 'liability';
  isDefault: boolean;
}

interface AssetsManagementSectionProps {
  onAssetsChange?: () => void;
}

const AssetsManagementSection: React.FC<AssetsManagementSectionProps> = ({
  onAssetsChange
}) => {
  const { addNotification } = useNotifications();
  
  // State for asset types
  const [assetTypes, setAssetTypes] = useState<AssetType[]>([
    { id: '1', name: 'פיצויים', type: 'asset', isDefault: false },
    { id: '2', name: 'קה״ש נעמי שכירה', type: 'asset', isDefault: false },
    { id: '3', name: 'קה״ש יוסי', type: 'asset', isDefault: false },
    { id: '4', name: 'חסכון לכל ילד', type: 'asset', isDefault: false },
  ]);

  const [liabilityTypes, setLiabilityTypes] = useState<AssetType[]>([
    { id: '1', name: 'עוגן', type: 'liability', isDefault: false },
    { id: '2', name: 'גמ״ח גליק', type: 'liability', isDefault: false },
    { id: '3', name: 'משכנתא', type: 'liability', isDefault: false },
  ]);

  // State for adding new items
  const [isAddingAsset, setIsAddingAsset] = useState(false);
  const [isAddingLiability, setIsAddingLiability] = useState(false);
  const [newAssetName, setNewAssetName] = useState('');
  const [newLiabilityName, setNewLiabilityName] = useState('');

  // State for editing
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [editingType, setEditingType] = useState<'asset' | 'liability'>('asset');

  const handleAddAsset = () => {
    if (!newAssetName.trim()) {
      addNotification({
        type: 'error',
        title: 'שגיאה',
        message: 'יש להזין שם לנכס'
      });
      return;
    }

    const newAsset: AssetType = {
      id: Date.now().toString(),
      name: newAssetName.trim(),
      type: 'asset',
      isDefault: false
    };

    setAssetTypes(prev => [...prev, newAsset]);
    setNewAssetName('');
    setIsAddingAsset(false);
    
    addNotification({
      type: 'success',
      title: 'נכס נוסף',
      message: `הנכס "${newAsset.name}" נוסף בהצלחה`
    });

    if (onAssetsChange) onAssetsChange();
  };

  const handleAddLiability = () => {
    if (!newLiabilityName.trim()) {
      addNotification({
        type: 'error',
        title: 'שגיאה',
        message: 'יש להזין שם להתחייבות'
      });
      return;
    }

    const newLiability: AssetType = {
      id: Date.now().toString(),
      name: newLiabilityName.trim(),
      type: 'liability',
      isDefault: false
    };

    setLiabilityTypes(prev => [...prev, newLiability]);
    setNewLiabilityName('');
    setIsAddingLiability(false);
    
    addNotification({
      type: 'success',
      title: 'התחייבות נוספה',
      message: `ההתחייבות "${newLiability.name}" נוספה בהצלחה`
    });

    if (onAssetsChange) onAssetsChange();
  };

  const handleEditItem = (item: AssetType) => {
    setEditingId(item.id);
    setEditingName(item.name);
    setEditingType(item.type);
  };

  const handleSaveEdit = () => {
    if (!editingName.trim()) {
      addNotification({
        type: 'error',
        title: 'שגיאה',
        message: 'יש להזין שם'
      });
      return;
    }

    if (editingType === 'asset') {
      setAssetTypes(prev => prev.map(asset => 
        asset.id === editingId 
          ? { ...asset, name: editingName.trim() }
          : asset
      ));
    } else if (editingType === 'liability') {
      setLiabilityTypes(prev => prev.map(liability => 
        liability.id === editingId 
          ? { ...liability, name: editingName.trim() }
          : liability
      ));
    }

    addNotification({
      type: 'success',
      title: 'עודכן בהצלחה',
      message: `השם עודכן ל"${editingName.trim()}"`
    });

    setEditingId(null);
    setEditingName('');
    setEditingType('asset');
    if (onAssetsChange) onAssetsChange();
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingName('');
    setEditingType('asset');
  };

  const handleDeleteAsset = (item: AssetType) => {
    if (window.confirm(`האם אתה בטוח שברצונך למחוק את "${item.name}"?`)) {
      setAssetTypes(prev => prev.filter(asset => asset.id !== item.id));
      
      addNotification({
        type: 'success',
        title: 'נמחק בהצלחה',
        message: `"${item.name}" נמחק מרשימת הנכסים`
      });

      if (onAssetsChange) onAssetsChange();
    }
  };

  const handleDeleteLiability = (item: AssetType) => {
    if (window.confirm(`האם אתה בטוח שברצונך למחוק את "${item.name}"?`)) {
      setLiabilityTypes(prev => prev.filter(liability => liability.id !== item.id));

      addNotification({
        type: 'success',
        title: 'נמחק בהצלחה',
        message: `"${item.name}" נמחק מרשימת ההתחייבויות`
      });

      if (onAssetsChange) onAssetsChange();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      action();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      if (editingId) {
        handleCancelEdit();
      } else {
        setIsAddingAsset(false);
        setIsAddingLiability(false);
        setNewAssetName('');
        setNewLiabilityName('');
      }
    }
  };

  return (
    <SettingsSection 
      icon={<PieChart size={24} className="text-indigo-500" />}
      title="ניהול נכסים והתחייבויות"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ניהול נכסים */}
        <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp size={20} className="text-emerald-600" />
              <h3 className="text-lg font-semibold text-emerald-800">נכסים</h3>
              <span className="text-sm text-emerald-600">({assetTypes.length})</span>
            </div>
            <button
              onClick={() => setIsAddingAsset(true)}
              className="bg-emerald-600 text-white px-3 py-1 rounded-md hover:bg-emerald-700 transition-colors flex items-center gap-1 text-sm"
            >
              <Plus size={14} />
              הוספה
            </button>
          </div>

          {/* טופס הוספת נכס */}
          {isAddingAsset && (
            <div className="mb-4 p-3 bg-white rounded-lg border border-emerald-300">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newAssetName}
                  onChange={(e) => setNewAssetName(e.target.value)}
                  onKeyDown={(e) => handleKeyPress(e, handleAddAsset)}
                  placeholder="שם הנכס החדש..."
                  className="flex-1 px-3 py-2 border border-emerald-300 rounded-md text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-200"
                  autoFocus
                />
                <button
                  onClick={handleAddAsset}
                  className="bg-emerald-600 text-white px-3 py-2 rounded-md hover:bg-emerald-700 transition-colors text-sm"
                >
                  הוסף
                </button>
                <button
                  onClick={() => {
                    setIsAddingAsset(false);
                    setNewAssetName('');
                  }}
                  className="text-gray-600 hover:text-gray-800 px-2 py-2 rounded-md hover:bg-gray-100 transition-colors text-sm"
                >
                  ביטול
                </button>
              </div>
            </div>
          )}

          {/* רשימת נכסים */}
          <div className="space-y-2">
            {assetTypes.map(asset => (
              <div key={asset.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-emerald-200 hover:bg-emerald-50 transition-colors">
                {editingId === asset.id ? (
                  <div className="flex items-center gap-2 flex-1">
                    <input
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onKeyDown={(e) => handleKeyPress(e, handleSaveEdit)}
                      className="flex-1 px-2 py-1 border border-emerald-300 rounded text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-200"
                      autoFocus
                    />
                    <button
                      onClick={handleSaveEdit}
                      className="text-green-600 hover:text-green-800 p-1 rounded"
                      title="שמירה"
                    >
                      <Plus size={14} />
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="text-red-600 hover:text-red-800 p-1 rounded"
                      title="ביטול"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-emerald-800">{asset.name}</span>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleEditItem(asset)}
                        className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-100 transition-colors"
                        title="עריכה"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteAsset(asset)}
                        className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-100 transition-colors"
                        title="מחיקה"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ניהול התחייבויות */}
        <div className="bg-red-50 rounded-lg p-4 border border-red-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingDown size={20} className="text-red-600" />
              <h3 className="text-lg font-semibold text-red-800">התחייבויות</h3>
              <span className="text-sm text-red-600">({liabilityTypes.length})</span>
            </div>
            <button
              onClick={() => setIsAddingLiability(true)}
              className="bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700 transition-colors flex items-center gap-1 text-sm"
            >
              <Plus size={14} />
              הוספה
            </button>
          </div>

          {/* טופס הוספת התחייבות */}
          {isAddingLiability && (
            <div className="mb-4 p-3 bg-white rounded-lg border border-red-300">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newLiabilityName}
                  onChange={(e) => setNewLiabilityName(e.target.value)}
                  onKeyDown={(e) => handleKeyPress(e, handleAddLiability)}
                  placeholder="שם ההתחייבות החדשה..."
                  className="flex-1 px-3 py-2 border border-red-300 rounded-md text-sm focus:border-red-500 focus:ring-1 focus:ring-red-200"
                  autoFocus
                />
                <button
                  onClick={handleAddLiability}
                  className="bg-red-600 text-white px-3 py-2 rounded-md hover:bg-red-700 transition-colors text-sm"
                >
                  הוסף
                </button>
                <button
                  onClick={() => {
                    setIsAddingLiability(false);
                    setNewLiabilityName('');
                  }}
                  className="text-gray-600 hover:text-gray-800 px-2 py-2 rounded-md hover:bg-gray-100 transition-colors text-sm"
                >
                  ביטול
                </button>
              </div>
            </div>
          )}

          {/* רשימת התחייבויות */}
          <div className="space-y-2">
            {liabilityTypes.map(liability => (
              <div key={liability.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-red-200 hover:bg-red-50 transition-colors">
                {editingId === liability.id ? (
                  <div className="flex items-center gap-2 flex-1">
                    <input
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onKeyDown={(e) => handleKeyPress(e, handleSaveEdit)}
                      className="flex-1 px-2 py-1 border border-red-300 rounded text-sm focus:border-red-500 focus:ring-1 focus:ring-red-200"
                      autoFocus
                    />
                    <button
                      onClick={handleSaveEdit}
                      className="text-green-600 hover:text-green-800 p-1 rounded"
                      title="שמירה"
                    >
                      <Plus size={14} />
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="text-red-600 hover:text-red-800 p-1 rounded"
                      title="ביטול"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-red-800">{liability.name}</span>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleEditItem(liability)}
                        className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-100 transition-colors"
                        title="עריכה"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteLiability(liability)}
                        className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-100 transition-colors"
                        title="מחיקה"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* הסבר על השימוש */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h4 className="text-sm font-semibold text-blue-800 mb-2">איך זה עובד?</h4>
        <div className="text-sm text-blue-700 space-y-1">
          <p>• <strong>נכסים</strong> - כל מה שיש לך (חסכונות, קופות גמל, השקעות)</p>
          <p>• <strong>התחייבויות</strong> - כל מה שאתה חייב (הלוואות, משכנתא, חובות)</p>
          <p>• הפריטים שתגדיר כאן יופיעו בטופס עדכון תמונת מצב נכסים בדשבורד</p>
          <p>• ניתן לערוך שמות ולמחוק כל פריט ברשימה</p>
        </div>
      </div>
    </SettingsSection>
  );
};

export default AssetsManagementSection;