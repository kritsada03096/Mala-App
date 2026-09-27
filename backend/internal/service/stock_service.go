package service

import (
	"fmt"
	"mala-shop/backend/internal/model"
	"mala-shop/backend/internal/repository"
	"strings"
	"time"
	"unicode/utf8"
)

type StockView struct {
	model.Stock
	Available int `json:"available"`
}

func (svc *Service) Stocks() ([]StockView, error) {
	stocks := []StockView{}
	err := svc.Store.View(func(s *repository.State) error {
		for _, stock := range s.Stocks {
			stocks = append(stocks, StockView{Stock: stock, Available: s.Available(stock.ProductID)})
		}
		return nil
	})
	return stocks, err
}
func (svc *Service) Transactions() ([]model.StockTransaction, error) {
	var transactions []model.StockTransaction
	err := svc.Store.View(func(s *repository.State) error { transactions = s.Transactions; return nil })
	return transactions, err
}
func (svc *Service) AdjustStock(productID string, quantity int, reason string) error {
	reason = strings.TrimSpace(reason)
	if quantity == 0 || quantity < -100000 || quantity > 100000 || reason == "" || utf8.RuneCountInString(reason) > 200 {
		return fmt.Errorf("provide a nonzero quantity within ±100000 and a reason of 1–200 characters")
	}
	return svc.Store.Update(func(s *repository.State) error {
		stock := s.Stock(productID)
		if stock == nil {
			return ErrNotFound
		}
		if s.Available(productID)+quantity < 0 {
			return fmt.Errorf("stock would fall below reserved quantity")
		}
		if stock.Quantity+quantity > 10000000 {
			return fmt.Errorf("stock exceeds demo limit")
		}
		stock.Quantity += quantity
		s.Transactions = append([]model.StockTransaction{{ID: newID(), ProductID: productID, Quantity: quantity, Reason: reason, CreatedAt: time.Now().UTC()}}, s.Transactions...)
		return nil
	})
}
