import { Request, Response } from "express";
import { UserRequestBody } from "../interface/userInterface";
import userDb from "../model/userModel";
import { sendEmailWithOTP, verifyOtp } from "../config/nodeMailer";

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
    const { Email, UserName, Password, Phone, otp }: UserRequestBody = req.body;

    const isVerified = verifyOtp(otp);
    console.log(isVerified);
    

    if (isVerified) {
      const newUser = new userDb({
        username: UserName,
        email: Email,
        password: Password,
        phone: Phone,
      });

      await newUser.save();
      res.send("Registered Successfully");
    } else {
      res.send("otp is invalid");
    }
  } catch (error: any) {
    console.log(error);
  }
}

// 2.1 - 3.1 ms SPEED otp sending
export async function otpSnd(req: Request, res: Response) {
  try {
    console.log(req.body);

    const status = await sendEmailWithOTP(req.body.Email);
    if (status) res.send("Otp sended");
  } catch (error) {
    console.log(error);
  }
}
