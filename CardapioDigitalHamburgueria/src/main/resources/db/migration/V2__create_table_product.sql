CREATE TABLE produto (
    id serial PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description text,
    price NUMERIC(10,2) NOT NULL,
    img_url VARCHAR(255) NOT NULL,
    category VARCHAR(50)
);
