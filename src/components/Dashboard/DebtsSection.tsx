import React, { useState } from 'react';
import { Plus, CreditCard, Trash2, ArrowLeft, ArrowRight, Eye, X, Check } from 'lucide-react';
import { Debt } from '../../types';

interface DebtsSectionProps {
  debts: Debt[];
  onAddDebt: (amount: number, description: string, note: string, type: 'owed_to_me' | 'i_owe') => void;
  onDeleteDebt: (id: string) => void;
  onUpdateDebt: (id: string, updates: Partial<Debt>) => void;
}

interface DebtsModalProps {
  isOpen: boolean;
  onClose: () => void;
  debts: Debt[];
  onDeleteDebt: (id: string) => void;
}

const DebtsModal: React.FC<DebtsModalProps> = ({ isOpen, onClose, debts, onDeleteDebt }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: 'ILS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const debtsOwedToMe = debts.filter(debt => debt.type === 'owed_to_me');
  const debtsIOwe = debts.filter(debt => debt.type === 'i_owe' || !debt.type);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6 rounded-t-xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <CreditCard size={24} className="text-white" />
              <h2 className="text-xl font-bold text-white">כל החובות</h2>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-orange-200 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* חייבים לי */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <div className="w-3 h-3 bg-emerald-400 rounded-full"></div>
                חייבים לי ({debtsOwedToMe.length})
              </h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {debtsOwedToMe.length > 0 ? (
                  <ul className="space-y-2">
                    {debtsOwedToMe.map(debt => (
                      <li key={debt.id} className="group flex items-start gap-3 py-2">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-800">{debt.description}</p>
                              {debt.note && (
                                <p className="text-xs text-gray-600 mt-1">{debt.note}</p>
                              )}
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0 mr-3">
                              <span className="text-sm font-semibold text-emerald-700">
                                {formatCurrency(debt.amount)}
                              </span>
                              <button
                                onClick={() => onDeleteDebt(debt.id)}
                                className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 p-1 rounded transition-all"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-center text-gray-500 py-8">אין חובות שחייבים לי</p>
                )}
              </div>
            </div>

            {/* אני חייבת */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                אני חייב ({debtsIOwe.length})
              </h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {debtsIOwe.length > 0 ? (
                  <ul className="space-y-2">
                    {debtsIOwe.map(debt => (
                      <li key={debt.id} className="group flex items-start gap-3 py-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-800">{debt.description}</p>
                              {debt.note && (
                                <p className="text-xs text-gray-600 mt-1">{debt.note}</p>
                              )}
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0 mr-3">
                              <span className="text-sm font-semibold text-red-700">
                                {formatCurrency(debt.amount)}
                              </span>
                              <button
                                onClick={() => onDeleteDebt(debt.id)}
                                className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 p-1 rounded transition-all"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-center text-gray-500 py-8">אין חובות שאני חייב</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// רכיב עזר לעריכה מהירה
const InlineEditField: React.FC<{
  debt: Debt;
  field: 'description' | 'note' | 'amount';
  value: string | number;
  isEditing: boolean;
  editingValue: string;
  onStartEdit: () => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onEditChange: (value: string) => void;
  onEditKeyPress: (e: React.KeyboardEvent) => void;
  className?: string;
  placeholder?: string;
}> = ({
  debt,
  field,
  value,
  isEditing,
  editingValue,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onEditChange,
  onEditKeyPress,
  className = '',
  placeholder = ''
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: 'ILS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-1">
        <input
          type={field === 'amount' ? 'number' : 'text'}
          value={editingValue}
          onChange={(e) => onEditChange(e.target.value)}
          onKeyDown={onEditKeyPress}
          onBlur={onSaveEdit}
          className="flex-1 p-1 border border-blue-300 rounded text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
          placeholder={placeholder}
          autoFocus
        />
        <button
          onClick={onSaveEdit}
          className="text-green-600 hover:text-green-800 p-0.5"
          title="שמירה"
        >
          <Check size={10} />
        </button>
        <button
          onClick={onCancelEdit}
          className="text-red-600 hover:text-red-800 p-0.5"
          title="ביטול"
        >
          <X size={10} />
        </button>
      </div>
    );
  }

  return (
    <span
      onDoubleClick={onStartEdit}
      className={`cursor-pointer hover:bg-blue-50 px-1 py-0.5 rounded transition-colors ${className}`}
      title="לחץ פעמיים לעריכה"
    >
      {field === 'amount' ? formatCurrency(Number(value)) : value}
    </span>
  );
};

const DebtsSection: React.FC<DebtsSectionProps> = ({ debts, onAddDebt, onDeleteDebt, onUpdateDebt }) => {
  // State for forms
  const [owedToMeForm, setOwedToMeForm] = useState({ amount: '', description: '', note: '' });
  const [iOweForm, setIOweForm] = useState({ amount: '', description: '', note: '' });
  
  // State for inline editing
  const [editingDebtId, setEditingDebtId] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<'amount' | 'description' | 'note' | null>(null);
  const [editingValue, setEditingValue] = useState('');
  const [originalValue, setOriginalValue] = useState('');

  const [showAllModal, setShowAllModal] = useState(false);

  const debtsOwedToMe = debts.filter(debt => debt.type === 'owed_to_me');
  const debtsIOwe = debts.filter(debt => debt.type === 'i_owe' || !debt.type);

  const handleAddOwedToMe = () => {
    if (owedToMeForm.amount && owedToMeForm.description.trim()) {
      onAddDebt(Number(owedToMeForm.amount), owedToMeForm.description.trim(), owedToMeForm.note.trim(), 'owed_to_me');
      setOwedToMeForm({ amount: '', description: '', note: '' });
    }
  };

  const handleAddIOwe = () => {
    if (iOweForm.amount && iOweForm.description.trim()) {
      onAddDebt(Number(iOweForm.amount), iOweForm.description.trim(), iOweForm.note.trim(), 'i_owe');
      setIOweForm({ amount: '', description: '', note: '' });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent, type: 'owed_to_me' | 'i_owe') => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (type === 'owed_to_me') {
        handleAddOwedToMe();
      } else {
        handleAddIOwe();
      }
    }
  };

  const updateOwedToMeForm = (field: string, value: string) => {
    setOwedToMeForm(prev => ({ ...prev, [field]: value }));
  };

  const updateIOweForm = (field: string, value: string) => {
    setIOweForm(prev => ({ ...prev, [field]: value }));
  };

  // Inline editing handlers
  const handleStartEdit = (debt: Debt, field: 'amount' | 'description' | 'note') => {
    setEditingDebtId(debt.id);
    setEditingField(field);
    
    let currentValue = '';
    if (field === 'amount') {
      currentValue = debt.amount.toString();
    } else if (field === 'description') {
      currentValue = debt.description;
    } else if (field === 'note') {
      currentValue = debt.note || '';
    }
    
    setEditingValue(currentValue);
    setOriginalValue(currentValue);
  };

  const handleSaveEdit = async () => {
    if (editingDebtId && editingField && editingValue.trim()) {
      try {
        let updateData: Partial<Debt> = {};
        
        if (editingField === 'amount') {
          const newAmount = Number(editingValue);
          if (!isNaN(newAmount) && newAmount > 0) {
            updateData.amount = newAmount;
          } else {
            handleCancelEdit();
            return;
          }
        } else if (editingField === 'description') {
          updateData.description = editingValue.trim();
        } else if (editingField === 'note') {
          updateData.note = editingValue.trim();
        }

        await onUpdateDebt(editingDebtId, updateData);
        console.log(`✅ חוב עודכן: ${editingField} = ${editingValue}`);
      } catch (error) {
        console.error('❌ Failed to update debt:', error);
        setEditingValue(originalValue);
      }
    }
    
    handleCancelEdit();
  };

  const handleCancelEdit = () => {
    setEditingDebtId(null);
    setEditingField(null);
    setEditingValue('');
    setOriginalValue('');
  };

  const handleEditKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancelEdit();
    }
  };

  const totalDebts = debts.length;
  const showViewAllButton = totalDebts > 6;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: 'ILS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <>
      <div 
        className="bg-white rounded-xl shadow-sm p-4 border-r-4 border-orange-400 hover:shadow-md transition-all duration-300" 
        style={{ height: '700px', overflow: 'hidden' }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <CreditCard size={16} className="text-gray-500" />
            <h3 className="text-base font-semibold text-gray-700">חובות</h3>
          </div>
          
          {showViewAllButton && (
            <button
              onClick={() => setShowAllModal(true)}
              className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 transition-colors"
            >
              <Eye size={12} />
              הצג הכל ({totalDebts})
            </button>
          )}
        </div>

        {/* גריד עם שתי עמודות */}
        <div className="grid grid-cols-2 gap-4 h-full max-h-[600px] overflow-hidden">
          {/* עמודה שמאלית: חייבים לי */}
          <div className="flex flex-col h-full max-h-full overflow-hidden">
            <div className="bg-emerald-100 text-sm font-semibold text-emerald-700 mb-3 flex items-center gap-2 p-2 rounded-lg border border-emerald-200">
              <ArrowLeft size={14} className="text-emerald-500" />
              <span>חייבים לי ({debtsOwedToMe.length})</span>
            </div>
            
            {/* רשימת חובות */}
            <div className="flex-1 overflow-y-auto mb-3 max-h-[400px]">
              {debtsOwedToMe.length > 0 ? (
                <ul className="space-y-2">
                  {debtsOwedToMe.map(debt => (
                    <li key={debt.id} className="group">
                      <div className="p-2 rounded-lg border border-emerald-100 hover:bg-emerald-50 transition-all">
                        <div className="flex justify-between items-start">
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-medium text-emerald-800 break-words">
                              <InlineEditField
                                debt={debt}
                                field="description"
                                value={debt.description}
                                isEditing={editingDebtId === debt.id && editingField === 'description'}
                                editingValue={editingValue}
                                onStartEdit={() => handleStartEdit(debt, 'description')}
                                onSaveEdit={handleSaveEdit}
                                onCancelEdit={handleCancelEdit}
                                onEditChange={setEditingValue}
                                onEditKeyPress={handleEditKeyPress}
                                placeholder="תיאור החוב"
                              />
                            </div>
                            {debt.note && (
                              <div className="text-xs text-emerald-600 mt-1 break-words">
                                <InlineEditField
                                  debt={debt}
                                  field="note"
                                  value={debt.note}
                                  isEditing={editingDebtId === debt.id && editingField === 'note'}
                                  editingValue={editingValue}
                                  onStartEdit={() => handleStartEdit(debt, 'note')}
                                  onSaveEdit={handleSaveEdit}
                                  onCancelEdit={handleCancelEdit}
                                  onEditChange={setEditingValue}
                                  onEditKeyPress={handleEditKeyPress}
                                  placeholder="הערה"
                                />
                              </div>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <div className="text-xs font-bold text-emerald-700">
                              <InlineEditField
                                debt={debt}
                                field="amount"
                                value={debt.amount}
                                isEditing={editingDebtId === debt.id && editingField === 'amount'}
                                editingValue={editingValue}
                                onStartEdit={() => handleStartEdit(debt, 'amount')}
                                onSaveEdit={handleSaveEdit}
                                onCancelEdit={handleCancelEdit}
                                onEditChange={setEditingValue}
                                onEditKeyPress={handleEditKeyPress}
                                className="text-emerald-700"
                                placeholder="סכום"
                              />
                            </div>
                            
                            <button
                              onClick={() => onDeleteDebt(debt.id)}
                              className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 p-0.5 rounded transition-all"
                              title="מחיקת חוב"
                            >
                              <Trash2 size={10} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-4 text-gray-400">
                  <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <ArrowLeft size={12} className="text-gray-400" />
                  </div>
                  <p className="text-xs font-medium">אין חובות</p>
                </div>
              )}
            </div>

            {/* טופס הוספה */}
            <div className="space-y-2 p-2 bg-white border border-gray-100 rounded-lg">
              <input
                type="number"
                value={owedToMeForm.amount}
                onChange={(e) => updateOwedToMeForm('amount', e.target.value)}
                onKeyDown={(e) => handleKeyPress(e, 'owed_to_me')}
                placeholder="סכום"
                className="w-full p-2 border border-gray-200 rounded-md text-xs bg-white focus:border-gray-300 focus:ring-1 focus:ring-gray-200 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              
              <input
                type="text"
                value={owedToMeForm.description}
                onChange={(e) => updateOwedToMeForm('description', e.target.value)}
                onKeyDown={(e) => handleKeyPress(e, 'owed_to_me')}
                placeholder="תיאור"
                className="w-full p-2 border border-gray-200 rounded-md text-xs bg-white focus:border-gray-300 focus:ring-1 focus:ring-gray-200 transition-all"
              />
              
              <input
                type="text"
                value={owedToMeForm.note}
                onChange={(e) => updateOwedToMeForm('note', e.target.value)}
                onKeyDown={(e) => handleKeyPress(e, 'owed_to_me')}
                placeholder="הערה (אופציונלי)"
                className="w-full p-2 border border-gray-200 rounded-md text-xs bg-white focus:border-gray-300 focus:ring-1 focus:ring-gray-200 transition-all"
              />
              
              <button
                onClick={handleAddOwedToMe}
                disabled={!owedToMeForm.amount || !owedToMeForm.description.trim()}
                className={`w-full py-2 rounded-md text-xs font-medium transition-all flex items-center justify-center gap-2 ${
                  owedToMeForm.amount && owedToMeForm.description.trim()
                    ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm hover:shadow-md'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                <Plus size={12} />
                הוספה
              </button>
            </div>
          </div>

          {/* עמודה ימנית: אני חייב */}
          <div className="flex flex-col h-full max-h-full overflow-hidden">
            <div className="bg-red-100 text-sm font-semibold text-red-700 mb-3 flex items-center gap-2 p-2 rounded-lg border border-red-200">
              <ArrowRight size={14} className="text-red-500" />
              <span>אני חייב ({debtsIOwe.length})</span>
            </div>
            
            {/* רשימת חובות */}
            <div className="flex-1 overflow-y-auto mb-3 max-h-[400px]">
              {debtsIOwe.length > 0 ? (
                <ul className="space-y-2">
                  {debtsIOwe.map(debt => (
                    <li key={debt.id} className="group">
                      <div className="p-2 rounded-lg border border-red-100 hover:bg-red-50 transition-all">
                        <div className="flex justify-between items-start">
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-medium text-red-800 break-words">
                              <InlineEditField
                                debt={debt}
                                field="description"
                                value={debt.description}
                                isEditing={editingDebtId === debt.id && editingField === 'description'}
                                editingValue={editingValue}
                                onStartEdit={() => handleStartEdit(debt, 'description')}
                                onSaveEdit={handleSaveEdit}
                                onCancelEdit={handleCancelEdit}
                                onEditChange={setEditingValue}
                                onEditKeyPress={handleEditKeyPress}
                                placeholder="תיאור החוב"
                              />
                            </div>
                            {debt.note && (
                              <div className="text-xs text-red-600 mt-1 break-words">
                                <InlineEditField
                                  debt={debt}
                                  field="note"
                                  value={debt.note}
                                  isEditing={editingDebtId === debt.id && editingField === 'note'}
                                  editingValue={editingValue}
                                  onStartEdit={() => handleStartEdit(debt, 'note')}
                                  onSaveEdit={handleSaveEdit}
                                  onCancelEdit={handleCancelEdit}
                                  onEditChange={setEditingValue}
                                  onEditKeyPress={handleEditKeyPress}
                                  placeholder="הערה"
                                />
                              </div>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <div className="text-xs font-bold text-red-700">
                              <InlineEditField
                                debt={debt}
                                field="amount"
                                value={debt.amount}
                                isEditing={editingDebtId === debt.id && editingField === 'amount'}
                                editingValue={editingValue}
                                onStartEdit={() => handleStartEdit(debt, 'amount')}
                                onSaveEdit={handleSaveEdit}
                                onCancelEdit={handleCancelEdit}
                                onEditChange={setEditingValue}
                                onEditKeyPress={handleEditKeyPress}
                                className="text-red-700"
                                placeholder="סכום"
                              />
                            </div>
                            
                            <button
                              onClick={() => onDeleteDebt(debt.id)}
                              className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 p-0.5 rounded transition-all"
                              title="מחיקת חוב"
                            >
                              <Trash2 size={10} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-4 text-gray-400">
                  <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <ArrowRight size={12} className="text-gray-400" />
                  </div>
                  <p className="text-xs font-medium">אין חובות</p>
                </div>
              )}
            </div>

            {/* טופס הוספה */}
            <div className="space-y-2 p-2 bg-white border border-gray-100 rounded-lg">
              <input
                type="number"
                value={iOweForm.amount}
                onChange={(e) => updateIOweForm('amount', e.target.value)}
                onKeyDown={(e) => handleKeyPress(e, 'i_owe')}
                placeholder="סכום"
                className="w-full p-2 border border-gray-200 rounded-md text-xs bg-white focus:border-gray-300 focus:ring-1 focus:ring-gray-200 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              
              <input
                type="text"
                value={iOweForm.description}
                onChange={(e) => updateIOweForm('description', e.target.value)}
                onKeyDown={(e) => handleKeyPress(e, 'i_owe')}
                placeholder="תיאור"
                className="w-full p-2 border border-gray-200 rounded-md text-xs bg-white focus:border-gray-300 focus:ring-1 focus:ring-gray-200 transition-all"
              />
              
              <input
                type="text"
                value={iOweForm.note}
                onChange={(e) => updateIOweForm('note', e.target.value)}
                onKeyDown={(e) => handleKeyPress(e, 'i_owe')}
                placeholder="הערה (אופציונלי)"
                className="w-full p-2 border border-gray-200 rounded-md text-xs bg-white focus:border-gray-300 focus:ring-1 focus:ring-gray-200 transition-all"
              />
              
              <button
                onClick={handleAddIOwe}
                disabled={!iOweForm.amount || !iOweForm.description.trim()}
                className={`w-full py-2 rounded-md text-xs font-medium transition-all flex items-center justify-center gap-2 ${
                  iOweForm.amount && iOweForm.description.trim()
                    ? 'bg-red-600 text-white hover:bg-red-700 shadow-sm hover:shadow-md'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                <Plus size={12} />
                הוספה
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal לכל החובות */}
      <DebtsModal
        isOpen={showAllModal}
        onClose={() => setShowAllModal(false)}
        debts={debts}
        onDeleteDebt={onDeleteDebt}
      />
    </>
  );
};

export default DebtsSection;