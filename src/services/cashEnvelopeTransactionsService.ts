import { apiClient } from './apiClient';

export interface CashEnvelopeTransaction {
  id: string;
  user_id: string;
  fund_id: string;
  budget_year_id: string;
  date: string; // YYYY-MM-DD
  description?: string;
  amount: number;
  month?: number;
  year?: number;
  created_at?: string;
  updated_at?: string;
  funds?: any;
}

export interface CreateCashEnvelopeTxPayload {
  fund_id: string;
  date: string; // YYYY-MM-DD
  amount: number;
  description?: string;
  budget_year_id?: string;
  month?: number; // 1-12 optional: allow creating for a specific month
}

export interface ListCashEnvelopeTxQuery {
  month?: number; // 1-12
  budgetYearId?: string;
}

class CashEnvelopeTransactionsService {
  async create(payload: CreateCashEnvelopeTxPayload): Promise<CashEnvelopeTransaction> {
    const res = await apiClient.post<CashEnvelopeTransaction>(
      '/cash-envelope-transactions',
      payload
    );
    return res.data;
  }

  async list(params: ListCashEnvelopeTxQuery = {}): Promise<CashEnvelopeTransaction[]> {
    const search = new URLSearchParams();
    if (params.month) search.append('month', String(params.month));
    if (params.budgetYearId) search.append('budgetYearId', params.budgetYearId);

    const endpoint = `/cash-envelope-transactions${search.toString() ? `?${search.toString()}` : ''}`;
    const res = await apiClient.get<CashEnvelopeTransaction[]>(endpoint);
    return res.data;
  }
}

export const cashEnvelopeTransactionsService = new CashEnvelopeTransactionsService();
