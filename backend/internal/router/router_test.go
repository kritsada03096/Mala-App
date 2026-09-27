package router

import (
	"encoding/json"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"mala-shop/backend/internal/repository"
	"mala-shop/backend/internal/service"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"
)

func TestAPIAuthenticationAndCheckout(t *testing.T) {
	gin.SetMode(gin.TestMode)
	seed, err := repository.DemoSeed()
	if err != nil {
		t.Fatal(err)
	}
	secret := []byte("test-only-secret-at-least-thirty-two-bytes")
	r := New(repository.NewMemory(seed), secret)
	request := func(method, path, body, token string) *httptest.ResponseRecorder {
		req := httptest.NewRequest(method, path, strings.NewReader(body))
		req.Header.Set("Content-Type", "application/json")
		if token != "" {
			req.Header.Set("Authorization", "Bearer "+token)
		}
		res := httptest.NewRecorder()
		r.ServeHTTP(res, req)
		return res
	}
	if res := request("GET", "/health", "", ""); res.Code != 200 || !strings.Contains(res.Body.String(), `"databaseConnected":false`) {
		t.Fatal(res.Body.String())
	}
	if request("GET", "/api/v1/products", "", "").Code != 401 {
		t.Fatal("unprotected endpoint")
	}
	if request("POST", "/api/v1/auth/login", `{"username":"demo","password":"wrong"}`, "").Code != 401 {
		t.Fatal("accepted invalid password")
	}
	login := request("POST", "/api/v1/auth/login", `{"username":"demo","password":"mala1234"}`, "")
	if login.Code != 200 {
		t.Fatal(login.Body.String())
	}
	var auth struct {
		Data struct {
			Token string `json:"token"`
		} `json:"data"`
	}
	_ = json.Unmarshal(login.Body.Bytes(), &auth)
	token := auth.Data.Token
	if request("GET", "/api/v1/products", "", token).Code != 200 {
		t.Fatal("valid token rejected")
	}
	if request("GET", "/api/v1/products", "", token+"tampered").Code != 401 {
		t.Fatal("accepted tampered token")
	}
	for name, claims := range map[string]service.Claims{
		"expired":      {Role: "ADMIN", RegisteredClaims: jwt.RegisteredClaims{Subject: "demo", Issuer: service.TokenIssuer, ExpiresAt: jwt.NewNumericDate(time.Now().Add(-time.Hour))}},
		"no-expiry":    {Role: "ADMIN", RegisteredClaims: jwt.RegisteredClaims{Subject: "demo", Issuer: service.TokenIssuer}},
		"wrong-issuer": {Role: "ADMIN", RegisteredClaims: jwt.RegisteredClaims{Subject: "demo", Issuer: "other", ExpiresAt: jwt.NewNumericDate(time.Now().Add(time.Hour))}},
	} {
		invalid, _ := jwt.NewWithClaims(jwt.SigningMethodHS256, claims).SignedString(secret)
		if request("GET", "/api/v1/orders", "", invalid).Code != 401 {
			t.Fatalf("accepted %s", name)
		}
	}
	staff, _ := jwt.NewWithClaims(jwt.SigningMethodHS256, service.Claims{Role: "STAFF", RegisteredClaims: jwt.RegisteredClaims{Subject: "staff", Issuer: service.TokenIssuer, ExpiresAt: jwt.NewNumericDate(time.Now().Add(time.Hour))}}).SignedString(secret)
	if request("POST", "/api/v1/products", `{}`, staff).Code != 403 {
		t.Fatal("staff can edit products")
	}
	create := request("POST", "/api/v1/orders", `{"type":"TAKEAWAY","spice":"เผ็ดกลาง","items":[{"productId":"p1","quantity":2}],"total":1}`, token)
	if create.Code != http.StatusCreated {
		t.Fatal(create.Body.String())
	}
	var order struct {
		Data struct {
			ID    string  `json:"id"`
			Total float64 `json:"total"`
		} `json:"data"`
	}
	_ = json.Unmarshal(create.Body.Bytes(), &order)
	if order.Data.Total != 40 {
		t.Fatal("client controlled price")
	}
	path := "/api/v1/orders/" + order.Data.ID + "/payments/demo-confirm"
	first := request("POST", path, `{"method":"MOCK_QR"}`, token)
	second := request("POST", path, `{"method":"MOCK_QR"}`, token)
	if first.Code != 200 || second.Code != 200 || first.Body.String() != second.Body.String() {
		t.Fatal("non-idempotent payment", first.Body.String(), second.Body.String())
	}
	if request("POST", "/api/v1/orders", `{broken`, token).Code != 400 {
		t.Fatal("malformed request accepted")
	}
	if request("GET", "/api/v1/orders/missing", "", token).Code != 404 {
		t.Fatal("missing order should return 404")
	}
}
