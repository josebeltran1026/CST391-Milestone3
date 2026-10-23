/*
 * Author: Jose Beltran Veles
 * Course: CST-391
 * Assignment: Milestone 3
 * Purpose: Configure the MySQL connection pool.
 */

import "dotenv/config";
import mysql from "mysql2/promise";

if (!process.env.DB_PASSWORD) {
  throw new Error("DB_PASSWORD must be set in the .env file.");
}

export const pool = mysql.createPool({
  host: process.env.DB_HOST ?? "127.0.0.1",
  port: Number(process.env.DB_PORT ?? 3306),
  user: process.env.DB_USER ?? "root",
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME ?? "music_favorites",
  waitForConnections: true,
  connectionLimit: 10
});