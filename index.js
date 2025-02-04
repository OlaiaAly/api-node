import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const app = express();
app.use(express.json());
app.use(cors());
const PORT = env("APP_PORT") || 3000;

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
  let users;
  if (req.query) {
    const { name, email, phoneNumber } = req.query;
    users = await prisma.user.findMany({
      where: {
        name: {
          contains: name,
        },
        email: {
          contains: email,
        },
        phoneNumber: {
          contains: phoneNumber,
        },
      },
    });
    res.json(users);
  } else {
    users = await prisma.user.findMany();
    res.json(users);
  }
});

// GETTING A SINGLE USER BY ID
app.get("/users/:id", async (req, res) => {
  const id = req.params.id;
  try {
    await prisma.user
      .findUnique({
        where: {
          id: id,
        },
      })
      .then((user) => {
        res.status(200).json(user);
      });
  } catch (error) {
    console.error(error);
  }
});

// ADDING A NEW USER
app.post("/users", async (req, res) => {
  const user = req.body;
  try {
    await prisma.user
      .create({
        data: {
          name: user.name,
          email: user.email,
          phoneNumber: user.phoneNumber,
        },
      })
      .then((user) => {
        res.status(201).json(user);
      });
  } catch (error) {
    console.error(error);
  }
});

// EDITING A USER
app.put("/users/:id", async (req, res) => {
  const id = req.params.id;
  const user = req.body;
  try {
    await prisma.user
      .update({
        where: {
          id: id,
        },
        data: {
          name: user.name,
          email: user.email,
          phoneNumber: user.phoneNumber,
        },
      })
      .then((user) => {
        res.status(200).json(user);
      });
  } catch (error) {
    console.error(error);
  }
});

//DELETNG A USER
app.delete("/users/:id", async (req, res) => {
  const id = req.params.id;
  try {
    await prisma.user
      .delete({
        where: {
          id: id,
        },
      })
      .then(() => {
        res.status(204).send();
      });
  } catch (error) {
    console.error(error);
  }
});
