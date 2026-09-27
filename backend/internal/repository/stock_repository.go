package repository

import "mala-shop/backend/internal/model"

func (s *State) Stock(productID string) *model.Stock {
	for i := range s.Stocks {
		if s.Stocks[i].ProductID == productID {
			return &s.Stocks[i]
		}
	}
	return nil
}
func (s *State) Available(productID string) int {
	stock := s.Stock(productID)
	if stock == nil {
		return 0
	}
	available := stock.Quantity
	for _, order := range s.Orders {
		if order.Status == model.WaitingPayment || order.Status == model.Paid {
			for _, item := range order.Items {
				if item.ProductID == productID {
					available -= item.Quantity
				}
			}
		}
	}
	return available
}
