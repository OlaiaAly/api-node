/**
 * @file This file defines the API endpoints for managing users using Express and Prisma.
 */

import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import { env } from "process";
import path from "path";
import { fileURLToPath } from "url"; // Import the necessary function

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

const app = express();
app.use(express.json());
app.use(cors());
const PORT = env.APP_PORT || 3000;

/**
 * @description Serves the main application page (index.html).
 * @route GET /
 * @returns {HTML} - The index.html file.
 * @throws {500} - If there is an error serving the file.
 */
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"), (err) => {
    if (err) {
      console.error("Error sending index.html:", err);
      res.status(500).send("Error loading page"); // Or a more user-friendly error message/page
    }
  });
});
/**
 * @description Get all users or filter users by name, email, or phone number.
 * @route GET /users
 * @param {string} [name] - Filter users by name (case-insensitive, partial match).
 * @param {string} [email] - Filter users by email (case-insensitive, partial match).
 * @param {string} [phoneNumber] - Filter users by phone number (case-insensitive, partial match).
 * @returns {Array<User>} - An array of user objects.
 * @throws {500} - If there is an error getting the users.
 */
app.get("/users", async (req, res) => {
  try {
    let users = [];
    if (Object.keys(req.query).length > 0) {
      const { name, email, phoneNumber } = req.query;
      users = await prisma.user.findMany({
        where: {
          OR: [
            { name: { contains: name, mode: "insensitive" } }, // Added insensitive mode
            { email: { contains: email, mode: "insensitive" } }, // Added insensitive mode
            { phoneNumber: { contains: phoneNumber } },
          ],
        },
      });
      res.status(200).json(users);
    } else {
      users = await prisma.user.findMany();
      res.status(200).json(users);
    }
  } catch (error) {
    console.error("Error getting users:", error);
    res.status(500).json({ error: "Failed to get users" });
  }
});

/**
 * @description Get a single user by ID.
 * @route GET /users/:id
 * @param {string} id - The ID of the user to retrieve.
 * @returns {User} - The user object.
 * @throws {404} - If the user is not found.
 * @throws {500} - If there is an error getting the user.
 */
app.get("/users/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const user = await prisma.user.findUnique({
      where: { id },
    });
    if (user) {
      res.status(200).json(user);
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    console.error("Error getting user:", error);
    res.status(500).json({ error: "Failed to get user" });
  }
});

/**
 * @description Add a new user.
 * @route POST /users
 * @param {User} req.body - The user object to create.
 * @returns {User} - The newly created user object.
 * @throws {500} - If there is an error creating the user.
 */
app.post("/users", async (req, res) => {
  const user = req.body;
  try {
    const newUser = await prisma.user.create({
      data: user,
    });
    res.status(201).json(newUser); // 201 Created
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: "Failed to create user" });
  }
});

/**
 * @description Edit a user.
 * @route PUT /users/:id
 * @param {string} id - The ID of the user to update.
 * @param {User} req.body - The updated user object.
 * @returns {User} - The updated user object.
 * @throws {500} - If there is an error updating the user.
 */
app.put("/users/:id", async (req, res) => {
  const id = req.params.id;
  const user = req.body;
  try {
    const updatedUser = await prisma.user.update({
      where: { id },
      data: user,
    });
    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: "Failed to update user" });
  }
});

/**
 * @description Delete a user.
 * @route DELETE /users/:id
 * @param {string} id - The ID of the user to delete.
 * @returns {204} - No Content.
 * @throws {500} - If there is an error deleting the user.
 */
app.delete("/users/:id", async (req, res) => {
  const id = req.params.id;
  try {
    await prisma.user.delete({
      where: { id },
    });
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: "Failed to delete user" });
  }
});

/**
 * @description Start the server.
 */
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Visit: http://localhost:${PORT}`);
});
