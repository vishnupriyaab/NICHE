import { body, validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";


export const userRegistrationValidation = [
  body("Email").isEmail().normalizeEmail().withMessage("Email is invalid"),
  body("UserName").isString().trim().escape().withMessage("Invalid User name"),
  body("Password").isLength({ min: 6 }).trim().withMessage("password must be 6 digits"),
  body("Phone").isMobilePhone("any", { strictMode: false }).trim().withMessage("Invalid phone"),
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
