import { Request, Response, NextFunction } from "express";
import { body, validationResult } from "express-validator";

export const categoryValidation = [
  body("name")
    .notEmpty()
    .withMessage("Category Name is Required")
    .isLength({ min: 3 })
    .withMessage("category must be 3 characters")
    .isLength({ max: 20 })
    .withMessage("Category must be at most 20 characters")
    .matches(/^[a-zA-Z\s]+$/, "i")
    .withMessage("Category must contain only letters and spaces. No special characters allowed"),
];
export const validateCategory = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
  }
  next();
};

export const editcategoryValidation = [
  body("name")
    .notEmpty()
    .withMessage("Category Name is Required")
    .isLength({ min: 3 })
    .withMessage("category must be 3 characters")
    .isLength({ max: 20 })
    .withMessage("Category must be at most 20 characters")
    .matches(/^[a-zA-Z\s]+$/, "i")
    .withMessage("Category must contain only letters and spaces. No special characters allowed"),
];

export const editvalidateCategory = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
  }
  next();
};