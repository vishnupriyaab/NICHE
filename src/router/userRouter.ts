import { NextFunction, Router } from "express";
import { _404page, cart, checkout, contact, getHome, getLogin, getShop, getsingleProduct, getuserLogout, otpSnd, postLogin, resendOtp, shopDetails, testimonial, userRegister } from "../controller/userController";
import isLoggedIn from "../middleware/sessionAuth";
import { userRegistrationValidation, userloginValidation, validateUserRegistration, validateUserlogin } from "../middleware/userAuth";



const userRoute: Router = Router();

userRoute.get("/userLogin", getLogin);
userRoute.get("/userLogout", getuserLogout);

userRoute.get("/", getHome);
userRoute.get("/shop",getShop);
userRoute.get("/shopDetails",shopDetails);
userRoute.get("/cart",cart);
userRoute.get("/checkout",checkout);
userRoute.get("/testimonial",testimonial);
userRoute.get("/_404page",_404page);
userRoute.get("/contact",contact);
userRoute.get("/singleProductpage/:id",getsingleProduct);



userRoute.post("/userLogin",userloginValidation,validateUserlogin, postLogin);
userRoute.post("/registerValue", userRegister);
userRoute.post("/otpSend", userRegistrationValidation,validateUserRegistration , otpSnd);
userRoute.get("/resendotp",resendOtp )

export default userRoute;
