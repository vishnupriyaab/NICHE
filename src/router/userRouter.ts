import { NextFunction, Router } from "express";
import { getHome, getLogin, otpSnd, postLogin, userRegister } from "../controller/userController";
import isLoggedIn from "../middleware/sessionAuth";
import { userRegistrationValidation, validateUserRegistration } from "../middleware/userAuth";






const userRoute: Router = Router();

userRoute.get("/userLogin", getLogin);
userRoute.get("/home", isLoggedIn,getHome);

userRoute.post("/userLogin",postLogin);


userRoute.post("/registerValue", userRegister);
userRoute.post("/otpSend", userRegistrationValidation,validateUserRegistration , otpSnd);

export default userRoute;
