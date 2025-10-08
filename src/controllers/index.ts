import { Request, Response } from "express";

export const index = async (request: Request, response: Response) => {
  response.status(200).json({
    status: `success`,
    message: `Welcome to AgerApp API`,
    error: false,
  });
};


/**
 * @swagger
 * /:
 *   get:
 *     summary: API root
 *     description: Redirects to the versioned API base path.
 *     tags:
 *       - Health
 *     responses:
 *       302:
 *         description: Redirect to /v1.
 */
