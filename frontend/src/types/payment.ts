export interface Payment {
  id: string; orderId: string; amount: number; method: 'MOCK_QR' | 'MOCK_CASH'; paidAt: string;
}
export interface Receipt { id: string; number: string; orderId: string; paymentId: string; issuedAt: string }
