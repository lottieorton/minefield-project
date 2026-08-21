-- SQL query

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(225),
  first_name VARCHAR(100),
  last_name VARCHAR(100)
);

CREATE TABLE federated_credentials (
  id SERIAL PRIMARY KEY,
  user_id integer REFERENCES users(id) NOT NULL,
  provider varchar(225) NOT NULL,
  subject varchar(225) NOT NULL
);

CREATE TABLE games (
  game_id SERIAL PRIMARY KEY,
  user_id integer REFERENCES users(id) NOT NULL,
  difficulty VARCHAR(50) NOT NULL,
  win BOOLEAN NOT NULL
);