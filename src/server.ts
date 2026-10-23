/*
 * Author: Jose Beltran Veles
 * Course: CST-391
 * Assignment: Milestone 3
 * Purpose: Start the Express API and verify database access.
 */

import "dotenv/config";
import express from "express";
import { pool } from "./db";

const app = express();
const port = Number(process.env.PORT ?? 3000);

app.use(express.json());

app.get("/", (_req, res) => {
  res.json({ message: "Music Favorites API" });
});

app.get("/api/albums", async (_req, res) => {
  try {
    const [albums] = await pool.execute(
      "SELECT album_id, title, artist, description, year, image FROM albums"
    );

    res.status(200).json(albums);
  } catch {
    console.error("Failed to retrieve albums.");
    res.status(500).json({ message: "Unable to retrieve albums." });
  }
});

// Retrieve the favorites belonging to a specified user.
app.get("/api/users/:userId/favorites", async (req, res) => {
  const userId = Number(req.params.userId);

  if (!Number.isSafeInteger(userId) || userId <= 0) {
    res.status(400).json({ message: "User ID must be a positive integer." });
    return;
  }

  try {
    const [users] = await pool.execute<import("mysql2").RowDataPacket[]>(
      "SELECT user_id FROM users WHERE user_id = ?",
      [userId]
    );

    if (users.length === 0) {
      res.status(404).json({ message: "User not found." });
      return;
    }

    const [favorites] = await pool.execute(
      `SELECT f.favorite_id, f.user_id, f.album_id, f.created_at,
              a.title, a.artist, a.description, a.year, a.image
       FROM favorites AS f
       INNER JOIN albums AS a ON a.album_id = f.album_id
       WHERE f.user_id = ?
       ORDER BY f.favorite_id`,
      [userId]
    );

    res.status(200).json(favorites);
  } catch {
    console.error("Failed to retrieve favorites.");
    res.status(500).json({ message: "Unable to retrieve favorites." });
  }
});

// Remove an album from a specified user's favorites.
app.delete("/api/users/:userId/favorites/:albumId", async (req, res) => {
  const userId = Number(req.params.userId);
  const albumId = Number(req.params.albumId);

  if (
    !Number.isSafeInteger(userId) ||
    userId <= 0 ||
    !Number.isSafeInteger(albumId) ||
    albumId <= 0
  ) {
    res.status(400).json({
      message: "User ID and album ID must be positive integers."
    });
    return;
  }

  try {
    const [result] = await pool.execute<import("mysql2").ResultSetHeader>(
      "DELETE FROM favorites WHERE user_id = ? AND album_id = ?",
      [userId, albumId]
    );

    if (result.affectedRows === 0) {
      res.status(404).json({ message: "Favorite not found." });
      return;
    }

    res.status(200).json({
      message: "Album removed from favorites.",
      user_id: userId,
      album_id: albumId
    });
  } catch {
    console.error("Failed to remove favorite.");
    res.status(500).json({ message: "Unable to remove favorite." });
  }
});

async function startServer(): Promise<void> {
  try {
    await pool.query("SELECT 1");

    app.listen(port, "127.0.0.1", () => {
      console.log("Connected to MySQL.");
      console.log(`API running at http://127.0.0.1:${port}`);
    });
  } catch {
    console.error("Database connection failed. Check MySQL and .env settings.");
    await pool.end();
    process.exitCode = 1;
  }
}

// Add an album to a user's favorites.
app.post("/api/users/:userId/favorites", async (req, res) => {
  const userId = Number(req.params.userId);
  const { album_id: albumId } = req.body ?? {};

  if (
    !Number.isSafeInteger(userId) ||
    userId <= 0 ||
    !Number.isSafeInteger(albumId) ||
    albumId <= 0
  ) {
    res.status(400).json({
      message: "User ID and album_id must be positive integers."
    });
    return;
  }

  try {
    const [result] = await pool.execute<import("mysql2").ResultSetHeader>(
      "INSERT INTO favorites (user_id, album_id) VALUES (?, ?)",
      [userId, albumId]
    );

    res.status(201).json({
      message: "Album added to favorites.",
      favorite_id: result.insertId,
      user_id: userId,
      album_id: albumId
    });
  } catch (error) {
    const databaseError = error as { code?: string };

    if (databaseError.code === "ER_DUP_ENTRY") {
      res.status(409).json({
        message: "This album is already in the user's favorites."
      });
      return;
    }

    if (databaseError.code === "ER_NO_REFERENCED_ROW_2") {
      res.status(404).json({ message: "User or album not found." });
      return;
    }

    console.error("Failed to add favorite.");
    res.status(500).json({ message: "Unable to add favorite." });
  }
});

void startServer();

// Retrieve one album by its ID.
app.get("/api/albums/:id", async (req, res) => {
  const albumId = Number(req.params.id);

  if (!Number.isSafeInteger(albumId) || albumId <= 0) {
    res.status(400).json({ message: "Album ID must be a positive integer." });
    return;
  }

  try {
    const [rows] = await pool.execute(
      "SELECT album_id, title, artist, description, year, image FROM albums WHERE album_id = ?",
      [albumId]
    );

    const albums = rows as import("mysql2").RowDataPacket[];

    if (albums.length === 0) {
      res.status(404).json({ message: "Album not found." });
      return;
    }

    res.status(200).json(albums[0]);
  } catch {
    console.error("Failed to retrieve album.");
    res.status(500).json({ message: "Unable to retrieve album." });
  }
});

// Create a new album.
app.post("/api/albums", async (req, res) => {
  const { title, artist, description = "", year, image = "" } = req.body ?? {};

  if (
    typeof title !== "string" ||
    title.trim().length === 0 ||
    title.length > 255 ||
    typeof artist !== "string" ||
    artist.trim().length === 0 ||
    artist.length > 255 ||
    typeof description !== "string" ||
    description.length > 10000 ||
    !Number.isInteger(year) ||
    year < 1000 ||
    year > 9999 ||
    typeof image !== "string" ||
    image.length > 2048
  ) {
    res.status(400).json({
      message: "Provide a title, artist, and integer year from 1000 to 9999. Check field types and lengths."
    });
    return;
  }

  try {
    const [result] = await pool.execute<import("mysql2").ResultSetHeader>(
      "INSERT INTO albums (title, artist, description, year, image) VALUES (?, ?, ?, ?, ?)",
      [title.trim(), artist.trim(), description, year, image]
    );

    res
      .status(201)
      .location(`/api/albums/${result.insertId}`)
      .json({
        album_id: result.insertId,
        title: title.trim(),
        artist: artist.trim(),
        description,
        year,
        image
      });
  } catch {
    console.error("Failed to create album.");
    res.status(500).json({ message: "Unable to create album." });
  }
});

// Update an existing album.
app.put("/api/albums/:id", async (req, res) => {
  const albumId = Number(req.params.id);

  if (!Number.isSafeInteger(albumId) || albumId <= 0) {
    res.status(400).json({ message: "Album ID must be a positive integer." });
    return;
  }

  const { title, artist, description = "", year, image = "" } = req.body ?? {};

  if (
    typeof title !== "string" ||
    title.trim().length === 0 ||
    title.length > 255 ||
    typeof artist !== "string" ||
    artist.trim().length === 0 ||
    artist.length > 255 ||
    typeof description !== "string" ||
    description.length > 10000 ||
    !Number.isInteger(year) ||
    year < 1000 ||
    year > 9999 ||
    typeof image !== "string" ||
    image.length > 2048
  ) {
    res.status(400).json({
      message: "Provide a title, artist, and integer year from 1000 to 9999. Check field types and lengths."
    });
    return;
  }

  try {
    await pool.execute(
      "UPDATE albums SET title = ?, artist = ?, description = ?, year = ?, image = ? WHERE album_id = ?",
      [title.trim(), artist.trim(), description, year, image, albumId]
    );

    const [albums] = await pool.execute<import("mysql2").RowDataPacket[]>(
      "SELECT album_id, title, artist, description, year, image FROM albums WHERE album_id = ?",
      [albumId]
    );

    if (albums.length === 0) {
      res.status(404).json({ message: "Album not found." });
      return;
    }

    res.status(200).json(albums[0]);
  } catch {
    console.error("Failed to update album.");
    res.status(500).json({ message: "Unable to update album." });
  }
});

// Delete an album by its ID.
app.delete("/api/albums/:id", async (req, res) => {
  const albumId = Number(req.params.id);

  if (!Number.isSafeInteger(albumId) || albumId <= 0) {
    res.status(400).json({ message: "Album ID must be a positive integer." });
    return;
  }

  try {
    const [result] = await pool.execute<import("mysql2").ResultSetHeader>(
      "DELETE FROM albums WHERE album_id = ?",
      [albumId]
    );

    if (result.affectedRows === 0) {
      res.status(404).json({ message: "Album not found." });
      return;
    }

    res.status(200).json({
      message: "Album deleted successfully.",
      album_id: albumId
    });
  } catch {
    console.error("Failed to delete album.");
    res.status(500).json({ message: "Unable to delete album." });
  }
});
