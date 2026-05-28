/**
 * Transactions API - Transaction management endpoints
 */

import apiClient from "./client";

export interface TransactionCreate {
  asset_id: string;
  transaction_type: "buy" | "sell";
  quantity: string;
  price_per_unit: string;
  fees?: string;
  transaction_date?: string;
  notes?: string;
}

// Get all transactions
export const getTransactions = async (params?: {
  asset_id?: string;
  type?: string;
  start_date?: string;
  end_date?: string;
}) => {
  const response = await apiClient.get("/transactions", { params });
  return response.data;
};

// Create transaction
export const createTransaction = async (data: TransactionCreate) => {
  // Ensure transaction_date is ISO string, default to now
  const payload = {
    ...data,
    transaction_date: data.transaction_date
      ? new Date(data.transaction_date).toISOString()
      : new Date().toISOString(),
    fees: data.fees || "0",
  };
  const response = await apiClient.post("/transactions", payload);
  return response.data;
};

// Delete transaction
export const deleteTransaction = async (id: string) => {
  await apiClient.delete(`/transactions/${id}`);
};
