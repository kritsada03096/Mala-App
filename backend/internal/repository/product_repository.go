package repository

import "mala-shop/backend/internal/model"

func (s *State) Product(id string) *model.Product {
	for i := range s.Products {
		if s.Products[i].ID == id {
			return &s.Products[i]
		}
	}
	return nil
}
