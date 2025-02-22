export const components = {
  schemas: {
    User: {
      type: "object",
      properties: {
        id: {
          type: "string",
          description: "The unique identifier for a user.",
        },
        name: {
          type: "string",
          description: "The name of the user.",
        },
        email: {
          type: "string",
          description: "The email address of the user.",
        },
        telephone: {
          type: "string",
          description: "The telephone number of the user.",
        },
        password: {
          type: "string",
          description: "The hashed password of the user.",
        },
      },
    },
  },
};
