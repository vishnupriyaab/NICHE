import { body, validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";


export const userRegistrationValidation = [
  body("UserName").notEmpty().withMessage('Username is required').isString().trim().escape().isLength({min:3,max:20}).withMessage("Username must be between 3 and 20 characters"),
  body("Email").notEmpty().withMessage('Email is required').isEmail().normalizeEmail().withMessage("Invalid email"),
  body("Phone").notEmpty().withMessage('Phone number is required').isLength({min:10,max:10}).isMobilePhone("any", { strictMode: false }).trim().withMessage("Invalid phone"),
  body("Password").notEmpty().withMessage('Password is required').isLength({ min: 6 }).trim().withMessage("password must be 6 digits"),
  body("ConfirmpassWord").notEmpty().withMessage('Enter your Password again').isLength({ min: 6 }).trim().withMessage("Plz enter your correct password"),
];  


// Validation Middleware
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

