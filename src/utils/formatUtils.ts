/**
 * פונקציות עזר לעיצוב מספרים ומטבעות
 */

/**
 * עיצוב מספר עם פסיקים כל 3 ספרות
 */
export function formatNumber(value: string | number | null | undefined): string {
  // טיפול בערכים null או undefined
  if (value === null || value === undefined) {
    return '';
  }
  
  const stringValue = typeof value === 'number' ? value.toString() : value;
  const cleanValue = stringValue.replace(/[^\d.]/g, '');
  
  if (!cleanValue) return '';
  
  const parts = cleanValue.split('.');
  const integerPart = parts[0];
  const decimalPart = parts[1];
  
  // הוספת פסיקים כל 3 ספרות
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  
  return decimalPart !== undefined ? `${formattedInteger}.${decimalPart}` : formattedInteger;
}

/**
 * הסרת פסיקים ממספר לקבלת ערך נקי
 */
export function cleanNumber(value: string): string {
  return value.replace(/,/g, '');
}

/**
 * עיצוב מטבע עם פסיקים
 */
export function formatCurrency(amount: number, currency: string = 'ILS'): string {
  return new Intl.NumberFormat('he-IL', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * פונקציה לטיפול בשינוי ערך בשדה סכום
 */
export function handleAmountChange(
  value: string | null | undefined,
  onChange: (formattedValue: string) => void
): void {
  const formatted = formatNumber(value);
  onChange(formatted);
}

/**
 * פונקציה לקבלת ערך מספרי נקי משדה מעוצב
 */
export function getNumericValue(formattedValue: string): number {
  const cleaned = cleanNumber(formattedValue);
  const numeric = Number(cleaned);
  return isNaN(numeric) ? 0 : numeric;
}