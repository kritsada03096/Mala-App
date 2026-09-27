package service

import (
	"fmt"
	"mala-shop/backend/internal/model"
	"mala-shop/backend/internal/repository"
	"slices"
	"strings"
	"unicode/utf8"
)

func (svc *Service) Products() ([]model.Product, error) {
	var products []model.Product
	err := svc.Store.View(func(s *repository.State) error { products = s.Products; return nil })
	return products, err
}
func (svc *Service) SaveProduct(id string, product model.Product) (model.Product, error) {
	product.Name = strings.TrimSpace(product.Name)
	if product.Name == "" || utf8.RuneCountInString(product.Name) > 80 {
		return product, fmt.Errorf("name must contain 1–80 characters")
	}
	if product.Price <= 0 || product.Price > 10000000 {
		return product, fmt.Errorf("price must be between 0.01 and 100000 baht")
	}
	if !slices.Contains(model.Categories, product.Category) {
		return product, fmt.Errorf("invalid category")
	}
	if product.Emoji == "" {
		product.Emoji = "🍢"
	}
	err := svc.Store.Update(func(s *repository.State) error {
		if id != "" {
			stored := s.Product(id)
			if stored == nil {
				return ErrNotFound
			}
			product.ID = id
			*stored = product
		} else {
			product.ID = newID()
			s.Products = append(s.Products, product)
			s.Stocks = append(s.Stocks, model.Stock{ProductID: product.ID, Threshold: 10})
		}
		return nil
	})
	return product, err
}
