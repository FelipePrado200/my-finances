import type { Transaction } from "@prisma/client";

/**
 * Transaction as it travels over JSON to the browser.
 * `amount` is a plain number so the client can do arithmetic on it.
 */
export type TransactionDTO = {
  id: string;
  amount: number;
  type: string;
  description: string | null;
  date: string;
  userId: string;
};

/**
 * Prisma stores `amount` as NUMERIC and returns it as a Decimal object.
 * JSON turns a Decimal into a string, which breaks every calculation in the
 * browser. Convert it to a number here, at the API boundary, so the database
 * keeps full precision and the client always receives a number.
 */
export function serializeTransaction(transaction: Transaction): TransactionDTO {
  return {
    id: transaction.id,
    amount: toNumber(transaction.amount),
    type: transaction.type,
    description: transaction.description,
    date: transaction.date.toISOString(),
    userId: transaction.userId,
  };
}

export function serializeTransactions(
  transactions: Transaction[]
): TransactionDTO[] {
  return transactions.map(serializeTransaction);
}

/**
 * Convert a Prisma Decimal (or anything numeric) to a number.
 * Use this before any arithmetic on a money field.
 */
export function toNumber(value: unknown): number {
  if (typeof value === "number") return value;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}
