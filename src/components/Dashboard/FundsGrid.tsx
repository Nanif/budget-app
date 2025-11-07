import React, { useEffect, useState } from 'react';
import { GetFundRequest } from '../../services/fundsService';
import { Wallet, TrendingUp, Gift, Coins, DollarSign, Target, Calendar, PlusCircle, Check, X } from 'lucide-react';
import ColorBadge from '../UI/ColorBadge';
import FundTransactionsModal from './FundTransactionsModal';
import { cashEnvelopeTransactionsService, CashEnvelopeTransaction } from '../../services/cashEnvelopeTransactionsService';
import { useBudgetYearStore } from '../../store/budgetYearStore';

interface FundsGridProps {
  funds: GetFundRequest[];
  currentDisplayMonth: number;
  onCloseDailyFund: (remainingAmount: number) => void;
  onAddMoneyToEnvelope: (amount: number) => void;
  onMonthChange: (month: number) => void;
}

interface FundTransaction {
  id: string;
  amount: number;
  type: 'given' | 'returned';
  description: string;
  date: string;
}

const FundsGrid: React.FC<FundsGridProps> = ({ funds, currentDisplayMonth, onCloseDailyFund, onAddMoneyToEnvelope, onMonthChange }) => {
  const [showEnvelopeInput, setShowEnvelopeInput] = useState(false);
  const [envelopeAmount, setEnvelopeAmount] = useState('');
  const [showClosureInput, setShowClosureInput] = useState(false);
  const [remainingAmount, setRemainingAmount] = useState('');
  const [showTransactionsModal, setShowTransactionsModal] = useState(false);
  const [selectedFund, setSelectedFund] = useState<GetFundRequest | null>(null);
  const [transactions, setTransactions] = useState<FundTransaction[]>([]);
  const selectedBudgetYearId = useBudgetYearStore(state => state.selectedBudgetYearId);
  const [cashTotalsByFund, setCashTotalsByFund] = useState<Record<string, number>>({});
  const [enableCreateForm, setEnableCreateForm] = useState(false);

  const [amountInputs, setAmountInputs] = useState<Record<string, string>>({});
  const [descInputs, setDescInputs] = useState<Record<string, string>>({});
  const refreshCashTotals = async () => {
    try {
      const list = await cashEnvelopeTransactionsService.list({
        month: currentDisplayMonth || getCurrentMonth(),
        budgetYearId: selectedBudgetYearId || undefined,
      });
      const totals: Record<string, number> = {};
      for (const t of list) {
        const amt = Number(t.amount || 0);
        totals[t.fund_id] = (totals[t.fund_id] || 0) + amt;
      }
      setCashTotalsByFund(totals);
    } catch (e) {
      console.error('Failed to load cash totals:', e);
      setCashTotalsByFund({});
    }
  };

  useEffect(() => {
    // Only relevant for cash-managed (level 1) funds
    refreshCashTotals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBudgetYearId, currentDisplayMonth]);

  // When month changes and modal is open, reload transactions for the selected fund
  useEffect(() => {
    if (showTransactionsModal && selectedFund) {
      loadTransactionsForFund(selectedFund);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDisplayMonth]);

  const level1Funds = funds.filter(fund => fund.level === 1);
  const level2Funds = funds.filter(fund => fund.level === 2);
  const level3Funds = funds.filter(fund => fund.level === 3);
  
  const formatCurrency = (amount: number | undefined | null): string => {
    if (amount === undefined || amount === null) return '0.00';
    return amount.toLocaleString('he-IL');
  };

  const getMonthName = (monthNumber: number) => {
    const months = [
      'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
      'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'
    ];
    return months[monthNumber - 1];
  };

  const getCurrentMonth = () => {
    const currentDate = new Date();
    return currentDate.getMonth() + 1;
  };

  
  const handleEnvelopeSubmit = () => {
    if (envelopeAmount && Number(envelopeAmount) > 0) {
      const amount = Number(envelopeAmount);
      // onAddMoneyToEnvelope(amount);
      setEnvelopeAmount('');
      setShowEnvelopeInput(false);
    }
  };

  const handleEnvelopeCancel = () => {
    setEnvelopeAmount('');
    setShowEnvelopeInput(false);
  };

  const handleClosureSubmit = () => {
    if (remainingAmount && Number(remainingAmount) >= 0) {
  //    onCloseDailyFund(Number(remainingAmount));
      setRemainingAmount('');
      setShowClosureInput(false);
    }
  };

  const handleClosureCancel = () => {
    setRemainingAmount('');
    setShowClosureInput(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent, action: 'envelope' | 'closure') => {
    if (e.key === 'Enter') {
      if (action === 'envelope') {
        handleEnvelopeSubmit();
      } else {
        handleClosureSubmit();
      }
    } else if (e.key === 'Escape') {
      if (action === 'envelope') {
        handleEnvelopeCancel();
      } else {
        handleClosureCancel();
      }
    }
  };


  const loadTransactionsForFund = async (fund: GetFundRequest) => {
    let tx: FundTransaction[] = [];
    try {
      if (fund.level === 1) {
        const serverTx: CashEnvelopeTransaction[] = await cashEnvelopeTransactionsService.list({
          month: currentDisplayMonth || getCurrentMonth(),
          budgetYearId: selectedBudgetYearId || undefined,
        });
        tx = (serverTx || [])
          .filter(t => t.fund_id === fund.id)
          .map(t => ({
          id: t.id,
          amount: t.amount,
          type: t.amount >= 0 ? 'returned' : 'given',
          description: t.description || (t.amount >= 0 ? 'הפקדה' : 'משיכה'),
          date: t.date,
        }));
      } else {
        tx = getMockTransactions(fund.id);
      }
    } catch (e) {
      console.error('Failed to load cash envelope transactions:', e);
      tx = getMockTransactions(fund.id);
    }
    setTransactions(tx);
  };

  const handleShowTransactions = async (fund: GetFundRequest) => {
    setSelectedFund(fund);
    setEnableCreateForm(false);
    await loadTransactionsForFund(fund);
    setShowTransactionsModal(true);
  };

  const handleAddTransactionClick = async (fund: GetFundRequest) => {
    setSelectedFund(fund);
    setEnableCreateForm(true);
    await loadTransactionsForFund(fund);
    setShowTransactionsModal(true);
  };

  const handleCreateTransaction = async (input: { amount: number; date: string; description?: string; type: 'deposit' | 'withdrawal'; month?: number }) => {
    if (!selectedFund) return;
    try {
      const signedAmount = input.type === 'withdrawal' ? -Math.abs(input.amount) : Math.abs(input.amount);
      await cashEnvelopeTransactionsService.create({
        fund_id: selectedFund.id,
        date: input.date,
        amount: signedAmount,
        description: input.description,
        budget_year_id: selectedBudgetYearId || undefined,
        month: input.month ?? (currentDisplayMonth || getCurrentMonth()),
      });
      await loadTransactionsForFund(selectedFund);
      await refreshCashTotals();
    } catch (e) {
      console.error('Failed to create cash transaction:', e);
    }
  };

  // Mock data for transactions - בעתיד יבוא מה-API
  
  const handleInlineSubmit = async (fund: GetFundRequest) => {
    const amountStr = amountInputs[fund.id] || '';
    const descStr = (descInputs[fund.id] || '').trim();
    if (amountStr === '') return;
    const num = Number(amountStr);
    if (isNaN(num) || num === 0) return;
    const type = num > 0 ? 'deposit' as const : 'withdrawal' as const;
    const year = new Date().getFullYear();
    const monthStr = String(currentDisplayMonth || getCurrentMonth()).padStart(2, '0');
    const date = `${year}-${monthStr}-01`;
    await handleCreateTransaction({
      amount: Math.abs(num),
      description: descStr || undefined,
      type,
      date,
      month: currentDisplayMonth || getCurrentMonth(),
    });
    setAmountInputs(prev => ({ ...prev, [fund.id]: '' }));
    setDescInputs(prev => ({ ...prev, [fund.id]: '' }));
  };

  const handleInlineKey = (e: React.KeyboardEvent<HTMLInputElement>, fund: GetFundRequest) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleInlineSubmit(fund);
    }
  };

  const getMockTransactions = (fundId: string): FundTransaction[] => {
    return [
      { id: '1', amount: 200, type: 'given', description: 'נתינה למעטפה', date: '2024-01-15' },
      { id: '2', amount: 250, type: 'given', description: 'תוספת תקציב', date: '2024-01-10' },
      { id: '3', amount: -50, type: 'returned', description: 'החזרה מהמעטפה', date: '2024-01-08' },
      { id: '4', amount: -49, type: 'returned', description: 'תיקון סכום', date: '2024-01-05' },
      { id: '5', amount: 300, type: 'given', description: 'העברה מעודפים', date: '2024-01-03' },
      { id: '6', amount: 150, type: 'given', description: 'תקציב חודשי', date: '2024-01-01' },
      { id: '7', amount: -25, type: 'returned', description: 'החזרה חלקית', date: '2023-12-28' },
      { id: '8', amount: 400, type: 'given', description: 'בונוס חגים', date: '2023-12-25' },
      { id: '9', amount: 100, type: 'given', description: 'תוספת רגילה', date: '2023-12-20' },
      { id: '10', amount: -75, type: 'returned', description: 'תיקון יתרה', date: '2023-12-15' }
    ];
  };

  return (
    <>
      <div className="space-y-6">
      {/* שורה ראשונה - קופת השוטף */}
      {level1Funds.map(fund => (
        <div key={fund.id} className="relative bg-gradient-to-br from-emerald-50 via-green-50 to-emerald-100 rounded-xl shadow-lg p-6 border-2 border-emerald-300 hover:shadow-xl transition-all duration-300 overflow-hidden">
          {/* חצי עיגול עדין בפינה הימנית העליונה */}
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-emerald-200/40 to-transparent rounded-bl-full"></div>
          <div className="absolute top-0 right-0 w-14 h-14 bg-gradient-to-bl from-emerald-300/30 to-transparent rounded-bl-full"></div>
          <div className="absolute top-0 right-0 w-8 h-8 bg-gradient-to-bl from-emerald-400/20 to-transparent rounded-bl-full"></div>
          
          <div className="flex justify-between items-start mb-6 relative z-10">
            <div className="flex items-center gap-3">
              {/* {getFundIcon(fund.name)} */}
              <div>
                <h3 className="text-lg font-bold text-emerald-800">{fund.name}</h3>
                <div className="text-sm text-emerald-600 font-medium flex items-center gap-2">
                  <span>חודש</span>
                  <select
                    value={currentDisplayMonth}
                    onChange={(e) => onMonthChange(Number(e.target.value))}
                    className="border border-emerald-300 rounded px-1 py-0.5 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-emerald-400"
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                      <option key={m} value={m}>{String(m).padStart(2, '0')}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            </div>

          <div className="mt-4 flex items-center gap-2 relative z-10">
            <input
              type="number"
              inputMode="decimal"
              value={amountInputs[fund.id] || ''}
              onChange={(e) => setAmountInputs(prev => ({ ...prev, [fund.id]: e.target.value }))}
              onKeyDown={(e) => handleInlineKey(e, fund)}
              className="w-28 p-2 border border-emerald-300 rounded-md text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-300"
              placeholder="Amount (+/-)"
            />
            <input
              type="text"
              value={descInputs[fund.id] || ''}
              onChange={(e) => setDescInputs(prev => ({ ...prev, [fund.id]: e.target.value }))}
              onKeyDown={(e) => handleInlineKey(e, fund)}
              className="flex-1 p-2 border border-emerald-300 rounded-md text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-300"
              placeholder="Description (optional)"
            />
            <button
              onClick={() => handleInlineSubmit(fund)}
              className="bg-emerald-600 text-white p-2 rounded-md hover:bg-emerald-700 transition-colors"
              title="הוסף טרנזקציה"
            >
              <PlusCircle size={18} />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-6 relative z-10">
            <div className="text-center p-4 bg-white/80 rounded-lg border-2 border-emerald-200 shadow-sm">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Target size={16} className="text-emerald-600" />
                <p className="text-sm text-emerald-700 font-bold">תקציב</p>
              </div>
              <p className="text-lg font-bold text-gray-800 text-center">{formatCurrency(fund.amount)}</p>
            </div>
            <div 
              className="text-center p-4 bg-white/80 rounded-lg border-2 border-green-200 shadow-sm cursor-pointer hover:bg-green-50 hover:border-green-300 transition-all duration-200"
              onClick={() => handleShowTransactions(fund)}
              title="לחץ לצפייה בתנועות"
            >
              <div className="flex items-center justify-center gap-2 mb-2">
                <TrendingUp size={16} className="text-green-600" />
                <p className="text-sm text-green-700 font-bold">ניתן בפועל</p>
              </div>
              <p className="text-lg font-bold text-green-600 text-center">{formatCurrency(fund.level === 1 ? (cashTotalsByFund[fund.id] || 0) : 0)}</p>
            </div>
            <div className="text-center p-4 bg-white/80 rounded-lg border-2 border-amber-200 shadow-sm">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Coins size={16} className="text-amber-600" />
                <p className="text-sm text-amber-700 font-bold">נותר לתת</p>
              </div>
              <p className="text-lg font-bold text-amber-600 text-center">{formatCurrency(fund.amount - (fund.level === 1 ? (cashTotalsByFund[fund.id] || 0) :  0))}</p>
            </div>
          </div>
        </div>
      ))}

      {/* שורה שנייה - קופות שנתיות */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {level2Funds.map(fund => (
          <div key={fund.id} className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-200 hover:shadow-xl hover:border-indigo-300 transition-all duration-300">
            <div className="flex items-center gap-3 mb-6 pb-3 border-b border-gray-100">
              {/* {getFundIcon(fund.name)} */}
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-800">{fund.name}</h3>
                {fund.color_class && (
                  <ColorBadge color={fund.color_class} size="sm" className="mt-1">
                    {fund.type === 'monthly' ? 'חודשי' : fund.type === 'annual' ? 'שנתי' : 'חיסכון'}
                  </ColorBadge>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              {/* תקציב */}
              <div className="p-1 bg-gray-50 rounded-lg border border-gray-200 w-[70px] h-full">
                <div className="flex items-center justify-center gap-1 mb-2">
                  <Target size={14} className="text-indigo-600" />
                  <p className="text-xs text-gray-600 font-medium">תקציב</p>
                </div>
                <p className="font-bold text-gray-800 text-center">{formatCurrency(fund.amount)}</p>
              </div>
              
              {/* מומש */}
              <div className="p-1 bg-gray-50 rounded-lg border border-gray-200 w-[70px] h-full">
                <div className="flex items-center justify-center gap-1 mb-2">
                  <TrendingUp size={14} className="text-orange-600 rotate-180" />
                  <p className="text-xs text-gray-600 font-medium">מומש</p>
                </div>
                <p className="font-bold text-orange-600 text-center">{formatCurrency(fund.spent || 0)}</p>
              </div>
              
              {/* נותר */}
              <div className="p-1 bg-gray-50 rounded-lg border border-gray-200 w-[70px] h-full">
                <div className="flex items-center justify-center gap-1 mb-2">
                  <Coins size={14} className="text-green-600" />
                  <p className="text-xs text-gray-600 font-medium">נותר</p>
                </div>
                <p className="font-bold text-green-600 text-center">{formatCurrency(fund.amount - (fund.spent || 0))}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* שורה שלישית - קופות עודפים */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {level3Funds.map(fund => (
          <div key={fund.id} className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-200 hover:shadow-xl hover:border-yellow-300 transition-all duration-300">
            <div className="flex items-center gap-3 mb-3">
              {/* {getFundIcon(fund.name)} */}
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-800">{fund.name}</h3>
                {fund.color_class && (
                  <ColorBadge color={fund.color_class} size="sm" className="mt-1">
                    {fund.type === 'monthly' ? 'חודשי' : fund.type === 'annual' ? 'שנתי' : 'חיסכון'}
                  </ColorBadge>
                )}
              </div>
            </div>
            <div className="flex items-center justify-center gap-2">
              <DollarSign size={20} className="text-yellow-600" />
              <p className="text-xl font-bold text-gray-800 text-center">{formatCurrency(fund.amount)}</p>
            </div>
          </div>
        ))}
      </div>
      </div>

      {/* Modal - Fund transactions */}
      <FundTransactionsModal
        isOpen={showTransactionsModal}
        onClose={() => setShowTransactionsModal(false)}
        fundName={selectedFund?.name || ''}
        transactions={transactions}
        onCreate={selectedFund && selectedFund.level === 1 && enableCreateForm ? handleCreateTransaction : undefined}
        selectedMonth={currentDisplayMonth}
      />
    </>
  );
};

export default FundsGrid;



