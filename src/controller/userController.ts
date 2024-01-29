import { Request, Response } from "express";
import { UserRequestBody } from "../interface/userInterface";
import userDb from "../model/userModel";

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
    console.log(req.body);

    const { Email, UserName, Password, Phone }: UserRequestBody = req.body;
    const newUser = new userDb({
      username: UserName,
      email: Email,
      password: Password,
    });

    await newUser.save();

    console.log(Email , UserName, Password , Phone);
    // if (!UserName) {
    //   res.status(401).json({ message: "Enter user name" });
    // }
    // if (!Email) {
    //   res.status(401).json({ message: "enter Email" });
    // }
    // if (!Password) {
    //   res.status(401).json({ message: "enter Password" });
    // }
    // if (!Phone) {
    //   res.status(401).json({ message: "enter Phone" });
    // }
    res.send("Registered Successfully");
  } catch (error: any) {
    console.log(error);
  }
}
