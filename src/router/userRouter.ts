import { NextFunction, Router } from "express";
import {checkBlocked,userRegistrationValidation,userloginValidation,validateUserRegistration,validateUserlogin,} from "../middleware/userAuth";
import { getsingleProduct } from "../controller/userController/productCtrl";
import {_404page,checkout,contact,getHome,getLogin,getShop,getuserLogout,otpSnd,postLogin,resendOtp,testimonial,userProfile,userRegister,} from "../controller/userController/userCtrl";
import { isLoggedIn, isLoggedout } from "../middleware/sessionAuth";
import { addTocart, cart, updatequantity } from "../controller/userController/cartCtrl";

const userRoute: Router = Router();

userRoute.get("/userLogin", getLogin);
userRoute.get("/userLogout", isLoggedIn, getuserLogout);

userRoute.get("/", getHome);
userRoute.get("/shop", getShop);
userRoute.get("/cart",isLoggedIn,checkBlocked, cart);
userRoute.get("/checkout", checkout);
userRoute.get("/testimonial", testimonial);
userRoute.get("/_404page", _404page);
userRoute.get("/contact", contact);
userRoute.get("/singleProductpage/:id",isLoggedIn,checkBlocked,getsingleProduct);
userRoute.get("/resendotp", resendOtp);
userRoute.get("/userProfile", isLoggedIn, userProfile);
userRoute.get("/userOredrPage");

userRoute.post("/userLogin",isLoggedout,userloginValidation,validateUserlogin,postLogin);
userRoute.post("/registerValue", isLoggedout, userRegister);
userRoute.post("/otpSend",userRegistrationValidation,validateUserRegistration,otpSnd);
userRoute.post("/addTocart",addTocart );
userRoute.post("/updateQuantity", updatequantity);

export default userRoute;
