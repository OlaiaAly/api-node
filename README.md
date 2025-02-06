# User Management API

This API provides endpoints for managing users, including retrieving, creating, updating, and deleting user records. It's built using Express.js and Prisma Client. It's designed to be used with a frontend application that handles user authentication (as this API focuses on user _management_ after authentication). It assumes you have a Prisma schema defined with a `User` model that includes fields for `name`, `email`, `telephone`, and `password` (which is always hashed before being stored).

## Authentication

**Important:** This API _does not_ handle user authentication directly. It assumes that a separate authentication process (e.g., using JWTs as shown in the related `User.js` controller file) has already taken place, and that the `authenticateToken` middleware is used to protect these routes. This middleware is expected to populate `req.user` with the authenticated user's information.

## User Controller (`controllers/User.js`)

This module provides core user functions used by the API routes:

- **`register(userData)`:** Registers a new user.
  - Hashes the password using bcrypt before storing it.
  - **Parameters:**
    - `userData` (object): User data.
    - `userData.name` (string): User's name.
    - `userData.email` (string): User's email.
    - `userData.telephone` (string): User's telephone.
    - `userData.password` (string): User's password (will be hashed).
  - **Returns:** `Promise<object|null>`: Created user object, or `null` if error.
- **`login(credentials)`:** Logs in an existing user.
  - Compares the provided password with the stored hash using bcrypt.
  - **Parameters:**
    - `credentials` (object): User credentials.
    - `credentials.email` (string): User's email.
    - `credentials.password` (string): User's password.
  - **Returns:** `Promise<object|null>`: User object if login successful, or `null`.

## API Endpoints

### Authentication Routes (`routes/userRoutes.js`)

This file defines the authentication-related routes (registration and login) and serves the main application page.

- **GET /**: Serves the main application page (`index.html`).
- **POST /register**: Registers a new user. Uses the `register` function from the controller.
  - **Request Body (JSON):** `name`, `email`, `telephone`, `password` (all required).
  - **Returns:** `201 Created` with the new user object, or `500 Internal Server Error`.
- **POST /login**: Logs in a user and generates a JWT token. Uses the `login` function from the controller.
  - **Request Body (JSON):** `email`, `password` (both required).
  - **Returns:** `200 OK` with a JWT `token`, or `401 Unauthorized` if login fails, or `500 Internal Server Error`.
- **GET /protected**: A protected route that requires a valid JWT. Demonstrates how to use the `authenticateToken` middleware.
  - **Returns:** `200 OK` with a welcome message and the user object, or `401 Unauthorized` or `403 Forbidden` if authentication fails.

### User Management Routes (`routes/userManagementRoutes.js`)

These routes are protected by the `authenticateToken` middleware. All routes are prefixed with `/users`.

- **GET /users**: Retrieves a list of users. Supports optional filtering.
  - **Query Parameters:** `name`, `email`, `telephone` (all optional, case-insensitive, partial match).
  - **Returns:** `200 OK` with an array of user objects, or `500 Internal Server Error`.
- **GET /users/:id**: Retrieves a single user by ID.
  - **Parameters:** `id` (string, required).
  - **Returns:** `200 OK` with the user object, `404 Not Found` if not found, or `500 Internal Server Error`.
- **POST /users**: Creates a new user.
  - **Request Body (JSON):** `name`, `email`, `telephone`, `password` (all required).
  - **Returns:** `201 Created` with the new user object, or `500 Internal Server Error`.
- **PUT /users/:id**: Updates an existing user (excluding the password). **Important:** Password updates should be handled via a separate "change password" endpoint for security reasons.
  - **Parameters:** `id` (string, required).
  - **Request Body (JSON):** `name`, `email`, `telephone` (all optional).
  - **Returns:** `200 OK` with the updated user object, `404 Not Found` if not found, or `500 Internal Server Error`.
- **DELETE /users/:id**: Deletes a user.
  - **Parameters:** `id` (string, required).
  - **Returns:** `204 No Content` on success, or `500 Internal Server Error`.

## Error Handling

The API returns JSON error responses in the format `{ error: "message" }` for all error scenarios. More detailed error information is logged to the server console.

## Dependencies

- `express`: For creating the API server.
- `bcryptjs`: For hashing passwords.
- `jsonwebtoken`: For generating JWTs.
- `@prisma/client`: For database interaction.

## Setup

1.  Clone the repository.
2.  Install the dependencies: `npm install` or `yarn install`.
3.  Configure the Prisma Client to connect to your database.
4.  Set up environment variables, especially `JWT_SECRET`.
5.  Start the server: `npm start` or `yarn start`.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.
