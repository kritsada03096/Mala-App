package service

import (
	"fmt"
	"mala-shop/backend/internal/model"
	"mala-shop/backend/internal/repository"
	"time"
)

// ConfirmDemoPayment simulates settlement. No gateway or real money is involved.
// State transitions, receipt creation and stock deduction commit atomically.
func (svc *Service) ConfirmDemoPayment(orderID, method string) (model.Receipt, error) {
	var receipt model.Receipt
	if method != "MOCK_QR" && method != "MOCK_CASH" {
		return receipt, fmt.Errorf("only simulated payment methods are supported")
	}
	err := svc.Store.Update(func(s *repository.State) error {
		order := s.Order(orderID)
		if order == nil {
			return ErrNotFound
		}
		if order.Status == model.Completed {
			stored := s.ReceiptForOrder(orderID)
			if stored == nil {
				return fmt.Errorf("receipt is missing")
			}
			receipt = *stored
			return nil
		}
		if order.Status != model.WaitingPayment {
			return fmt.Errorf("order is not awaiting payment")
		}
		for _, item := range order.Items {
			stock := s.Stock(item.ProductID)
			if stock == nil || stock.Quantity < item.Quantity {
				return fmt.Errorf("insufficient stock")
			}
		}
		now := time.Now().UTC()
		payment := model.Payment{ID: newID(), OrderID: order.ID, Amount: order.Total, Method: method, PaidAt: now}
		s.Payments = append(s.Payments, payment)
		order.Status = model.Paid
		receipt = model.Receipt{ID: newID(), Number: fmt.Sprintf("RC-%04d", len(s.Receipts)+1), OrderID: order.ID, PaymentID: payment.ID, IssuedAt: now}
		s.Receipts = append(s.Receipts, receipt)
		for _, item := range order.Items {
			s.Stock(item.ProductID).Quantity -= item.Quantity
			s.Transactions = append([]model.StockTransaction{{ID: newID(), ProductID: item.ProductID, Quantity: -item.Quantity, Reason: "ขาย " + order.Number, CreatedAt: now}}, s.Transactions...)
		}
		order.Status = model.Completed
		return nil
	})
	return receipt, err
}
func (svc *Service) Receipts() ([]model.Receipt, error) {
	var receipts []model.Receipt
	err := svc.Store.View(func(s *repository.State) error { receipts = s.Receipts; return nil })
	return receipts, err
}
func (svc *Service) Receipt(id string) (model.Receipt, error) {
	var receipt model.Receipt
	err := svc.Store.View(func(s *repository.State) error {
		for _, r := range s.Receipts {
			if r.ID == id {
				receipt = r
				return nil
			}
		}
		return ErrNotFound
	})
	return receipt, err
}
