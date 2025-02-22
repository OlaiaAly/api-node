/**
 * This module provides functions for user registration and login.
 * It uses bcryptjs for password hashing and Prisma Client for database interaction.
 */

import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

/**
 * Registers a new user.
 *
 * @param {object} userData - User data including name, email, telephone, and password.
 * @param {string} userData.name - The user's name.
 * @param {string} userData.email - The user's email address.
 * @param {string} userData.telephone - The user's telephone number.
 * @param {string} userData.password - The user's password (will be hashed).
 * @returns {Promise<object|null>} A promise that resolves to the created user object, or null if an error occurs.
 */
async function register({ name, email, telephone, password }) {
  try {
    const prisma = new PrismaClient(); // Initialize Prisma Client
    const hashedPassword = await bcrypt.hash(password, 10); // Hash the password using bcrypt
    const createdUser = await prisma.user.create({
      data: {
        name: name,
        email: email,
        telephone: telephone,
        password: hashedPassword, // Store the hashed password in the database
      },
    });
    return createdUser; // Return the created user object
  } catch (error) {
    console.error("Error creating user:", error); // Log the error to the console
    return null; // Return null to indicate failure
  }
}

/**
 * Logs in an existing user.
 *
 * @param {object} credentials - User credentials including email and password.
 * @param {string} credentials.email - The user's email address.
 * @param {string} credentials.password - The user's password.
 * @returns {Promise<object|null>} A promise that resolves to the user object if login is successful, or null if login fails.
 */
async function login({ email, password }) {
  try {
    const prisma = new PrismaClient(); // Initialize Prisma Client

    const user = await prisma.user.findUnique({
      where: {
        email: email, // Find the user by email
      },
    });

    // Check if the user exists and the entered password matches the stored hash.
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return null; // Return null if user not found or password doesn't match
    }
    return user; // Return the user object if login is successful
  } catch (error) {
    console.error("Error logging in:", error); // Log the error to the console
    return null; // Return null to indicate failure
  }
}

export { register, login }; // Export the functions for use in other modules
