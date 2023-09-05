CREATE TABLE users (
    users_id SERIAL NOT NULL PRIMARY KEY,
    username text NOT NULL,
    password text NOT NULL,
    on_install boolean DEFAULT false NOT NULL
);


CREATE TABLE devices (
    devices_id SERIAL NOT NULL PRIMARY KEY,
    name text NOT NULL,
    hostname text NOT NULL,
    username text NOT NULL,
    password text NOT NULL
);