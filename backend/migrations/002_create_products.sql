BEGIN;

CREATE TABLE categories (
    id smallint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name varchar(50) NOT NULL UNIQUE
);
INSERT INTO categories (name) VALUES ('เนื้อ'), ('หมู'), ('ลูกชิ้น'), ('ผัก'), ('เห็ด'), ('เครื่องดื่ม');

CREATE TABLE products (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id smallint NOT NULL REFERENCES categories(id),
    name varchar(80) NOT NULL,
    price numeric(12,2) NOT NULL CHECK (price > 0 AND price <= 100000),
    emoji varchar(32) NOT NULL DEFAULT '🍢',
    active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX products_category_idx ON products(category_id);

CREATE TABLE stocks (
    product_id uuid PRIMARY KEY REFERENCES products(id),
    quantity integer NOT NULL DEFAULT 0 CHECK (quantity >= 0),
    low_stock_threshold integer NOT NULL DEFAULT 10 CHECK (low_stock_threshold >= 0),
    updated_at timestamptz NOT NULL DEFAULT now()
);

COMMIT;
