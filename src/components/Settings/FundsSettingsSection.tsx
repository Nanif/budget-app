import React from 'react';
import { Wallet, AlertTriangle } from 'lucide-react';
import SettingsSection from './SettingsSection';
import SettingItem from './SettingItem';

interface FundsSettingsSectionProps {
  surplusFund: string;
  includedFunds: Record<string, boolean>;
  onSurplusFundChange: (value: string) => void;
  onIncludedFundsChange: (funds: Record<string, boolean>) => void;
}

const FundsSettingsSection: React.FC<FundsSettingsSectionProps> = ({
  surplusFund,
  includedFunds,
  onSurplusFundChange,
  onIncludedFundsChange
}) => {
  return (
    <>
      <SettingsSection 
        icon={<Wallet size={24} className="text-green-500" />}
        title="הגדרות קופות"
      >
        <div className="space-y-4">
          <SettingItem
            label="קופה מקבלת יתרת שוטף"
            description="הקופה שתקבל את היתרה מהשוטף בסוף החודש"
          >
            <select
              value={surplusFund}
              onChange={(e) => onSurplusFundChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-200 focus:border-green-400"
            >
              <option value="surplus">עודפים</option>
              <option value="bonus">בונוסים</option>
              <option value="savings">חיסכון</option>
            </select>
          </SettingItem>

          <SettingItem
            label="קופות הנכללות בתקציב"
            description="קופות שיחושבו כחלק מהתקציב הכולל"
          >
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={includedFunds.daily}
                  onChange={(e) => onIncludedFundsChange({ ...includedFunds, daily: e.target.checked })}
                  className="form-checkbox h-5 w-5 text-green-600 ml-2"
                />
                <span className="text-sm text-gray-700">קופת שוטף</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={includedFunds.annual}
                  onChange={(e) => onIncludedFundsChange({ ...includedFunds, annual: e.target.checked })}
                  className="form-checkbox h-5 w-5 text-green-600 ml-2"
                />
                <span className="text-sm text-gray-700">תקציב שנתי</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={includedFunds.extended}
                  onChange={(e) => onIncludedFundsChange({ ...includedFunds, extended: e.target.checked })}
                  className="form-checkbox h-5 w-5 text-green-600 ml-2"
                />
                <span className="text-sm text-gray-700">תקציב מורחב</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={includedFunds.bonus}
                  onChange={(e) => onIncludedFundsChange({ ...includedFunds, bonus: e.target.checked })}
                  className="form-checkbox h-5 w-5 text-green-600 ml-2"
                />
                <span className="text-sm text-gray-700">בונוסים</span>
              </label>
            </div>
          </SettingItem>
        </div>
      </SettingsSection>

      {/* הגדרות רמות קופות */}
      <SettingsSection 
        icon={<Wallet size={24} className="text-purple-500" />}
        title="רמות תצוגת קופות"
      >
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg mb-4">
          <div className="flex items-start gap-3">
            <AlertTriangle size={20} className="text-yellow-600 flex-shrink-0 mt-1" />
            <div>
              <h4 className="font-semibold text-yellow-800 mb-1">הגדרות תצוגה</h4>
              <p className="text-sm text-yellow-700">
                הגדרות אלו משפיעות רק על תצוגת הקופות בדשבורד ולא על הפונקציונליות שלהן.
                שינוי רמת תצוגה של קופה נעשה בעמוד ניהול הקופות.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <SettingItem
            label="שורה ראשונה (רמה 1)"
            description="קופות שיוצגו בשורה הראשונה בדשבורד"
          >
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-700">קופת שוטף</p>
            </div>
          </SettingItem>

          <SettingItem
            label="שורה שנייה (רמה 2)"
            description="קופות שיוצגו בשורה השנייה בדשבורד"
          >
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-700">תקציב שנתי, תקציב מורחב</p>
            </div>
          </SettingItem>

          <SettingItem
            label="שורה שלישית (רמה 3)"
            description="קופות שיוצגו בשורה השלישית בדשבורד"
          >
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-700">בונוסים, עודפים</p>
            </div>
          </SettingItem>
        </div>
      </SettingsSection>
    </>
  );
};

export default FundsSettingsSection;