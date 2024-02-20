import { NextFunction, Router } from "express";
import { _404page, cart, checkout, contact, getHome, getLogin, getShop, otpSnd, postLogin, shopDetails, testimonial, userRegister } from "../controller/userController";
import isLoggedIn from "../middleware/sessionAuth";
import { userRegistrationValidation, validateUserRegistration } from "../middleware/userAuth";



const userRoute: Router = Router();

userRoute.get("/userLogin", getLogin);
userRoute.get("/", getHome); //isLoggedIn
userRoute.get("/shop",getShop);
userRoute.get("/shopDetails",shopDetails);
userRoute.get("/cart",cart);
userRoute.get("/checkout",checkout);
userRoute.get("/testimonial",testimonial);
userRoute.get("/_404page",_404page);
userRoute.get("/contact",contact);


userRoute.post("/userLogin",postLogin);
userRoute.post("/registerValue", userRegister);
userRoute.post("/otpSend", userRegistrationValidation,validateUserRegistration , otpSnd);

export default userRoute;
