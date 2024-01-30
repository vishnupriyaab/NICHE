import { Router } from "express";
import { getLogin, otpSnd, userRegister } from "../controller/userController";
import {userRegistrationValidation , validateUserRegistration} from "../middleware/userAuth";

const userRoute: Router = Router();

userRoute.get("/userLogin", getLogin);

userRoute.post("/registerValue", userRegister);
userRoute.post("/otpSend", userRegistrationValidation,validateUserRegistration , otpSnd)

export default userRoute;
