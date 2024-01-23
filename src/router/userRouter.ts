import { Router } from "express";
import { getLogin, userRegister } from "../controller/userController";
import {userRegistrationValidation , validateUserRegistration} from "../middleware/userAuth";

const userRoute: Router = Router();

userRoute.get("/userLogin", getLogin);

userRoute.post("/registerValue", userRegistrationValidation,validateUserRegistration , userRegister);

export default userRoute;
