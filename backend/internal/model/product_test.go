package model

import (
	"encoding/json"
	"testing"
)

func TestMoneyJSON(t *testing.T) {
	for input, want := range map[string]Money{"19.99": 1999, "0.01": 1, "20": 2000, "1.2": 120} {
		var got Money
		if err := json.Unmarshal([]byte(input), &got); err != nil || got != want {
			t.Fatalf("%s: %v, %v", input, got, err)
		}
	}
	for _, input := range []string{"-1", "1.001", `"20"`, "null", "1e100", "1000000000"} {
		var value Money
		if json.Unmarshal([]byte(input), &value) == nil {
			t.Errorf("accepted %s", input)
		}
	}
	data, _ := json.Marshal(Money(5997))
	if string(data) != "59.97" {
		t.Fatal(string(data))
	}
}
