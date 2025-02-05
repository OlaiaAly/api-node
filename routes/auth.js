import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs"; // Although imported, it's not used in this snippet. Consider removing if not needed elsewhere.
import { register, login } from "../controllers/User.js"; // Ensure this path is correct.
import path from "path"; // Import the 'path' module
import { fileURLToPath } from "url"; // Import for __dirname

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * @description Serves the main application page (index.html).
 * @route GET /
 * @returns {HTML} - The index.html file.
 * @throws {500} - If there is an error serving the file.
 */
router.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "./../index.html"), (err) => {
    if (err) {
      console.error("Error sending index.html:", err);
      res.status(500).send("Error loading page"); // Consider a more user-friendly error response
    }
  });
});

/**
 * @description Registers a new user.
 * @route POST /register
 * @param {Object} req.body - The user data (email, password, name, telephone).
 * @returns {Object} - The newly created user object.
 * @throws {500} - If there is an error during user registration.
 */
router.post("/register", async (req, res) => {
  const { email, password, name, telephone } = req.body;
  try {
    const newUser = await register(); // Assuming user.register() returns the new user object.
    res.status(201).json(newUser); // Send the *newUser* object, not the original 'user' instance.
  } catch (error) {
    console.error("Error creating user:", error); // Log the full error object for debugging.
    res.status(500).json({ error: error.message }); // Send a JSON error response with the error message.
  }
});

/**
 * @description Logs in a user and generates a JWT token.
 * @route POST /login
 * @param {Object} req.body - The user credentials (email, password).
 * @returns {Object} - A JSON object containing the JWT token.
 * @throws {401} - If authentication fails (invalid credentials).
 */
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await login({ email, password });

    if (user) {
      const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET, {
        expiresIn: "1h", // Consider using a longer expiration time in production.
      });
      return res.json({ token }); // Shorthand for { token: token }
    } else {
      console.log("Invalid email or password"); // More descriptive log message
      return res.status(401).json({ error: "Invalid email or password" });
    }
  } catch (error) {
    console.error("Login error:", error); // Log the error for debugging
    return res.status(500).json({ error: "Login failed" }); // Generic error message for security
  }
});

/**
 * @description Middleware to authenticate JWT tokens.
 * @param {Object} req - The Express request object.
 * @param {Object} res - The Express response object.
 * @param {Function} next - The next middleware function.
 * @returns {void}
 * @throws {401} - If the token is missing.
 * @throws {403} - If the token is invalid.
 */
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"]; // Use authHeader for clarity
  const token = authHeader && authHeader.split(" ")[1]; // Extract the token

  if (!token) {
    return res.status(401).json({ error: "Access denied. Token required." }); // More descriptive message
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.error("Token verification error:", err); // Log the error
      return res.status(403).json({ error: "Invalid token." }); // More generic error message
    }
    req.user = user; // Make the user object available in subsequent routes
    next();
  });
};

/**
 * @description Protected route that requires authentication.
 * @route GET /protected
 * @param {Object} req.user - The user object from the JWT.
 * @returns {Object} - A message confirming access to the protected route.
 * @throws {401} - If the token is missing or invalid.
 */
router.get("/protected", authenticateToken, (req, res) => {
  res.json({ message: "Welcome to the protected route!", user: req.user });
});

export { router, authenticateToken };
