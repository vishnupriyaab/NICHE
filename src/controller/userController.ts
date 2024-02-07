import { Request, Response } from "express";
import { UserRequestBody } from "../interface/userInterface";
import userDb from "../model/userModel";
import { sendEmailWithOTP, verifyOtp } from "../config/nodeMailer";
import bcrypt from "bcrypt";
import { Session } from "express-session";

interface body {
  email: string;
  password: string;
}
let loginError: string | null = null;

// Send the userLogin page
export async function getLogin(
  req: Request<{}, {}, body>,
  res: Response
): Promise<void> {
  try {
    res.render("user/userLogin", { loginError: loginError });
    loginError = null;
    return;
  } catch (error: any) {
    console.error(error);
  }
}
export async function getHome(
  req: Request<{}, {}, body>,
  res: Response
): Promise<void> {
  try {
    res.render("user/home", { loginError: loginError });
    loginError = null;
  } catch (error: any) {
    console.error(error);
  }
}

export async function getShop(req: Request, res: Response) {
  try {
    res.render("user/shop");
  } catch (error: any) {
    console.error(error);
  }
}
export async function shopDetails(req: Request, res: Response) {
  try {
    res.render("user/shopDetails");
  } catch (error: any) {
    console.error(error);
  }
}
export async function cart(req: Request, res: Response) {
  try {
    res.render("user/cart");
  } catch (error: any) {
    console.error(error);
  }
}
export async function checkout(req: Request, res: Response) {
  try {
    res.render("user/checkout");
  } catch (error: any) {
    console.error(error);
  }
}
export async function testimonial(req: Request, res: Response) {
  try {
    res.render("user/testimonial");
  } catch (error: any) {
    console.error(error);
  }
}
export async function _404page(req: Request, res: Response) {
  try {
    res.render("user/include/_404page");
  } catch (error: any) {
    console.error(error);
  }
}
export async function contact(req: Request, res: Response) {
  try {
    res.render("user/contact");
  } catch (error: any) {
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
export async function otpSnd(req: Request, res: Response): Promise<void> {
  try {
    console.log(req.body);

    const status = await sendEmailWithOTP(req.body.Email);
    if (status) res.send("Otp sended");
  } catch (error) {
    console.log(error);
  }
}

// post the userLogin

export async function postLogin(
  req: Request<{}, {}, body>,
  res: Response
): Promise<void> {
  try {
    const user = await userDb.findOne({ email: req.body.email });
    if (user) {
      const match = await bcrypt.compare(req.body.password, user.password);
      if (match) {
        req.session.userId = user.id;
        loginError = null;
        // logout
        // delete req.session.userId
        // res.redirect("/userLogin");
        res.redirect("/home");
      } else {
        loginError = "Invalid password";
        res.redirect("/userLogin");
      }
    } else {
      loginError = "User not found";
      res.redirect("/userLogin");
    }
  } catch (error: any) {
    console.error(error);
    loginError = "Internal server error";
    res.redirect("/userLogin");
  }
}
