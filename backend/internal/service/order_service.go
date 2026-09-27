package service

import (
	"fmt"
	"mala-shop/backend/internal/model"
	"mala-shop/backend/internal/repository"
	"slices"
	"strconv"
	"time"
	"unicode/utf8"
)

func (svc *Service) Orders() ([]model.Order, error) {
	var orders []model.Order
	err := svc.Store.View(func(s *repository.State) error { orders = s.Orders; return nil })
	return orders, err
}
func (svc *Service) Order(id string) (model.Order, error) {
	var order model.Order
	err := svc.Store.View(func(s *repository.State) error {
		stored := s.Order(id)
		if stored == nil {
			return ErrNotFound
		}
		order = *stored
		return nil
	})
	return order, err
}
func (svc *Service) CreateOrder(input model.CreateOrder) (model.Order, error) {
	var order model.Order
	if input.Type != "DINE_IN" && input.Type != "TAKEAWAY" {
		return order, fmt.Errorf("invalid order type")
	}
	if input.Type == "DINE_IN" {
		table, err := strconv.Atoi(input.Table)
		if err != nil || table < 1 || table > 12 || strconv.Itoa(table) != input.Table {
			return order, fmt.Errorf("select table 1–12")
		}
	} else {
		input.Table = ""
	}
	if !slices.Contains([]string{"ไม่เผ็ด", "เผ็ดน้อย", "เผ็ดกลาง", "เผ็ดมาก"}, input.Spice) {
		return order, fmt.Errorf("invalid spice level")
	}
	if len(input.Items) == 0 || len(input.Items) > 200 || utf8.RuneCountInString(input.Note) > 300 {
		return order, fmt.Errorf("provide 1–200 items and a note of at most 300 characters")
	}
	err := svc.Store.Update(func(s *repository.State) error {
		order = model.Order{ID: newID(), Number: fmt.Sprintf("ML-%04d", len(s.Orders)+1), Type: input.Type, Table: input.Table, Spice: input.Spice, Note: input.Note, Status: model.WaitingPayment, CreatedAt: time.Now().UTC()}
		seen := map[string]bool{}
		for _, item := range input.Items {
			if seen[item.ProductID] {
				return fmt.Errorf("duplicate product")
			}
			seen[item.ProductID] = true
			p := s.Product(item.ProductID)
			if p == nil || !p.Active {
				return fmt.Errorf("product is not available")
			}
			if item.Quantity < 1 || item.Quantity > 100000 || item.Quantity > s.Available(p.ID) {
				return fmt.Errorf("invalid quantity or insufficient stock for %s", p.Name)
			}
			order.Items = append(order.Items, model.OrderItem{ProductID: p.ID, Name: p.Name, Price: p.Price, Quantity: item.Quantity})
			order.Total += p.Price * model.Money(item.Quantity)
		}
		s.Orders = append([]model.Order{order}, s.Orders...)
		return nil
	})
	return order, err
}
func (svc *Service) CancelOrder(id string) error {
	return svc.Store.Update(func(s *repository.State) error {
		order := s.Order(id)
		if order == nil {
			return ErrNotFound
		}
		if order.Status != model.WaitingPayment {
			return fmt.Errorf("only unpaid orders can be cancelled")
		}
		order.Status = model.Cancelled
		return nil
	})
}
