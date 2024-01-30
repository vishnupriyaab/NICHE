import { Request, Response } from "express";
import { UserRequestBody } from "../interface/userInterface";
import userDb from "../model/userModel";
import { sendEmailWithOTP } from "../config/nodeMailer";

// Send the userLogin page
export function getLogin(req: Request, res: Response) {
  try {
    res.render("user/userLogin");
  } catch (error) {
    console.error(error);
  }
}

//UserSignup
export async function userRegister(req: Request, res: Response) {
  try {
    const { Email, UserName, Password, Phone }: UserRequestBody = req.body;

    const newUser = new userDb({
      username: UserName,
      email: Email,
      password: Password,
    });

    await newUser.save();
    res.send("Registered Successfully");
  } catch (error: any) {
    console.log(error);
  }
}


// 2.1 - 3.1 ms SPEED otp sending 
export async function otpSnd(req: Request, res: Response) {
  try {
    const status = await sendEmailWithOTP(req.body.email)
    if(status) res.send("Otp sended")
  } catch (error) {
    console.log(error);
  }
}


