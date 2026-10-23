-- Author: Jose Beltran Veles
-- Course: CST-391
-- Assignment: Milestone 3
-- Purpose: Create the Music Favorites database and tables.

CREATE DATABASE IF NOT EXISTS music_favorites
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_0900_ai_ci;

USE music_favorites;

CREATE TABLE IF NOT EXISTS users (
  user_id INT NOT NULL AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  role ENUM('customer', 'admin') NOT NULL DEFAULT 'customer',
  PRIMARY KEY (user_id),
  UNIQUE KEY uq_users_email (email)
);

CREATE TABLE IF NOT EXISTS albums (
  album_id INT NOT NULL AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  artist VARCHAR(255) NOT NULL,
  description TEXT,
  year SMALLINT UNSIGNED,
  image VARCHAR(2048),
  PRIMARY KEY (album_id)
);

CREATE TABLE IF NOT EXISTS favorites (
  favorite_id INT NOT NULL AUTO_INCREMENT,
  user_id INT NOT NULL,
  album_id INT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (favorite_id),
  UNIQUE KEY uq_user_album (user_id, album_id),
  CONSTRAINT fk_favorites_user
    FOREIGN KEY (user_id) REFERENCES users (user_id)
    ON DELETE CASCADE,
  CONSTRAINT fk_favorites_album
    FOREIGN KEY (album_id) REFERENCES albums (album_id)
    ON DELETE CASCADE
);
