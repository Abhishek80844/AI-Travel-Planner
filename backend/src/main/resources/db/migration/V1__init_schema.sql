-- V1__init_schema.sql - Core Database Schema Initialization

CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    "role" VARCHAR(20) NOT NULL DEFAULT 'USER',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS trips (
    id BIGSERIAL PRIMARY KEY,
    destination VARCHAR(150) NOT NULL,
    budget DECIMAL(12, 2) NOT NULL,
    days INT NOT NULL,
    travel_style VARCHAR(50) NOT NULL,
    travelers INT NOT NULL DEFAULT 1,
    created_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    user_id BIGINT NOT NULL,
    share_token VARCHAR(64) UNIQUE,
    CONSTRAINT fk_trips_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS itineraries (
    id BIGSERIAL PRIMARY KEY,
    "day" INT NOT NULL,
    morning TEXT,
    afternoon TEXT,
    evening TEXT,
    trip_id BIGINT NOT NULL,
    CONSTRAINT fk_itineraries_trip FOREIGN KEY (trip_id) REFERENCES trips (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS hotels (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    price DECIMAL(10, 2),
    rating DECIMAL(3, 2),
    address VARCHAR(255),
    trip_id BIGINT NOT NULL,
    CONSTRAINT fk_hotels_trip FOREIGN KEY (trip_id) REFERENCES trips (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS restaurants (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    rating DECIMAL(3, 2),
    price VARCHAR(20),
    location VARCHAR(255),
    trip_id BIGINT NOT NULL,
    CONSTRAINT fk_restaurants_trip FOREIGN KEY (trip_id) REFERENCES trips (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS packing_lists (
    id BIGSERIAL PRIMARY KEY,
    item VARCHAR(200) NOT NULL,
    category VARCHAR(50) NOT NULL,
    is_checked BOOLEAN NOT NULL DEFAULT FALSE,
    trip_id BIGINT NOT NULL,
    CONSTRAINT fk_packing_lists_trip FOREIGN KEY (trip_id) REFERENCES trips (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS weather_caches (
    id BIGSERIAL PRIMARY KEY,
    destination VARCHAR(150) NOT NULL,
    forecast_date DATE NOT NULL,
    temperature DECIMAL(5, 2),
    rain_chance DECIMAL(5, 2),
    humidity DECIMAL(5, 2),
    wind DECIMAL(5, 2),
    fetched_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_trips_user_id ON trips (user_id);
CREATE INDEX IF NOT EXISTS idx_trips_share_token ON trips (share_token);
CREATE INDEX IF NOT EXISTS idx_weather_dest_date ON weather_caches (destination, forecast_date);
