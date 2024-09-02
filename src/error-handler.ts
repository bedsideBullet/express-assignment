import { NextFunction, Request, Response } from "express";

export const errorHandleMiddleware = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
};

export const validateRequestId = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.params.id || !Number(req.params.id)) {
    return res
      .status(400)
      .json({ message: "id should be a number" });
  }
  next();
};

export const checkErrors = (
  age: number,
  name: string,
  description: string
) => {
  const errors = [];

  if (age === null || isNaN(+age)) {
    errors.push("age should be a number");
  }
  if (typeof name !== "string") {
    errors.push("name should be a string");
  }
  if (typeof description !== "string") {
    errors.push("description should be a string");
  }

  return errors;
};
