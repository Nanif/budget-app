import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Save, Loader } from 'lucide-react';
import { BudgetYear } from '../types';
import { useSystemSettings } from '../hooks/useSystemSettings';
import { useNotifications } from '../components/Notifications/NotificationSystem';
import { useFundsData } from '../hooks/useFundsData';
import { CreateFundRequest, UpdateFundRequest } from '../services/fundsService';

// Import services
import { budgetYearsService } from '../services/budgetYearsService';

// Import components
import ConfirmDialog from '../components/Settings/ConfirmDialog';
import BudgetYearsSection from '../components/Settings/BudgetYearsSection';
import CharitySettingsSection from '../components/Settings/CharitySettingsSection';
import FundsSettingsSection from '../components/Settings/FundsSettingsSection';
import CategoriesManagementSection from '../components/Settings/CategoriesManagementSection';
import FundsManagementSection from '../components/Settings/FundsManagementSection';
import AssetsManagementSection from '../components/Settings/AssetsManagementSection';

const Settings: React.FC = () => {
  // System settings hook
  const {
    settings,
    loading: settingsLoading,
    error: settingsError,
    getSettingValue,
    updateSetting,
    loadSettings
  } = useSystemSettings();

  // Funds data hook
  const {
    funds,
    categories,
    loading: fundsLoading,
    createFund,
    updateFund,
    deleteFund,
    getEditingFund,
    refreshCategories
  } = useFundsData();

  // Budget years state
  const [budgetYears, setBudgetYears] = useState<BudgetYear[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingSettings, setSavingSettings] = useState(false);

  // Confirmation dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  // Notifications
  const { addNotification } = useNotifications();

  // Settings state
  const [tithePercentage, setTithePercentage] = useState<number>(10);
  const [defaultCurrency, setDefaultCurrency] = useState<string>('ILS');
  const [surplusFund, setSurplusFund] = useState<string>('surplus');
  const [includedFunds, setIncludedFunds] = useState<Record<string, boolean>>({
    daily: true,
    annual: true,
    extended: true,
    bonus: false
  });

  // Load budget years from API
  useEffect(() => {
    loadBudgetYears();
  }, []);

  // Load settings values
  useEffect(() => {
    if (settings.length > 0) {
      // Load tithe percentage
      const titheValue = getSettingValue('tithe_percentage', 10);
      setTithePercentage(Number(titheValue));

      // Load default currency
      const currencyValue = getSettingValue('default_currency', 'ILS');
      setDefaultCurrency(String(currencyValue));

      // Load surplus fund
      const surplusValue = getSettingValue('surplus_fund', 'surplus');
      setSurplusFund(String(surplusValue));

      // Load included funds
      const includedFundsValue = getSettingValue('included_funds', {
        daily: true,
        annual: true,
        extended: true,
        bonus: false
      });
      
      if (typeof includedFundsValue === 'object') {
        setIncludedFunds(includedFundsValue);
      }
    }
  }, [settings, getSettingValue]);

  const loadBudgetYears = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await budgetYearsService.getAllBudgetYears();
      setBudgetYears(data);
    } catch (err) {
      console.error('Failed to load budget years:', err);
      setError('שגיאה בטעינת שנות התקציב');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setSavingSettings(true);
      
      // שמירת אחוז מעשר
      await updateSetting('tithe_percentage', tithePercentage, 'number');
      
      // שמירת מטבע ברירת מחדל
      await updateSetting('default_currency', defaultCurrency, 'string');
      
      // שמירת קופת עודפים
      await updateSetting('surplus_fund', surplusFund, 'string');
      
      // שמירת קxxxxxxxxxxxxxתקציב
      await updateSetting('included_funds', includedFunds, 'json');
      
      // רענון הגדרות
      await loadSettings();
      
      addNotification({
        type: 'success',
        title: 'הגדרות נשמרו בהצלחה',
        message: 'כל ההגדרות נשמרו בהצלחה'
      });
    } catch (error) {
      console.error('Failed to save settings:', error);
      addNotification({
        type: 'error',
        title: 'שגיאה בשמירת הגדרות',
        message: 'אירעה שגיאה בעת שמירת ההגדרות. נסה שוב.'
      });
    } finally {
      setSavingSettings(false);
    }
  };

  // Fund management handlers
  const handleCreateFund = async (fundData: CreateFundRequest) => {
    await createFund(fundData);
  };

  const handleUpdateFund = async (id: string, fundData: UpdateFundRequest) => {
    await updateFund(id, fundData);
  };

  const handleDeleteFund = async (id: string) => {
    await deleteFund(id);
  };

  if (loading || settingsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">טוען הגדרות...</h2>
          <p className="text-gray-600">אנא המתן בזמן טעינת הנתונים מהשרת</p>
        </div>
      </div>
    );
  }

  if (error || settingsError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-red-800 mb-2">שגיאה בטעינת ההגדרות</h2>
          <p className="text-red-600 mb-4">{error || settingsError}</p>
          <button
            onClick={() => {
              loadBudgetYears();
              loadSettings();
            }}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            נסה שוב
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <SettingsIcon size={28} className="text-gray-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-800">הגדרות מערכת</h1>
              <p className="text-gray-600">הגדרות כלליות ותצורת המערכת</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* הגדרות שנות תקציב */}
          <BudgetYearsSection
            budgetYears={budgetYears}
            onBudgetYearsChange={setBudgetYears}
            onConfirmDialog={setConfirmDialog}
          />

          {/* הגדרות צדקה */}
          <CharitySettingsSection
            tithePercentage={tithePercentage}
            defaultCurrency={defaultCurrency}
            onTithePercentageChange={setTithePercentage}
            onDefaultCurrencyChange={setDefaultCurrency}
          />

          {/* הגדרות קופות */}
          <FundsSettingsSection
            surplusFund={surplusFund}
            includedFunds={includedFunds}
            onSurplusFundChange={setSurplusFund}
            onIncludedFundsChange={setIncludedFunds}
          />

          {/* כפתור שמירת הגדרות */}
          <div className="flex justify-end">
            <button
              onClick={handleSaveSettings}
              disabled={savingSettings}
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2 disabled:bg-blue-300"
            >
              {savingSettings ? (
                <>
                  <Loader size={16} className="animate-spin" />
                  שומר...
                </>
              ) : (
                <>
                  <Save size={16} />
                  שמירת הגדרות
                </>
              )}
            </button>
          </div>

          {/* ניהול קטגוריות */}
          <CategoriesManagementSection
            categories={categories}
            funds={funds}
            onCategoriesChange={refreshCategories}
          />

          {/* ניהול קופות */}
          <FundsManagementSection
            funds={funds}
            categories={categories}
            loading={fundsLoading}
            onCreateFund={handleCreateFund}
            onUpdateFund={handleUpdateFund}
            onDeleteFund={handleDeleteFund}
            onGetEditingFund={getEditingFund}
            onConfirmDialog={setConfirmDialog}
          />

          {/* ניהול נכסים והתחייבויות */}
          <AssetsManagementSection 
            onAssetsChange={() => {
              // רענון נתונים אם נדרש
              console.log('Assets configuration changed');
            }}
          />
        </div>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};

export default Settings;