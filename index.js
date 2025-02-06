import express from "express";
import dotenv from "dotenv";
import { router as authRoutes, authenticateToken } from "./routes/auth.js";
import { router as userRoutes } from "./routes/users.js";
import bodyParser from "body-parser";

const app = express();

app.use(bodyParser.json()); // For parsing JSON request bodies

const PORT = process.env.APP_PORT || 3000;

app.get("/", (req, res) => {
  res.redirect("/auth"); // 302 Found (default)
});

// Mount authentication routes
app.use("/auth", authRoutes);

// Mount protected routes (after authentication middleware)
app.use("/users", authenticateToken, userRoutes);

/**
 * @description Start the server.
 */
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Visit: http://localhost:${PORT}`);
});
