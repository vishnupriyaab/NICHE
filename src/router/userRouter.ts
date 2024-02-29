import { NextFunction, Router } from "express";
import {
  userRegistrationValidation,
  userloginValidation,
  validateUserRegistration,
  validateUserlogin,
} from "../middleware/userAuth";
import {
  addTocart,
  cart,
  updatequantity,
  // reloadTotalAmount,
  // updatequantity,
} from "../controller/userController/cartCtrl";
import { getsingleProduct } from "../controller/userController/productCtrl";
import {
  _404page,
  checkout,
  contact,
  getHome,
  getLogin,
  getShop,
  getuserLogout,
  otpSnd,
  postLogin,
  resendOtp,
  testimonial,
  userProfile,
  userRegister,
} from "../controller/userController/userCtrl";

const userRoute: Router = Router();


userRoute.get("/userLogin", getLogin);
userRoute.get("/userLogout", getuserLogout);


userRoute.get("/", getHome);
userRoute.get("/shop", getShop);
userRoute.get("/cart", cart);
userRoute.get("/checkout", checkout);
userRoute.get("/testimonial", testimonial);
userRoute.get("/_404page", _404page);
userRoute.get("/contact", contact);
userRoute.get("/singleProductpage/:id", getsingleProduct);
userRoute.get("/resendotp", resendOtp);
// userRoute.get("/getUpdatedTotalAmount/:productId", reloadTotalAmount);
userRoute.get("/userProfile", userProfile);


userRoute.post("/userLogin", userloginValidation, validateUserlogin, postLogin);
userRoute.post("/registerValue", userRegister);
userRoute.post(
  "/otpSend",
  userRegistrationValidation,
  validateUserRegistration,
  otpSnd
);
userRoute.post("/addTocart", addTocart);
userRoute.post("/updateQuantity", updatequantity);

export default userRoute;
