import { body, validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";


export const userRegistrationValidation = [
  body("Email").isEmail().normalizeEmail().withMessage("Email is required"),
  body("UserName").isString().trim().escape().isLength({min:3,max:20}).withMessage("Username must be between 3 and 20 characters"),
  body("Password").isLength({ min: 6 }).trim().matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])/, 'g').withMessage("password must be 6 digits"),
  body("Phone").isMobilePhone("any", { strictMode: false }).trim().withMessage("Invalid phone"),
  body("UserName").isString().trim().escape().withMessage("Username is required")
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
