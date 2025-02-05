import express from "express";
import bcrypt from "bcryptjs";

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const router = express.Router();
//ROUTES WITHIN THIS ROUTER ARE PROTECTED BY THE authenticateToken MIDDLEWARE

/**
 * @description Get all users or filter users by name, email, or phone number.
 * @route GET /users
 * @param {string} [name] - Filter users by name (case-insensitive, partial match).
 * @param {string} [email] - Filter users by email (case-insensitive, partial match).
 * @param {string} [phoneNumber] - Filter users by phone number (case-insensitive, partial match).
 * @returns {Array<User>} - An array of user objects.
 * @throws {500} - If there is an error getting the users.
 */
router.get("/", async (req, res) => {
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
router.get("/users/:id", async (req, res) => {
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
router.post("/", async (req, res) => {
  const { name, email, telephone, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10); // Hash the password

  try {
    const newUser = await prisma.user.create({
      data: {
        name: name,
        email: email,
        telephone: telephone,
        password: hashedPassword,
      },
    });
    res.status(201).json(newUser); // 201 Created
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.error("Error creating user:", error);
  }
});

router.put("/:id", async (req, res) => {
  const id = req.params.id;
  const { name, email, telephone, password } = req.body;
  try {
    const updatedUser = await prisma.user.update({
      where: { id },
      data: { name, email, telephone, password },
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
router.delete("/:id", async (req, res) => {
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

export { router };
