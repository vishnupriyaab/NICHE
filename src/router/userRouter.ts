import { Router } from "express";
import {
  checkBlocked,
  userRegistrationValidation,
  userloginValidation,
  validateUserRegistration,
  validateUserlogin,
} from "../middleware/userAuth";
import { getSingleProduct } from "../controller/userController/productCtrl";
import {
  _404page,
  addAddressss,
  addToWallet,
  contact,
  deleteAddress,
  getHome,
  getLogin,
  getShop,
  getUserLogout,
  otpSend,
  postLogin,
  refferalLinkGenerating,
  resendOtp,
  searchProduct,
  testimonial,
  updateAddress,
  userProfile,
  userRegister,
  wallet,
  walletRazorpayVerification,
} from "../controller/userController/userCtrl";
import { isLoggedIn, isLoggedout } from "../middleware/sessionAuth";
import {
  addToCart,
  cart,
  reloadTotalAmount,
  removeProductFromCart,
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
  ordersList,
  placeOrder,
  returnOrder,
  showAddress,
  successPage,
} from "../controller/userController/orderCtrl";
import {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
} from "../controller/userController/wishlishctrl";
import { checkCoupon, removeCoupon } from "../controller/adminController/couponCtrl";

const userRoute: Router = Router();

userRoute.get("/userLogin", getLogin);
userRoute.get("/userLogout", isLoggedIn, getUserLogout);

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
  getSingleProduct
);
userRoute.get("/resendotp", resendOtp);
userRoute.get("/userProfile", isLoggedIn, userProfile);
userRoute.get("/address", checkBlocked, showAddress);
userRoute.get("/addaddress", checkBlocked, addAddress);
userRoute.get("/editaddress/:id", checkBlocked, editAddress);
userRoute.get("/successpage", checkBlocked, successPage);
userRoute.get("/orders", checkBlocked, ordersList);
userRoute.get("/orderinformation/:id", checkBlocked, orderInfo);
userRoute.get("/wishlist", getWishlist);
userRoute.get("/wallet", isLoggedIn, wallet, refferalLinkGenerating);
userRoute.get("/refferalLink", isLoggedIn, refferalLinkGenerating);
userRoute.get("/search", searchProduct);

userRoute.post("/placeorder", placeOrder);
userRoute.post("/cancelOrder", cancelOrder);
userRoute.post(
  "/userLogin",
  isLoggedout,
  userloginValidation,
  validateUserlogin,
  postLogin
);
userRoute.post("/registerValue", userRegister);
userRoute.post(
  "/otpSend",
  userRegistrationValidation,
  validateUserRegistration,
  otpSend
);
userRoute.post("/addTocart", addToCart);
userRoute.post("/updateQuantity", updateQuantity);
userRoute.post("/getUpdatedTotalAmount/:productId", reloadTotalAmount);
userRoute.post("/addAddressss", addAddressss);
userRoute.post("/addToWishlist", addToWishlist);
userRoute.post("/returnOrder", returnOrder);
userRoute.post("/verifyrazorpay", orderRazorpayVerification);
userRoute.post("/addTowallet", addToWallet);
userRoute.post("/walletRazorpay", walletRazorpayVerification);
userRoute.post("/api/checkCoupon", checkCoupon);
userRoute.post("/removeCoupon", removeCoupon);


userRoute.patch("/removeFromCart", removeProductFromCart);


userRoute.delete("/deleteaddress/:id", deleteAddress);
userRoute.delete("/removeFromWishlist/:id", removeFromWishlist);


userRoute.put("/updateaddress", updateAddress);


export default userRoute;
