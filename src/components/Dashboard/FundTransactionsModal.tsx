import React from 'react';
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
}

const FundTransactionsModal: React.FC<FundTransactionsModalProps> = ({
  isOpen,
  onClose,
  fundName,
  transactions
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
        <div className="p-6">
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