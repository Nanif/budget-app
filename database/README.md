# מסד נתונים למערכת תקציב משפחתי

## 📋 תיאור כללי

מסד נתונים PostgreSQL מתקדם לניהול תקציב משפחתי עם תמיכה מלאה בשנות תקציב, קופות, הכנסות, הוצאות, מעשרות, חובות ומשימות.

## 🗄️ מבנה הטבלאות

### טבלאות ליבה

#### `users` - משתמשים
- **תפקיד**: ניהול משתמשי המערכת
- **שדות עיקריים**: email, password_hash, first_name, last_name
- **אבטחה**: הצפנת סיסמאות, אימיילים ייחודיים

#### `budget_years` - שנות תקציב
- **תפקיד**: הגדרת תקופות תקציב גמישות
- **שדות עיקריים**: name, start_date, end_date, is_active
- **אילוצים**: תאריך סיום אחרי תחילה, שנה פעילה אחת למשתמש

#### `funds` - קופות (הגדרות בסיס)
- **תפקיד**: הגדרת סוגי קופות ותכונותיהן
- **שדות עיקריים**: name, type, level, include_in_budget
- **סוגים**: monthly, annual, savings

#### `fund_budgets` - תקציבי קופות
- **תפקיד**: קישור קופות לשנות תקציב עם סכומים
- **שדות עיקריים**: amount, amount_given, spent
- **יחסים**: fund_id ↔ budget_year_id

### טבלאות תוכן

#### `categories` - קטגוריות
- **תפקיד**: סיווג הוצאות וקישור לקופות
- **שדות עיקריים**: name, fund_id, color_class
- **עיצוב**: תמיכה בצבעי Tailwind

#### `incomes` - הכנסות
- **תפקיד**: רישום הכנסות עם קישור לשנת תקציב
- **שדות עיקריים**: name, amount, source, date
- **חישובים**: month, year אוטומטיים

#### `expenses` - הוצאות
- **תפקיד**: רישום הוצאות עם קישור לקטגוריה וקופה
- **שדות עיקריים**: name, amount, category_id, fund_id, date
- **אילוצים**: מניעת מחיקת קטגוריות/קופות בשימוש

#### `tithe_given` - מעשרות שניתנו
- **תפקיד**: מעקב אחר מעשרות וצדקה
- **שדות עיקריים**: description, amount, date
- **חישובים**: לא מוגבל לשנת תקציב ספציפית

#### `debts` - חובות
- **תפקיד**: ניהול חובות דו-כיווניים
- **שדות עיקריים**: description, amount, type, is_paid
- **סוגים**: owed_to_me, i_owe

#### `tasks` - משימות
- **תפקיד**: ניהול תזכורות ומשימות
- **שדות עיקריים**: description, completed, important
- **מעקב**: completed_at אוטומטי

### טבלאות מתקדמות

#### `asset_snapshots` + `asset_details` - נכסים
- **תפקיד**: תמונות מצב תקופתיות של נכסים והתחייבויות
- **מבנה**: snapshot ראשי + פירוט נכסים
- **גמישות**: תמיכה בסוגי נכסים דינמיים

#### `system_settings` - הגדרות מערכת
- **תפקיד**: הגדרות גמישות למשתמש
- **שדות עיקריים**: setting_key, setting_value, data_type
- **סוגי נתונים**: string, number, boolean, json

## 🔗 קשרי גומלין

### יחסים עיקריים
```
users (1) ←→ (∞) budget_years
users (1) ←→ (∞) funds
funds (1) ←→ (∞) fund_budgets (∞) ←→ (1) budget_years
funds (1) ←→ (∞) categories
categories (1) ←→ (∞) expenses
budget_years (1) ←→ (∞) incomes
budget_years (1) ←→ (∞) expenses
```

### אילוצי שלמות
- **CASCADE**: מחיקת משתמש מוחקת את כל הנתונים
- **RESTRICT**: מניעת מחיקת קטגוריות/קופות בשימוש
- **UNIQUE**: שמות ייחודיים, שנה פעילה אחת

## ⚡ ביצועים ואופטימיזציה

### אינדקסים אסטרטגיים
- **user_id**: בכל טבלה לסינון מהיר
- **תאריכים**: לחיפושים בטווחי זמן
- **מצבים**: completed, is_active, type
- **חיפושים**: source, category_id, fund_id

### פונקציות מוכנות
- `get_total_income_for_budget_year()` - סה"כ הכנסות לשנה
- `get_total_expenses_for_budget_year()` - סה"כ הוצאות לשנה
- `get_total_budget_for_budget_year()` - סה"כ תקציב לשנה
- `get_total_tithe_given()` - סה"כ מעשרות
- `get_total_income_for_tithe()` - הכנסות למעשרות

### Views מורכבות
- `budget_year_summary` - סיכום מלא לשנת תקציב
- `fund_summary` - מצב קופות עם יתרות
- `expenses_by_category` - הוצאות מקובצות

## 🛡️ אבטחה ואמינות

### הגנות מובנות
- **Triggers**: עדכון updated_at אוטומטי
- **Check constraints**: ערכים חיוביים, טווחי תאריכים
- **Foreign keys**: שלמות התייחסויות
- **Unique constraints**: מניעת כפילויות

### ניהול שגיאות
- **DEFERRABLE**: אילוצים גמישים לעדכונים מורכבים
- **COALESCE**: טיפול ב-NULL בחישובים
- **Error handling**: בפונקציות PL/pgSQL

## 🚀 התקנה ושימוש

### הרצת הסכמה
```sql
-- הרצת קובץ הסכמה המלא
\i database/schema.sql
```

### נתוני דמו
הסכמה כוללת נתוני דמו מלאים:
- משתמש דמו
- 2 שנות תקציב
- 5 קופות עם תקציבים
- קטגוריות צבעוניות
- הגדרות מערכת בסיסיות

### חיבור לאפליקציה
```javascript
// דוגמה לחיבור
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});
```

## 📊 דוגמאות שאילתות

### סיכום שנת תקציב
```sql
SELECT * FROM budget_year_summary 
WHERE user_id = $1 AND is_active = TRUE;
```

### הוצאות לפי קטגוריה
```sql
SELECT * FROM expenses_by_category 
WHERE user_id = $1 AND budget_year_id = $2
ORDER BY total_amount DESC;
```

### יתרות קופות
```sql
SELECT * FROM fund_summary 
WHERE user_id = $1 AND budget_year_id = $2
ORDER BY level, fund_name;
```

## 🔄 תחזוקה ושדרוגים

### גיבויים
```bash
# גיבוי מלא
pg_dump -h localhost -U username -d database_name > backup.sql

# שחזור
psql -h localhost -U username -d database_name < backup.sql
```

### מיגרציות
- שמירת מבנה גרסאות
- סקריפטים לשדרוגים
- בדיקות שלמות נתונים

המסד מתוכנן לתמיכה מלאה בכל הפיצ'רים הקיימים והעתידיים של המערכת! 🎯