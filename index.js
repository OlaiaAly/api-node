import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import { env } from "process"; // Import env

const prisma = new PrismaClient();

const app = express();
app.use(express.json());
app.use(cors());
const PORT = env.APP_PORT || 3000; // Use env.APP_PORT

app.get("/", (req, res) => {
  res.send("Welcome to the Prisma API");
});

// RUNNING THE SERVER
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Visit: http://localhost:${PORT}`);
});

// GETTING ALL THE USERS OR FILTERING BY NAME, EMAIL OR PHONE NUMBER
app.get("/users", async (req, res) => {
  try {
    let users;
    if (req.query) {
      const { name, email, phoneNumber } = req.query;
      users = await prisma.user.findMany({
        where: {
          OR: [
            // Use OR for more flexible searching
            { name: { contains: name } },
            { email: { contains: email } },
            { phoneNumber: { contains: phoneNumber } },
          ],
        },
      });
    } else {
      users = await prisma.user.findMany();
    }
    res.status(200).json(users); // Explicit 200 status
  } catch (error) {
    console.error("Error getting users:", error);
    res.status(500).json({ error: "Failed to get users" }); // Error response
  }
});

// GETTING A SINGLE USER BY ID
app.get("/users/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const user = await prisma.user.findUnique({
      where: { id }, // Simplified where clause
    });
    if (user) {
      res.status(200).json(user);
    } else {
      res.status(404).json({ error: "User not found" }); // 404 if not found
    }
  } catch (error) {
    console.error("Error getting user:", error);
    res.status(500).json({ error: "Failed to get user" });
  }
});

// ADDING A NEW USER
app.post("/users", async (req, res) => {
  const user = req.body;
  try {
    const newUser = await prisma.user.create({
      data: user, // Directly use the req.body
    });
    res.status(201).json(newUser);
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: "Failed to create user" });
  }
});

// EDITING A USER
app.put("/users/:id", async (req, res) => {
  const id = req.params.id;
  const user = req.body;
  try {
    const updatedUser = await prisma.user.update({
      where: { id },
      data: user, // Directly use the req.body
    });
    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: "Failed to update user" });
  }
});

// DELETING A USER
app.delete("/users/:id", async (req, res) => {
  const id = req.params.id;
  try {
    await prisma.user.delete({
      where: { id },
    });
    res.status(204).send(); // 204 No Content is correct for delete
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: "Failed to delete user" });
  }
});
