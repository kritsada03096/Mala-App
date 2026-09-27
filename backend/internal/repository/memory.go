package repository

import (
	"mala-shop/backend/internal/model"
	"slices"
	"sync"
)

// Store defines atomic access for services. PostgreSQL will need an implementation
// with database transactions and row locking, rather than a shared memory snapshot.
type Store interface {
	View(func(*State) error) error
	Update(func(*State) error) error
}
type State struct {
	Users        []model.UserCredentials
	Products     []model.Product
	Stocks       []model.Stock
	Orders       []model.Order
	Payments     []model.Payment
	Receipts     []model.Receipt
	Transactions []model.StockTransaction
}
type Memory struct {
	mu    sync.RWMutex
	state State
}

func NewMemory(state State) *Memory { return &Memory{state: clone(state)} }
func clone(s State) State {
	s.Users = slices.Clone(s.Users)
	for i := range s.Users {
		s.Users[i].PasswordHash = slices.Clone(s.Users[i].PasswordHash)
	}
	s.Products = slices.Clone(s.Products)
	s.Stocks = slices.Clone(s.Stocks)
	s.Orders = slices.Clone(s.Orders)
	for i := range s.Orders {
		s.Orders[i].Items = slices.Clone(s.Orders[i].Items)
	}
	s.Payments = slices.Clone(s.Payments)
	s.Receipts = slices.Clone(s.Receipts)
	s.Transactions = slices.Clone(s.Transactions)
	return s
}
func (m *Memory) View(fn func(*State) error) error {
	m.mu.RLock()
	snapshot := clone(m.state)
	m.mu.RUnlock()
	return fn(&snapshot)
}
func (m *Memory) Update(fn func(*State) error) error {
	m.mu.Lock()
	defer m.mu.Unlock()
	draft := clone(m.state)
	if err := fn(&draft); err != nil {
		return err
	}
	m.state = clone(draft)
	return nil
}
