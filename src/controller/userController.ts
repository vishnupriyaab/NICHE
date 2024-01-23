import { Request, Response } from "express";

export function getLogin(req:Request ,res:Response){
  try {
    res.render("user/userLogin");
  } catch (error) {
    console.error(error);
  }
}


//UserSignup
export function userSignup(req: Request, res: Response) {
  try {
    console.log("hi");
    
  } catch (error: any) {
    console.log(error);
  }
}

