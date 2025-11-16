// src/configs/docs/swagger.ts
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import dotenv from "dotenv";

dotenv.config();

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "AgerApp API Documentation",
      version: "2.0.0",
      description: "This is the API documentation for the CPlynk API.",
    },
    servers: [
      {
        url: `${process.env.API_URL}/v1`,
        description: `${process.env.API_URL?.includes("http://localhost") ? "Development" : "Production"} server`,
      },
    ],
  },
  apis: ["./dist/routes/*.js", "./dist/controllers/**/*.js"],
};

const swaggerSpec = swaggerJsdoc(options);

export { swaggerUi, swaggerSpec };
