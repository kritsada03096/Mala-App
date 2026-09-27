// Package database reserves the future PostgreSQL integration boundary.
// Demo mode uses repository.Memory and never opens a database connection.
package database

import "errors"

var ErrNotConfigured = errors.New("PostgreSQL integration is not enabled in demo mode")
