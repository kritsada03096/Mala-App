package service

import (
	"encoding/json"
	"mala-shop/backend/internal/model"
	"mala-shop/backend/internal/repository"
	"sync"
	"testing"
)

func testShop() *Service {
	return New(repository.NewMemory(repository.State{
		Products: []model.Product{{ID: "p1", Name: "beef", Category: "เนื้อ", Price: 1999, Active: true}},
		Stocks:   []model.Stock{{ProductID: "p1", Quantity: 10, Threshold: 2}},
	}))
}
func orderInput(quantity int) model.CreateOrder {
	var input model.CreateOrder
	_ = json.Unmarshal([]byte(`{"type":"DINE_IN","table":"1","spice":"เผ็ดกลาง","items":[{"productId":"p1","quantity":1}]}`), &input)
	input.Items[0].Quantity = quantity
	return input
}
func TestCheckoutAndIdempotency(t *testing.T) {
	svc := testShop()
	order, err := svc.CreateOrder(orderInput(3))
	if err != nil {
		t.Fatal(err)
	}
	if order.Total != 5997 {
		t.Fatalf("total: %v", order.Total)
	}
	stocks, _ := svc.Stocks()
	if stocks[0].Quantity != 10 || stocks[0].Available != 7 {
		t.Fatal(stocks)
	}
	_, err = svc.SaveProduct("p1", model.Product{Name: "new name", Category: "เนื้อ", Price: 5000, Active: true})
	if err != nil {
		t.Fatal(err)
	}
	receipt, err := svc.ConfirmDemoPayment(order.ID, "MOCK_QR")
	if err != nil {
		t.Fatal(err)
	}
	again, err := svc.ConfirmDemoPayment(order.ID, "MOCK_QR")
	if err != nil || receipt.ID != again.ID {
		t.Fatal("duplicate receipt", err)
	}
	stored, _ := svc.Order(order.ID)
	if stored.Status != model.Completed || stored.Total != 5997 || stored.Items[0].Name != "beef" {
		t.Fatal(stored)
	}
	stocks, _ = svc.Stocks()
	if stocks[0].Quantity != 7 || stocks[0].Available != 7 {
		t.Fatal(stocks)
	}
	_ = svc.Store.View(func(s *repository.State) error {
		if len(s.Payments) != 1 || len(s.Receipts) != 1 || len(s.Transactions) != 1 {
			t.Fatal("duplicate settlement")
		}
		return nil
	})
	if svc.CancelOrder(order.ID) == nil {
		t.Fatal("paid order must not be cancelled")
	}
}
func TestReservationCancellationAndValidation(t *testing.T) {
	svc := testShop()
	order, err := svc.CreateOrder(orderInput(10))
	if err != nil {
		t.Fatal(err)
	}
	if _, err := svc.CreateOrder(orderInput(1)); err == nil {
		t.Fatal("oversold")
	}
	if svc.AdjustStock("p1", -1, "damaged") == nil {
		t.Fatal("removed reserved stock")
	}
	if err := svc.CancelOrder(order.ID); err != nil {
		t.Fatal(err)
	}
	if _, err := svc.ConfirmDemoPayment(order.ID, "MOCK_CASH"); err == nil {
		t.Fatal("paid cancelled order")
	}
	stocks, _ := svc.Stocks()
	if stocks[0].Available != 10 {
		t.Fatal(stocks)
	}
	for _, quantity := range []int{0, -1, 11} {
		if _, err := svc.CreateOrder(orderInput(quantity)); err == nil {
			t.Fatalf("accepted quantity %d", quantity)
		}
	}
	input := orderInput(1)
	input.Items = append(input.Items, input.Items[0])
	if _, err := svc.CreateOrder(input); err == nil {
		t.Fatal("accepted duplicate product")
	}
	input = orderInput(1)
	input.Table = ""
	if _, err := svc.CreateOrder(input); err == nil {
		t.Fatal("accepted missing table")
	}
}
func TestAtomicRollback(t *testing.T) {
	svc := testShop()
	order, _ := svc.CreateOrder(orderInput(2))
	_ = svc.Store.Update(func(s *repository.State) error { s.Stocks[0].Quantity = 1; return nil })
	if _, err := svc.ConfirmDemoPayment(order.ID, "MOCK_QR"); err == nil {
		t.Fatal("payment should fail")
	}
	_ = svc.Store.View(func(s *repository.State) error {
		if len(s.Payments) != 0 || len(s.Receipts) != 0 || len(s.Transactions) != 0 || s.Orders[0].Status != model.WaitingPayment {
			t.Fatal("partial settlement")
		}
		return nil
	})
}
func TestConcurrentOrdersCannotOversell(t *testing.T) {
	svc := testShop()
	var wg sync.WaitGroup
	var mu sync.Mutex
	successes := 0
	for range 25 {
		wg.Add(1)
		go func() {
			defer wg.Done()
			if _, err := svc.CreateOrder(orderInput(1)); err == nil {
				mu.Lock()
				successes++
				mu.Unlock()
			}
		}()
	}
	wg.Wait()
	if successes != 10 {
		t.Fatalf("got %d successful orders, want 10", successes)
	}
	stocks, _ := svc.Stocks()
	if stocks[0].Available != 0 || stocks[0].Quantity != 10 {
		t.Fatal(stocks)
	}
}
func TestConcurrentPaymentsSettleOnce(t *testing.T) {
	svc := testShop()
	order, _ := svc.CreateOrder(orderInput(1))
	var wg sync.WaitGroup
	for range 15 {
		wg.Add(1)
		go func() {
			defer wg.Done()
			if _, err := svc.ConfirmDemoPayment(order.ID, "MOCK_CASH"); err != nil {
				t.Error(err)
			}
		}()
	}
	wg.Wait()
	_ = svc.Store.View(func(s *repository.State) error {
		if len(s.Payments) != 1 || len(s.Receipts) != 1 || len(s.Transactions) != 1 || s.Stocks[0].Quantity != 9 {
			t.Fatal("settled more than once")
		}
		return nil
	})
}
