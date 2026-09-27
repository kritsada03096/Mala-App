package model

import "time"

type Stock struct {
	ProductID string `json:"productId"`
	Quantity  int    `json:"quantity"`
	Threshold int    `json:"threshold"`
}
type StockTransaction struct {
	ID        string    `json:"id"`
	ProductID string    `json:"productId"`
	Quantity  int       `json:"quantity"`
	Reason    string    `json:"reason"`
	CreatedAt time.Time `json:"createdAt"`
}
