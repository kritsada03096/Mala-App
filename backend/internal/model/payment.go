package model

import "time"

type Payment struct {
	ID      string    `json:"id"`
	OrderID string    `json:"orderId"`
	Amount  Money     `json:"amount"`
	Method  string    `json:"method"`
	PaidAt  time.Time `json:"paidAt"`
}
type Receipt struct {
	ID        string    `json:"id"`
	Number    string    `json:"number"`
	OrderID   string    `json:"orderId"`
	PaymentID string    `json:"paymentId"`
	IssuedAt  time.Time `json:"issuedAt"`
}
