import express from "express";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router = express.Router();

// Middleware to parse JSON bodies
router.use(express.json());

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - telephone
 *         - password
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated ID of the user.
 *         name:
 *           type: string
 *           description: The name of the user.
 *         email:
 *           type: string
 *           description: The email of the user.
 *         telephone:
 *           type: string
 *           description: The telephone number of the user.
 *         password:
 *           type: string
 *           description: The hashed password of the user.
 *       example:
 *         id: d5fE_asz
 *         name: John Doe
 *         email: john.doe@example.com
 *         telephone: +1234567890
 *         password: hashedPassword123
 */

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users or filter users by name, email, or phone number.
 *     description: Get all users or filter users by name, email, or phone number.
 *     tags:
 *       - Users
 *     parameters:
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Filter users by name (case-insensitive, partial match).
 *       - in: query
 *         name: email
 *         schema:
 *           type: string
 *         description: Filter users by email (case-insensitive, partial match).
 *       - in: query
 *         name: telephone
 *         schema:
 *           type: string
 *         description: Filter users by telephone (case-insensitive, partial match).
 *     responses:
 *       200:
 *         description: An array of user objects.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       500:
 *         description: Error getting users.
 */
router.get("/", async (req, res) => {
  console.log("HERE IN GET USERS");
  try {
    let users = [];
    if (Object.keys(req.query).length > 0) {
      const { name, email, telephone } = req.query;
      users = await prisma.user.findMany({
        where: {
          OR: [
            { name: { contains: name, mode: "insensitive" } },
            { email: { contains: email, mode: "insensitive" } },
            { telephone: { contains: telephone, mode: "insensitive" } },
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
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get a single user by id.
 *     description: Get a single user by id.
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user to retrieve.
 *     responses:
 *       200:
 *         description: A user object.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found.
 *       500:
 *         description: Error getting the user.
 */
router.get("/:id", async (req, res) => {
  const id = req.params.id;
  console.log(id);
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
 * @swagger
 * /users:
 *   post:
 *     summary: Add a new user.
 *     description: Add a new user.
 *     tags:
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               telephone:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: The newly created user object.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       500:
 *         description: Error creating the user.
 *     example:
 *       name: John Doe
 *       email: john.doe@example.com
 *       telephone: +1234567890
 *       password: password123
 */
router.post("/", async (req, res) => {
  const { name, email, telephone, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const newUser = await prisma.user.create({
      data: {
        name: name,
        email: email,
        telephone: telephone,
        password: hashedPassword,
      },
    });
    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.error("Error creating user:", error);
  }
});

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Update a user by id.
 *     description: Update a user by id.
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: The updated user object.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       500:
 *         description: Error updating the user.
 */
router.put("/:id", async (req, res) => {
  const id = req.params.id;
  const { name, email, telephone, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const updatedUser = await prisma.user.update({
      where: { id },
      data: { name, email, telephone, password: hashedPassword },
    });
    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: "Failed to update user" });
  }
});

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Delete a user by id.
 *     description: Delete a user by id.
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user to delete.
 *     responses:
 *       204:
 *         description: No Content.
 *       500:
 *         description: Error deleting the user.
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
