import { body, validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";

console.log("hello");


export const userRegistrationValidation = [
  body("Email").isEmail().normalizeEmail(),
  body("UserName").isString().trim().escape(),
  body("Password").isLength({ min: 6 }).trim(),
  body("Phone").isMobilePhone("any", { strictMode: false }).trim(),
];

export const validateUserRegistration = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return; 
  }
  next();
};
