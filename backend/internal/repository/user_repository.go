package repository

import "mala-shop/backend/internal/model"

func (s *State) UserByUsername(username string) *model.UserCredentials {
	for i := range s.Users {
		if s.Users[i].User.Username == username {
			return &s.Users[i]
		}
	}
	return nil
}
