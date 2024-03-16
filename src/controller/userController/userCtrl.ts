import { Request, Response } from "express";
import { UserRequestBody } from "../../interface/userInterface";
import userDb from "../../model/userModel";
import {
  generateOTP,
  sendEmailWithOTP,
  verifyOtp,
} from "../../config/nodeMailer";
import bcrypt from "bcrypt";
import productDb from "../../model/productModel";
import CartDb from "../../model/cartModel";
import Addressdb from "../../model/addressModel";
import Walletdb from "../../model/walletModel";
import Razorpay from "razorpay";
import crypto from "crypto";
import mongoose from "mongoose";

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
    const product = await productDb
      .find({ isHidden: false })
      .populate("category");
    const cart = await CartDb.findOne({ userId: user }).populate("products");

    res.render("user/home", { loginError, user, product, cart });
    loginError = null;
  } catch (error: any) {
    console.error(error);
  }
}

export async function getShop(req: Request, res: Response) {
  try {
    const user = req.session.userId;
    const cart = await CartDb.findOne({ userId: user }).populate("products");
    res.render("user/shop", { user });
  } catch (error: any) {
    console.error(error);
  }
}

// export async function checkout(req: Request, res: Response) {
//   try {
//     res.render("user/checkout");
//   } catch (error: any) {
//     console.error(error);
//   }
// }
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
export async function userProfile(req: Request, res: Response) {
  try {
    console.log("deffrev", req.session.userId);

    const user = await userDb.findOne({ _id: req.session.userId });
    console.log(user, "user");

    const cart = await CartDb.findOne({ userId: user }).populate("products");
    res.render("user/userProfile", { user, cart });
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
    if (user?.block == true) {
      // @ts-ignore
      req.flash("savedEmail", req.body.email);
      res.json({ block: true, message: "User Blocked by Admin" });
    } else if (user) {
      const match = await bcrypt.compare(req.body.password, user.password);
      if (match) {
        req.session.userId = user.id;
        loginError = null;
        res.status(200).json({
          status: true,
          url: "/",
        });
      } else {
        loginError = "Invalid password";
        // @ts-ignore
        req.flash("savedEmail", req.body.email);
        res.status(401).json({
          err: true,
          url: "/userLogin",
        });
        // res.redirect("/userLogin");
      }
    } else {
      loginError = "User not found";
      // @ts-ignore
      req.flash("savedEmail", req.body.email);
      res.status(401).json({
        err: true,
        url: "/userLogin",
      });
      // res.redirect("/userLogin");
    }
  } catch (error: any) {
    console.error(error);
    loginError = "Internal server error";
    res.status(500).json({
      err: true,
      url: "/userLogin",
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

export async function addAddressss(req: Request, res: Response): Promise<void> {
  try {
    let { name, district, country, phonenumber, hNo, state, pin, addressType } =
      req.body;
    (phonenumber = parseInt(phonenumber)), (pin = parseInt(pin));

    if (
      !name ||
      !district ||
      !country ||
      !phonenumber ||
      !hNo ||
      !state ||
      !pin ||
      !addressType
    ) {
      res
        .status(401)
        .json({ errStatus: true, message: "Content cannot be empty" });
      return;
    }

    let user = req.session.userId;

    const userId = await userDb.findById(user);

    const newAddress = new Addressdb({
      userId: user,
      name,
      district,
      country,
      phonenumber,
      hNo,
      state,
      pin,
      addressType,
    });
    const saved = await newAddress.save();

    // if (saved) res.status(200).send(true);
    if (saved) {
      res.status(201).json({ message: "Address Added" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
}

export async function deleteAddress(req: Request, res: Response) {
  try {
    const id = req.params.id;
    await Addressdb.findByIdAndDelete(id);
    res.status(200).json({ message: "Address deleted successfully" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function updateAddress(req: Request, res: Response) {
  try {
    let { name, district, country, phonenumber, hNo, state, pin, addressType } =
      req.body;

    const newAdd = await Addressdb.updateOne(
      { _id: req.session.addressId },
      {
        $set: {
          name,
          district,
          country,
          phonenumber,
          hNo,
          state,
          pin,
          addressType,
        },
      }
    );

    res.status(200).send(true);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
}

export async function wallet(req: Request, res: Response) {
  try {
    const user = req.session.userId;
    const wallet = await Walletdb.find({ userId: req.session.userId });
    const wall = await Walletdb.aggregate([
      { $match: {userId:new mongoose.Types.ObjectId(user)} },
      { $unwind: "$transactions" },
      { $sort: { "transactions.transactionDate": -1 } },
      {
        $group: {
          _id: "null",
          sortedArray: { $push: "$transactions" },
        },
      },
      {
        $unwind: "$sortedArray"
      },
    ]);
    console.log(wall,"wall");
    const cart = await CartDb.findOne({ userId: user }).populate("products");
    res.render("user/wallet", { wallet, user, cart,wall });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
}

export async function addToWallet(req: Request, res: Response) {
  try {
    const { amount } = req.body;

    const money = Number(amount);
    (req.session as any).amount = money;

    var instance = new Razorpay({
      key_id: process.env.RZP_KEY_ID as string,
      key_secret: process.env.RZP_KEY_SECRET as string,
    });

    var options = {
      amount: money * 100, // amount in the smallest currency unit
      currency: "INR",
      receipt: "order_rcptid_11",
    };

    instance.orders.create(options, function (err, order) {
      return res.json({ order });
    });

    const walletdb = await Walletdb.find();
  } catch (error) {
    console.error("Error adding to wallet:", error);
    res.status(500).send("Internal Server Error");
  }
}

export async function walletRazorpayVerification(req: Request, res: Response) {
  try {
    new Razorpay({
      key_id: process.env.RZP_KEY_ID as string,
      key_secret: process.env.RZP_KEY_SECRET as string,
    });

    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } =
      req.body;

    const body_data = razorpay_order_id + "|" + razorpay_payment_id;

    const generated_signature = crypto
      .createHmac("sha256", process.env.RZP_KEY_SECRET as string)
      .update(body_data)
      .digest("hex");

    const isValid = generated_signature === razorpay_signature;
    if (isValid) {
      const newTransaction = {
        amount: (req.session as any).amount,
        type: "+ CREDIT",
      };

      const wallet = await Walletdb.updateOne(
        { userId: req.session.userId },
        {
          $push: { transactions: newTransaction },
          $inc: { walletBalance: (req.session as any).amount },
        },
        { upsert: true }
      );

      delete (req.session as any)?.amount;
      // req.flash("success", true);
      res.redirect("/wallet");
    }
  } catch (error) {
    // If there's an error, send an error response
    delete (req.session as any)?.amount;
    console.error("Error while verifying", error);
    res.status(500).send("Error verifiying razorpay payment");
  }
}
