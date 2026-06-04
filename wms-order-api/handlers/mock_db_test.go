package handlers

import (
	"database/sql"
	"database/sql/driver"
	"io"
	"strings"
	"time"
)

const (
	mockOrderID    = "11111111-1111-1111-1111-111111111111"
	mockUserID     = "22222222-2222-2222-2222-222222222222"
	mockCustomerID = "33333333-3333-3333-3333-333333333333"
	mockItemID     = "44444444-4444-4444-4444-444444444444"
	mockProductID  = "55555555-5555-5555-5555-555555555555"
)

type mockDriver struct{}

func (d *mockDriver) Open(name string) (driver.Conn, error) {
	return &mockConn{}, nil
}

type mockConn struct{}

func (c *mockConn) Prepare(query string) (driver.Stmt, error) {
	return &mockStmt{query: query}, nil
}

func (c *mockConn) Close() error {
	return nil
}

func (c *mockConn) Begin() (driver.Tx, error) {
	return &mockTx{}, nil
}

type mockStmt struct {
	query string
}

func (s *mockStmt) Close() error {
	return nil
}

func (s *mockStmt) NumInput() int {
	return -1
}

func (s *mockStmt) Exec(args []driver.Value) (driver.Result, error) {
	return &mockResult{}, nil
}

func (s *mockStmt) Query(args []driver.Value) (driver.Rows, error) {
	return &mockRows{query: s.query}, nil
}

type mockTx struct{}

func (t *mockTx) Commit() error {
	return nil
}

func (t *mockTx) Rollback() error {
	return nil
}

type mockResult struct{}

func (r *mockResult) LastInsertId() (int64, error) {
	return 1, nil
}

func (r *mockResult) RowsAffected() (int64, error) {
	return 1, nil
}

type mockRows struct {
	query string
	index int
}

func (r *mockRows) Columns() []string {
	q := strings.ToLower(r.query)
	if strings.Contains(q, "select version()") {
		return []string{"version"}
	}
	if strings.Contains(q, "order_items") {
		return []string{"id", "order_id", "product_id", "product_name", "quantity", "unit_price", "returned_quantity"}
	}
	if strings.Contains(q, "orders") {
		return []string{"id", "user_id", "customer_id", "customer_name", "customer_address", "total_amount", "status", "created_at", "updated_at"}
	}
	return []string{"id"}
}

func (r *mockRows) Close() error {
	return nil
}

func (r *mockRows) Next(dest []driver.Value) error {
	q := strings.ToLower(r.query)
	if strings.Contains(q, "select version()") {
		if r.index > 0 {
			return io.EOF
		}
		r.index++
		dest[0] = "PostgreSQL 15.0"
		return nil
	}

	if r.index > 0 {
		return io.EOF
	}
	r.index++

	if strings.Contains(q, "order_items") {
		dest[0] = mockItemID    // id
		dest[1] = mockOrderID   // order_id
		dest[2] = mockProductID // product_id
		dest[3] = "Test Product" // productName
		dest[4] = 2             // quantity
		dest[5] = 50.0          // unitPrice
		dest[6] = 0             // returnedQuantity
		return nil
	}

	if strings.Contains(q, "orders") {
		dest[0] = mockOrderID    // id
		dest[1] = mockUserID     // userId
		dest[2] = mockCustomerID // customerId
		dest[3] = "John Doe"     // customerName
		dest[4] = "123 Street"   // customerAddress
		dest[5] = 100.0          // totalAmount
		dest[6] = "pending"      // status
		dest[7] = time.Now()     // createdAt
		dest[8] = time.Now()     // updatedAt
		return nil
	}

	dest[0] = mockOrderID
	return nil
}

func init() {
	sql.Register("mock_postgres", &mockDriver{})
}
