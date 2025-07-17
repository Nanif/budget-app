import React from 'react';
import { Percent } from 'lucide-react';
import SettingsSection from './SettingsSection';
import SettingItem from './SettingItem';

interface CharitySettingsSectionProps {
  tithePercentage: number;
  defaultCurrency: string;
  onTithePercentageChange: (value: number) => void;
  onDefaultCurrencyChange: (value: string) => void;
}

const CharitySettingsSection: React.FC<CharitySettingsSectionProps> = ({
  tithePercentage,
  defaultCurrency,
  onTithePercentageChange,
  onDefaultCurrencyChange
}) => {
  return (
    <SettingsSection 
      icon={<Percent size={24} className="text-pink-500" />}
      title="הגדרות צדקה"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SettingItem
          label="אחוז מעשר"
          description="אחוז המעשר מתוך ההכנסות"
        >
          <div className="relative">
            <input
              type="number"
              value={tithePercentage}
              onChange={(e) => onTithePercentageChange(Number(e.target.value))}
              min="0"
              max="100"
              step="0.1"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-200 focus:border-pink-400"
            />
            <span className="absolute left-3 top-2 text-gray-500">%</span>
          </div>
        </SettingItem>
        
        <SettingItem
          label="מטבע ברירת מחדל"
          description="מטבע לחישוב מעשרות"
        >
          <select
            value={defaultCurrency}
            onChange={(e) => onDefaultCurrencyChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-200 focus:border-pink-400"
          >
            <option value="ILS">₪ שקל (ILS)</option>
            <option value="USD">$ דולר (USD)</option>
            <option value="EUR">€ אירו (EUR)</option>
          </select>
        </SettingItem>
      </div>
    </SettingsSection>
  );
};

export default CharitySettingsSection;