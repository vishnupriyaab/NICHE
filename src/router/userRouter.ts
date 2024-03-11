import { NextFunction, Router } from "express";
import {checkBlocked,userRegistrationValidation,userloginValidation,validateUserRegistration,validateUserlogin,} from "../middleware/userAuth";
import { getsingleProduct } from "../controller/userController/productCtrl";
import {_404page,addAddressss,contact,deleteaddress,getHome,getLogin,getShop,getuserLogout,otpSnd,postLogin,resendOtp,testimonial,updateaddress,userProfile,userRegister,} from "../controller/userController/userCtrl";
import { isLoggedIn, isLoggedout } from "../middleware/sessionAuth";
import { addTocart, cart, reloadTotalAmount, removeproductfromcart, updatequantity } from "../controller/userController/cartCtrl";
import { addaddress, cancelOrder, checkaddress, checkout,  editaddress,  orderinfo,  orderslist,  placeorder,  returnOrder,  showaddress, successpage } from "../controller/userController/orderCtrl";
import { addToWishlist, removeFromWishlist, wishlist } from "../controller/userController/wishlishctrl";

const userRoute: Router = Router();

userRoute.get("/userLogin", getLogin);
userRoute.get("/userLogout", isLoggedIn, getuserLogout);

userRoute.get("/", getHome);
userRoute.get("/shop", getShop);
userRoute.get("/cart",isLoggedIn,checkBlocked, cart);
userRoute.get("/checkout", checkout);
userRoute.get("/checkaddress", checkaddress);
userRoute.get("/testimonial", testimonial);
userRoute.get("/_404page", _404page);
userRoute.get("/contact", contact);
userRoute.get("/singleProductpage/:id",isLoggedIn,checkBlocked,getsingleProduct);
userRoute.get("/resendotp", resendOtp);
userRoute.get("/userProfile", isLoggedIn, userProfile);
userRoute.get("/address",checkBlocked, showaddress);
userRoute.get("/addaddress",checkBlocked, addaddress);
userRoute.get("/editaddress/:id",checkBlocked, editaddress);
userRoute.get("/successpage", checkBlocked, successpage);
userRoute.get("/orders",checkBlocked, orderslist);
userRoute.get("/orderinformation/:id",checkBlocked, orderinfo);
// userRoute.get("/products", productlist);
userRoute.get("/wishlist", wishlist);


userRoute.post("/placeorder",placeorder);
userRoute.post("/cancelOrder",cancelOrder);
userRoute.post("/userLogin",isLoggedout,userloginValidation,validateUserlogin,postLogin);
userRoute.post("/registerValue", isLoggedout, userRegister);
userRoute.post("/otpSend",userRegistrationValidation,validateUserRegistration,otpSnd);
userRoute.post("/addTocart", addTocart);
userRoute.post("/updateQuantity", updatequantity);
userRoute.post("/getUpdatedTotalAmount/:productId", reloadTotalAmount);
userRoute.post("/addAddressss",  addAddressss);
userRoute.post("/addToWishlist", addToWishlist);
userRoute.post('/returnOrder',returnOrder)
userRoute.patch("/removeFromCart", removeproductfromcart);

userRoute.delete("/deleteaddress/:id",deleteaddress)
userRoute.delete("/removeFromWishlist/:id", removeFromWishlist)

userRoute.put("/updateaddress", updateaddress)



export default userRoute;
