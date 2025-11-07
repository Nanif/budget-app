import React, { useMemo, useState } from 'react';
import { X, TrendingUp, TrendingDown, Calendar } from 'lucide-react';

interface FundTransaction {
  id: string;
  amount: number;
  type: 'given' | 'returned';
  description: string;
  date: string;
}

interface FundTransactionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  fundName: string;
  transactions: FundTransaction[];
  onCreate?: (input: { amount: number; date: string; description?: string; type: 'deposit' | 'withdrawal'; month?: number }) => Promise<void> | void;
  selectedMonth?: number;
}

const FundTransactionsModal: React.FC<FundTransactionsModalProps> = ({
  isOpen,
  onClose,
  fundName,
  transactions,
  onCreate,
  selectedMonth
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

  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const [amount, setAmount] = useState<string>('');
  const [date, setDate] = useState<string>(todayStr);
  const [description, setDescription] = useState<string>('');
  const [type, setType] = useState<'deposit' | 'withdrawal'>('deposit');
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = onCreate && amount.trim() !== '' && !isNaN(Number(amount));

  const handleSubmit = async () => {
    if (!onCreate || !canSubmit) return;
    setSubmitting(true);
    try {
      await onCreate({
        amount: Number(amount),
        date,
        description: description?.trim() || undefined,
        type,
        month: selectedMonth,
      });
      setAmount('');
      setDescription('');
      setType('deposit');
    } catch (e) {
      console.error('Failed to create transaction', e);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* כותרת */}
        <div className="bg-gradient-to-r from-emerald-500 to-green-500 p-6 rounded-t-xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Calendar size={24} className="text-white" />
              <div>
                <h2 className="text-xl font-bold text-white">תנועות קופה</h2>
                <p className="text-emerald-100 text-sm">{fundName}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-emerald-200 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* תוכן */}
        {onCreate && (
          <div className="px-6 pt-6">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
              <p className="text-sm font-medium text-gray-700 mb-3">הוספת טרנזקציה</p>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="col-span-2 flex gap-2">
                  <button
                    className={`px-3 py-1 rounded text-sm border ${type === 'deposit' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-white text-gray-700 border-gray-200'}`}
                    onClick={() => setType('deposit')}
                    disabled={submitting}
                  >הפקדה</button>
                  <button
                    className={`px-3 py-1 rounded text-sm border ${type === 'withdrawal' ? 'bg-red-100 text-red-700 border-red-200' : 'bg-white text-gray-700 border-gray-200'}`}
                    onClick={() => setType('withdrawal')}
                    disabled={submitting}
                  >משיכה</button>
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">תאריך</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full border rounded px-2 py-1 text-sm"
                    disabled={submitting}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">סכום</label>
                  <input
                    type="number"
                    inputMode="decimal"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full border rounded px-2 py-1 text-sm"
                    placeholder="0"
                    disabled={submitting}
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs text-gray-600 mb-1">תיאור (לא חובה)</label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full border rounded px-2 py-1 text-sm"
                    placeholder={type === 'deposit' ? 'הפקדה למעטפה' : 'משיכה מהמעטפה'}
                    disabled={submitting}
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  onClick={handleSubmit}
                  disabled={!canSubmit || submitting}
                  className={`px-4 py-2 rounded text-sm font-medium text-white ${submitting ? 'bg-gray-400' : 'bg-emerald-600 hover:bg-emerald-700'}`}
                >{submitting ? 'שומר…' : 'שמור טרנזקציה'}</button>
              </div>
            </div>
          </div>
        )}

        {/* רשימת טרנזקציות */}
        <div className="px-6 pb-6">
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {transactions.length > 0 ? (
              transactions.map((transaction, index) => (
                <div 
                  key={transaction.id} 
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    transaction.type === 'given' 
                      ? 'bg-red-50 border-red-100' 
                      : 'bg-green-50 border-green-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {transaction.type === 'given' ? (
                      <TrendingDown size={16} className="text-red-500" />
                    ) : (
                      <TrendingUp size={16} className="text-green-500" />
                    )}
                    <div>
                      <p className={`text-sm font-medium ${
                        transaction.type === 'given' ? 'text-red-800' : 'text-green-800'
                      }`}>
                        {transaction.description}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDate(transaction.date)}
                      </p>
                    </div>
                  </div>
                  <div className="text-left">
                    <span className={`text-sm font-bold ${
                      transaction.type === 'given' ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {transaction.type === 'given' ? '-' : '+'}{formatCurrency(Math.abs(transaction.amount))}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Calendar size={48} className="text-gray-300 mx-auto mb-3" />
                <p className="text-lg font-medium">אין תנועות רשומות</p>
                <p className="text-sm">תנועות יופיעו כאן כשתתחיל להשתמש בקופה</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FundTransactionsModal;
