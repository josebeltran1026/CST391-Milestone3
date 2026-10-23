-- Author: Jose Beltran Veles
-- Course: CST-391
-- Assignment: Milestone 3
-- Purpose: Supply sample data for a newly created database.
-- Run once after schema.sql.

USE music_favorites;

INSERT INTO users (user_id, name, email, role)
VALUES
  (1, 'Jose Beltran Veles', 'jose@example.com', 'customer'),
  (2, 'Demo Administrator', 'admin@example.com', 'admin');

INSERT INTO albums (
  album_id, title, artist, description, year, image
)
VALUES
  (1, 'Revolver', 'The Beatles',
   'Sample album for API testing.', 1966, ''),
  (2, 'Thriller', 'Michael Jackson',
   'Second sample album for API testing.', 1982, '');
   