package model

type User struct {
	ID       string `json:"id"`
	Name     string `json:"name"`
	Username string `json:"username"`
	Role     string `json:"role"`
}

type UserCredentials struct {
	User         User
	PasswordHash []byte
}
