# Music Favorites API

Author: Jose Beltran Veles  
Course: CST-391  
Assignment: Milestone 3

## Overview

A REST API built with Node.js, Express, TypeScript, and MySQL.
It supports album CRUD and adding, viewing, and removing user
favorites. A database constraint prevents duplicate favorites.

## Requirements

- Node.js and npm
- MySQL Server 8.0
- MySQL Workbench
- Postman

## Setup

1. Run sql/schema.sql in MySQL Workbench.
2. Run sql/seed.sql once against the newly created database.
3. Run npm install in the project folder.
4. Copy .env.example to .env.
5. Set DB_PASSWORD in .env to your local MySQL password.
6. Start the API:

```bash
npm run dev
```

Base URL: http://127.0.0.1:3000

## Build and Run

```bash
npm run build
npm start
```

Stop the development server before starting the compiled server
on the same port.

## Endpoints

| Method | Path | Purpose |
| ------ | ---- | ------- |
| GET | / | API welcome message |
| GET | /api/albums | List albums |
| GET | /api/albums/:id | Retrieve one album |
| POST | /api/albums | Create an album |
| PUT | /api/albums/:id | Update an album |
| DELETE | /api/albums/:id | Delete an album |
| GET | /api/users/:userId/favorites | List a user's favorites |
| POST | /api/users/:userId/favorites | Add a favorite |
| DELETE | /api/users/:userId/favorites/:albumId | Remove a favorite |

Send POST and PUT request bodies as application/json.

### Create or Update Album Body

```json
{
  "title": "Abbey Road",
  "artist": "The Beatles",
  "description": "Sample album.",
  "year": 1969,
  "image": ""
}
```

Title and artist must be nonblank strings with at most 255
characters each. Year must be an integer from 1000 to 9999.
Description is an optional string with at most 10000 characters.
Image is an optional string with at most 2048 characters.
Omitted description and image values default to empty strings,
including during PUT updates.

### Add Favorite Body

```json
{
  "album_id": 1
}
```

User and album IDs must be positive integers.

## Responses

- 200: Successful read, update, or deletion.
- 201: Album or favorite created.
- 400: Invalid request fields or IDs.
- 404: Requested record or referenced user/album not found.
- 409: Album already exists in the user's favorites.
- 500: Unexpected database operation failure.

Removing a favorite preserves the album. Deleting an album also
removes its related favorites through ON DELETE CASCADE.

## Testing

Album CRUD and the favorites workflow were manually tested in
Postman. Create, update, and delete results were checked with GET
requests and SQL queries in MySQL Workbench.

Validation checks included invalid IDs, missing records, and
duplicate favorites. The TypeScript build completed successfully.

## Current Scope

Authentication and role authorization are not implemented.
The user ID in a URL selects a user's records; it does not
authenticate the caller. The seeded admin role does not grant
or enforce permissions.

This milestone provides the backend API. Frontend integration,
authentication, and administrator workflows remain future work.

## Configuration

.env contains local credentials and is excluded from Git.
.env.example provides the required configuration format.