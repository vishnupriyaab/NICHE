import { Router } from "express";
import { getLogin, otpSnd, userRegister } from "../controller/userController";
import {userRegistrationValidation , validateUserRegistration} from "../middleware/userAuth";

const userRoute: Router = Router();

userRoute.get("/userLogin", getLogin);

userRoute.post("/registerValue", userRegistrationValidation,validateUserRegistration , userRegister);
userRoute.post("/otpSend" , otpSnd)

export default userRoute;
