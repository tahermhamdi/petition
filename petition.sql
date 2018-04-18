DROP TABLE IF EXISTS signatures;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS user_profiles;

CREATE TABLE users (
    id SERIAL primary key,
    firstname VARCHAR(255) not null,
    lastname VARCHAR(255) not null,
    email VARCHAR(255) not null unique,
    password VARCHAR(255) not null
);
CREATE TABLE signatures (
    id SERIAL primary key,
    signature TEXT not null,
    user_id INTEGER not null REFERENCES users (id)
);

CREATE TABLE user_profiles (
    id SERIAL primary key,
    age INTEGER not null,
    city VARCHAR(255) not null,
    url VARCHAR(255) not null,
    user_id INTEGER not null REFERENCES users (id)
);

ALTER TABLE users ADD COLUMN created_at TIMESTAMP;
ALTER TABLE users ALTER COLUMN created_at SET DEFAULT now();
ALTER TABLE signatures ADD COLUMN created_at TIMESTAMP;
ALTER TABLE signatures ALTER COLUMN created_at SET DEFAULT now();
ALTER TABLE user_profiles ADD COLUMN created_at TIMESTAMP;
ALTER TABLE user_profiles ALTER COLUMN created_at SET DEFAULT now();

INSERT INTO users (firstname, lastname, email, password) VALUES ('Taher', 'Jaoui', 'taher.jaoui@gmail.com','1vssfvsvsDDDDDD');
INSERT INTO signatures (signature,user_id) VALUES ('1vssfvsvsDDDDDD');
INSERT INTO user_profiles (age, city, url,user_id) VALUES ('39', 'Berlin', 'www.taherjaoui.com');

INSERT INTO users (firstname, lastname, email, password) VALUES ('Pablo', 'Picasso', 'pablo.picasso@gmail.com','1vssfvsvsDDDDDD');
INSERT INTO signatures (signature,user_id) VALUES ('1vssfvsvsDDDDDD',2);
INSERT INTO user_profiles (age, city, url,user_id) VALUES ('62', 'Malaga', 'www.pablopicasso.com',2);
ALTER TABLE user_profiles
    ADD CONSTRAINT user_profiles_id
    UNIQUE (user_id) ;
