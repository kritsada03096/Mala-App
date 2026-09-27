package model

import (
	"fmt"
	"regexp"
	"strconv"
	"strings"
)

// Money stores integer satang internally and serializes as decimal baht in JSON.
type Money int64

var moneyPattern = regexp.MustCompile(`^(0|[1-9][0-9]{0,8})(\.[0-9]{1,2})?$`)

func (m Money) MarshalJSON() ([]byte, error) {
	return []byte(fmt.Sprintf("%d.%02d", m/100, m%100)), nil
}
func (m *Money) UnmarshalJSON(data []byte) error {
	s := string(data)
	if !moneyPattern.MatchString(s) {
		return fmt.Errorf("money must be a nonnegative number with at most two decimal places")
	}
	parts := strings.Split(s, ".")
	whole, _ := strconv.ParseInt(parts[0], 10, 64)
	fraction := int64(0)
	if len(parts) == 2 {
		fraction, _ = strconv.ParseInt((parts[1] + "0")[:2], 10, 64)
	}
	*m = Money(whole*100 + fraction)
	return nil
}

type Product struct {
	ID       string `json:"id"`
	Name     string `json:"name"`
	Category string `json:"category"`
	Price    Money  `json:"price"`
	Emoji    string `json:"emoji"`
	Active   bool   `json:"active"`
}
