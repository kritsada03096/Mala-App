package repository

import (
	"fmt"
	"golang.org/x/crypto/bcrypt"
	"mala-shop/backend/internal/model"
)

func DemoSeed() (State, error) {
	hash, err := bcrypt.GenerateFromPassword([]byte("mala1234"), bcrypt.DefaultCost)
	if err != nil {
		return State{}, err
	}
	s := State{
		Users:  []model.UserCredentials{{User: model.User{ID: "demo", Name: "พนักงานทดลอง", Username: "demo", Role: "ADMIN"}, PasswordHash: hash}},
		Orders: []model.Order{}, Payments: []model.Payment{}, Receipts: []model.Receipt{}, Transactions: []model.StockTransaction{},
		Products: []model.Product{
			{ID: "p1", Name: "เนื้อวัวเสียบไม้", Category: "เนื้อ", Price: 2000, Emoji: "🥩", Active: true},
			{ID: "p2", Name: "เนื้อวัวพันเห็ดเข็มทอง", Category: "เนื้อ", Price: 2500, Emoji: "🥓", Active: true},
			{ID: "p3", Name: "หมูสามชั้น", Category: "หมู", Price: 1500, Emoji: "🥓", Active: true},
			{ID: "p4", Name: "สันคอหมู", Category: "หมู", Price: 1500, Emoji: "🍖", Active: true},
			{ID: "p5", Name: "ลูกชิ้นปลา", Category: "ลูกชิ้น", Price: 1000, Emoji: "🍡", Active: true},
			{ID: "p6", Name: "ไส้กรอกชีส", Category: "ลูกชิ้น", Price: 1500, Emoji: "🌭", Active: true},
			{ID: "p7", Name: "บรอกโคลี", Category: "ผัก", Price: 1000, Emoji: "🥦", Active: true},
			{ID: "p8", Name: "ข้าวโพดหวาน", Category: "ผัก", Price: 1000, Emoji: "🌽", Active: true},
			{ID: "p9", Name: "เห็ดออรินจิ", Category: "เห็ด", Price: 1000, Emoji: "🍄", Active: true},
			{ID: "p10", Name: "เห็ดเข็มทอง", Category: "เห็ด", Price: 1000, Emoji: "🍄", Active: true},
			{ID: "p11", Name: "ชาอู่หลง", Category: "เครื่องดื่ม", Price: 2500, Emoji: "🍵", Active: true},
			{ID: "p12", Name: "น้ำดื่ม", Category: "เครื่องดื่ม", Price: 1000, Emoji: "💧", Active: true},
		},
	}
	for i, quantity := range []int{80, 45, 100, 60, 90, 8, 35, 50, 7, 40, 24, 48} {
		s.Stocks = append(s.Stocks, model.Stock{ProductID: fmt.Sprintf("p%d", i+1), Quantity: quantity, Threshold: 10})
	}
	return s, nil
}
