import{Request,Response,NextFunction} from "express"
import userDb from "../model/userModel";

export const isLoggedIn = (req:Request, res:Response, next:NextFunction) => {
    try {
      console.log("isLoggedIn");
      
      if (req.session.userId) {
        next();
      } else {
        res.redirect("/userLogin");
      }
    } catch (error) {
      console.error(error);
    }
  };


  export const isLoggedout = (req:Request, res:Response, next:NextFunction) => {
    try {
      if (req.session.userId) {
        res.redirect("/");
      } else {
        next();
      }
    } catch (error) {
      console.log(error);
      
    }
  };
 
  
  export const adminLoggedIn = (req:Request, res:Response, next:NextFunction) => {
    try {
      if (req.session.adminId) {
        next();
      } else {
        res.redirect("/adminLogin");
      }
    } catch (error) {
      console.log(error);
      
    }
  };
 


  

 
