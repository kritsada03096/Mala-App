package repository

import "mala-shop/backend/internal/model"

func (s *State) Order(id string) *model.Order {
	for i := range s.Orders {
		if s.Orders[i].ID == id {
			return &s.Orders[i]
		}
	}
	return nil
}
func (s *State) ReceiptForOrder(orderID string) *model.Receipt {
	for i := range s.Receipts {
		if s.Receipts[i].OrderID == orderID {
			return &s.Receipts[i]
		}
	}
	return nil
}
