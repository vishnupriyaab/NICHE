import{Request,Response,NextFunction} from "express"

const isLoggedIn = (req:Request, res:Response, next:NextFunction) => {
    if (req.session.userId) {
      next();
    } else {
      res.redirect("/userLogin");
    }
  };
  export default isLoggedIn 
  
  
  export const adminLoggedIn = (req:Request, res:Response, next:NextFunction) => {
    if (req.session.adminId) {
      next();
    } else {
      res.redirect("/adminLogin");
    }
  };
 
  

 
