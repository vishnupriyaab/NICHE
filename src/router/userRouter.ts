import { Router } from "express";
import {
  checkBlocked,
  userRegistrationValidation,
  userloginValidation,
  validateUserRegistration,
  validateUserlogin,
} from "../middleware/userAuth";
import { getsingleProduct } from "../controller/userController/productCtrl";
import {
  _404page,
  addAddressss,
  addToWallet,
  contact,
  deleteAddress,
  getHome,
  getLogin,
  getShop,
  getuserLogout,
  otpSnd,
  postLogin,
  resendOtp,
  testimonial,
  updateAddress,
  userProfile,
  userRegister,
  wallet,
  walletRazorpayVerification,
} from "../controller/userController/userCtrl";
import { isLoggedIn, isLoggedout } from "../middleware/sessionAuth";
import {
  addTocart,
  cart,
  reloadTotalAmount,
  removeProductfromcart,
  updateQuantity,
} from "../controller/userController/cartCtrl";
import {
  addAddress,
  cancelOrder,
  checkAddress,
  checkout,
  editAddress,
  orderInfo,
  orderRazorpayVerification,
  orderslist,
  placeorder,
  returnOrder,
  showAddress,
  successPage,
} from "../controller/userController/orderCtrl";
import {
  addToWishlist,
  removeFromWishlist,
  wishlist,
} from "../controller/userController/wishlishctrl";

const userRoute: Router = Router();

userRoute.get("/userLogin", getLogin);
userRoute.get("/userLogout", isLoggedIn, getuserLogout);

userRoute.get("/", getHome);
userRoute.get("/shop", getShop);
userRoute.get("/cart", isLoggedIn, checkBlocked, cart);
userRoute.get("/checkout", checkout);
userRoute.get("/checkaddress", checkAddress);
userRoute.get("/testimonial", testimonial);
userRoute.get("/_404page", _404page);
userRoute.get("/contact", contact);
userRoute.get(
  "/singleProductpage/:id",
  isLoggedIn,
  checkBlocked,
  getsingleProduct
);
userRoute.get("/resendotp", resendOtp);
userRoute.get("/userProfile", isLoggedIn, userProfile);
userRoute.get("/address", checkBlocked, showAddress);
userRoute.get("/addaddress", checkBlocked, addAddress);
userRoute.get("/editaddress/:id", checkBlocked, editAddress);
userRoute.get("/successpage", checkBlocked, successPage);
userRoute.get("/orders", checkBlocked, orderslist);
userRoute.get("/orderinformation/:id", checkBlocked, orderInfo);
userRoute.get("/wishlist", wishlist);
userRoute.get("/wallet", isLoggedIn, wallet);

userRoute.post("/placeorder", placeorder);
userRoute.post("/cancelOrder", cancelOrder);
userRoute.post(
  "/userLogin",
  isLoggedout,
  userloginValidation,
  validateUserlogin,
  postLogin
);
userRoute.post("/registerValue", isLoggedout, userRegister);
userRoute.post(
  "/otpSend",
  userRegistrationValidation,
  validateUserRegistration,
  otpSnd
);
userRoute.post("/addTocart", addTocart);
userRoute.post("/updateQuantity", updateQuantity);
userRoute.post("/getUpdatedTotalAmount/:productId", reloadTotalAmount);
userRoute.post("/addAddressss", addAddressss);
userRoute.post("/addToWishlist", addToWishlist);
userRoute.post("/returnOrder", returnOrder);
userRoute.post("/verifyrazorpay", orderRazorpayVerification);
userRoute.post("/addTowallet", addToWallet);
userRoute.post("/walletRazorpay", walletRazorpayVerification);

userRoute.patch("/removeFromCart", removeProductfromcart);

userRoute.delete("/deleteaddress/:id", deleteAddress);
userRoute.delete("/removeFromWishlist/:id", removeFromWishlist);

userRoute.put("/updateaddress", updateAddress);

export default userRoute;
