import { Request, Response } from "express";
import { UserRequestBody } from "../interface/userInterface";


// Send the userLogin page
export function getLogin(req:Request ,res:Response){
  try {
    res.render("user/userLogin");
  } catch (error) {
    console.error(error);
  }
}


//UserSignup
export function userRegister(req: Request, res: Response) {
  try {
    const {Email,UserName,Password,Phone} : UserRequestBody = req.body
    console.log(Email , UserName, Password , Phone);
    
    
  } catch (error: any) {
    console.log(error);
  }
}

