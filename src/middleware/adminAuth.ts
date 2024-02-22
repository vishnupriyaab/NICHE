import { body, validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";

export const adminLoginValidation = [
  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .normalizeEmail()
    .withMessage("Invalid email"),
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 4 })
    .trim()
    .withMessage("password must be 4 digits"),
];

//   validation Middleware
export const validateadminRegistration = (
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

export const checkAdmin = (req:Request,res:Response,next:NextFunction):void =>{
  
  console.log(req.session.adminId);
  if(req.session.adminId){
    res.redirect("/dashboard");
  }else{
    next();
  }
}
