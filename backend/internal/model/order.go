package model

import "time"

const (
	WaitingPayment = "WAITING_PAYMENT"
	Paid           = "PAID"
	Completed      = "COMPLETED"
	Cancelled      = "CANCELLED"
)

type OrderItem struct {
	ProductID string `json:"productId"`
	Name      string `json:"name"`
	Price     Money  `json:"price"`
	Quantity  int    `json:"quantity"`
}
type Order struct {
	ID        string      `json:"id"`
	Number    string      `json:"number"`
	Type      string      `json:"type"`
	Table     string      `json:"table"`
	Items     []OrderItem `json:"items"`
	Total     Money       `json:"total"`
	Status    string      `json:"status"`
	Spice     string      `json:"spice"`
	Note      string      `json:"note"`
	CreatedAt time.Time   `json:"createdAt"`
}
type CreateOrder struct {
	Type  string `json:"type"`
	Table string `json:"table"`
	Spice string `json:"spice"`
	Note  string `json:"note"`
	Items []struct {
		ProductID string `json:"productId"`
		Quantity  int    `json:"quantity"`
	} `json:"items"`
}
