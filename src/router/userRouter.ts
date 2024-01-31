import { Router } from "express";
import { getLogin, otpSnd,  postLogin,  userRegister } from "../controller/userController";
import {userRegistrationValidation , validateUserRegistration} from "../middleware/userAuth";

const userRoute: Router = Router();

userRoute.get("/userLogin", getLogin);

userRoute.post("/userLogin",postLogin);

userRoute.post("/registerValue", userRegister);
userRoute.post("/otpSend", userRegistrationValidation,validateUserRegistration , otpSnd);

export default userRoute;
