BEGIN;

CREATE TABLE orders (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number bigint GENERATED ALWAYS AS IDENTITY UNIQUE,
    user_id uuid NOT NULL REFERENCES users(id),
    order_type varchar(12) NOT NULL CHECK (order_type IN ('DINE_IN', 'TAKEAWAY')),
    table_number smallint,
    status varchar(20) NOT NULL DEFAULT 'WAITING_PAYMENT'
        CHECK (status IN ('WAITING_PAYMENT', 'PAID', 'COMPLETED', 'CANCELLED')),
    spice_level varchar(30) NOT NULL,
    note varchar(300) NOT NULL DEFAULT '',
    total numeric(18,2) NOT NULL CHECK (total > 0),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CHECK ((order_type = 'DINE_IN' AND table_number IS NOT NULL AND table_number BETWEEN 1 AND 12)
        OR (order_type = 'TAKEAWAY' AND table_number IS NULL))
);
CREATE INDEX orders_status_created_idx ON orders(status, created_at DESC);

CREATE TABLE order_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id uuid NOT NULL REFERENCES orders(id),
    product_id uuid NOT NULL REFERENCES products(id),
    product_name varchar(80) NOT NULL,
    unit_price numeric(12,2) NOT NULL CHECK (unit_price > 0),
    quantity integer NOT NULL CHECK (quantity > 0 AND quantity <= 100000),
    UNIQUE (order_id, product_id)
);

CREATE TABLE payments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id uuid NOT NULL UNIQUE REFERENCES orders(id),
    amount numeric(18,2) NOT NULL CHECK (amount > 0),
    method varchar(20) NOT NULL CHECK (method IN ('MOCK_QR', 'MOCK_CASH')),
    paid_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (id, order_id)
);

CREATE TABLE receipts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    receipt_number bigint GENERATED ALWAYS AS IDENTITY UNIQUE,
    order_id uuid NOT NULL UNIQUE REFERENCES orders(id),
    payment_id uuid NOT NULL UNIQUE,
    issued_at timestamptz NOT NULL DEFAULT now(),
    FOREIGN KEY (payment_id, order_id) REFERENCES payments(id, order_id)
);

CREATE TABLE stock_transactions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id uuid NOT NULL REFERENCES products(id),
    order_id uuid REFERENCES orders(id),
    user_id uuid NOT NULL REFERENCES users(id),
    quantity integer NOT NULL CHECK (quantity <> 0),
    reason varchar(200) NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX stock_transactions_product_created_idx ON stock_transactions(product_id, created_at DESC);
CREATE UNIQUE INDEX stock_transactions_one_sale_idx ON stock_transactions(order_id, product_id) WHERE order_id IS NOT NULL;

COMMIT;
