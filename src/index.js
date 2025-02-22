import express from "express";
import { router as authRoutes } from "./routes/auth.js";
import { router as userRoutes } from "./routes/users.js";
import bodyParser from "body-parser";
import path from "path"; // Import the 'path' module
import { fileURLToPath } from "url"; // Import for __dirname

//SWAGGER
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";
import { components } from "./componets/shemas/swaggerComponents.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

app.use(bodyParser.json()); // For parsing JSON request bodies

const PORT = process.env.APP_PORT || 3000;

const swaggerOptions = {
  swaggerDefinition: {
    info: {
      title: "Library API",
      description: "Library API Information",
      contact: {
        name: "Amazing Developer",
      },
      servers: [`http://localhost:${PORT}`],
    },
    components,
  },
  apis: ["./src/routes/*.js"],
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));
console.log(swaggerDocs);

/**
 * @description Serves the main application page (index.html).
 * @route GET /
 * @returns {HTML} - The index.html file.
 * @throws {500} - If there is an error serving the file.
 */
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "./../public/index.html"), (err) => {
    if (err) {
      console.error("Error sending index.html:", err);
      res.status(500).send("Error loading page"); // Consider a more user-friendly error response
    }
  });
});

// Mount authentication routes
app.use("/auth", authRoutes);

// Mount protected routes (after authentication middleware)
app.use("/users", userRoutes);
app.use("/users", userRoutes);

/**
 * @description Start the server.
 */
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Visit: http://localhost:${PORT}`);
});
