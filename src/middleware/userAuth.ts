import { body, validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";
import userDb from "../model/userModel";


export const userloginValidation =  [
  body('email').notEmpty().withMessage("asdfghj")
    .exists().isEmail().normalizeEmail().withMessage('Email is required'),
  body('password')
    .exists()
    .trim()
    .isLength({ min: 4 }).withMessage('Password is Required'),
]

export const validateUserlogin = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    errors.array().forEach((value) => {
      console.log(errors.array());
      // @ts-ignore
      req.flash(value.path, value.msg);
    });
    
    
    
    res.status(401).json({
      err: true,
      url: '/userLogin'
    });
    return; 
  }
  next();
};


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

export async function checkBlocked(req:Request, res:Response, next:NextFunction) {
  console.log("checkBlocked");
  
  const userid = req.session.userId;

  const user = await userDb.findOne({_id: userid})

  if (!userid || user?.block === true) {
    delete req.session.userId;
    return res.redirect('/');
  }
  next();
}
