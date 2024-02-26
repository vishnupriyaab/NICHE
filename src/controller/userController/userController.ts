import { Request, Response } from "express";
import { UserRequestBody } from "../../interface/userInterface";
import userDb from "../../model/userModel";
import { generateOTP, sendEmailWithOTP, verifyOtp } from "../../config/nodeMailer";
import bcrypt from "bcrypt";
import productDb from "../../model/productModel";

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
    res.render("user/userLogin", { loginError });
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
    const user = req.session.userId;
    const product = await productDb.find().populate("category");
    res.render("user/home", { loginError, user, product });
    loginError = null;
  } catch (error: any) {
    console.error(error);
  }
}

export async function getShop(req: Request, res: Response) {
  try {
    const user = req.session.userId;
    res.render("user/shop", {user});
  } catch (error: any) {
    console.error(error);
  }
}

export async function cart(req: Request, res: Response) {
  try {
    const user = req.session.userId;
    res.render("user/cart",{user});
  } catch (error: any) {
    console.error(error);
    res.status(500).send("Internal Server Error");
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
export async function userRegister(
  req: Request<{}, {}, UserRequestBody>,
  res: Response
) {
  try {
    const { Email, UserName, Password, Phone, otp } = req.body;
    console.log(Email);
    req.session.Email = Email;
    console.log(req.session.Email, req.session.otp, "1");

    const isVerified = verifyOtp(otp, req.session.otp ? req.session.otp : "");
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
    console.log(req.body, "hyyyy");
    req.session.Email = req.body.Email;
    const newOTP = generateOTP();
    req.session.otp = newOTP;
    const status = await sendEmailWithOTP(req.body.Email, newOTP);
    if (status) res.send("Otp sended");
  } catch (error) {
    console.log(error);
  }
}
export async function resendOtp(req: Request, res: Response) {
  try {
    console.log("xcvbnm,");
    const email = req.session.Email;
    const newOTP = generateOTP();
    req.session.otp = newOTP;
    await sendEmailWithOTP(email ? email : "", newOTP);
    console.log(`New OTP generated for ${email}: ${newOTP}`);

    // Redirect back to the page with a success message or handle it as needed
    res.json({ message: "Resend Otp Sended" });
  } catch (error) {
    console.error("Error while resending OTP:", error);
    res.status(500).send("Internal Server Error");
  }
}

// post the userLogin
export async function postLogin(
  req: Request<{}, {}, body>,
  res: Response
): Promise<void> {
  try {
    const user = await userDb.findOne({ email: req.body.email });
    if(user?.block == true){
      // @ts-ignore
      req.flash("savedEmail", req.body.email);
      res.json({block: true,message:"User Blocked by Admin"})
    }else if (user) {
      const match = await bcrypt.compare(req.body.password, user.password);
      if (match) {
        req.session.userId = user.id;
        loginError = null;
        res.status(200).json({
          status: true,
          url: '/'
        });
      } else {
        loginError = "Invalid password";
        // @ts-ignore
        req.flash("savedEmail", req.body.email);
        res.status(401).json({
          err: true,
          url: '/userLogin'
        });
        // res.redirect("/userLogin");
      }
    } else {
      loginError = "User not found";
      // @ts-ignore
      req.flash("savedEmail", req.body.email);
      res.status(401).json({
        err: true,
        url: '/userLogin'
      });
      // res.redirect("/userLogin");
    }
  } catch (error: any) {
    console.error(error);
    loginError = "Internal server error";
    res.status(500).json({
      err: true,
      url: '/userLogin'
    });
    // res.redirect("/userLogin");
  }
}

export async function getuserLogout(req: Request, res: Response) {
  try {
    delete req.session.userId;
    res.redirect("/");
    return;
  } catch (error: any) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
}

export async function getsingleProduct(req: Request, res: Response) {
  try {
    const data = await productDb.findOne({ _id: req.params.id });
    const userid = req.session.userId;
    const userdata = await userDb.findById(userid);
    res
      .status(200)
      .render("user/singleProductpage", { product: data, user: userdata });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
}
