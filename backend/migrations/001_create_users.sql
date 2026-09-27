BEGIN;

CREATE TABLE roles (
    id smallint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name varchar(20) NOT NULL UNIQUE CHECK (name IN ('ADMIN', 'STAFF'))
);
INSERT INTO roles (name) VALUES ('ADMIN'), ('STAFF');

CREATE TABLE users (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id smallint NOT NULL REFERENCES roles(id),
    username varchar(80) NOT NULL UNIQUE,
    display_name varchar(100) NOT NULL,
    password_hash text NOT NULL,
    active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now()
);

COMMIT;
