import { Router } from "express";
import { adminRegister, getAdminlogin, getAdminlogout, getDashboard, isAdmin } from "../controller/adminController/dashboardCtrl";
import { adminLoginValidation, checkAdmin, validateadminRegistration } from "../middleware/adminAuth";
import { categoryValidation, editcategoryValidation, editvalidateCategory, validateCategory } from "../middleware/categoryAuth";
import { adminLoggedIn } from "../middleware/sessionAuth";
import { addCategory,  categoryOfferControl,  editCategory, getCategory, getCategorySearch, listCategory, offerApplyCategory, offerRemoveCategory, unlistCategory } from "../controller/adminController/categoryCtrl";
import { addProduct, deleteImage, deleteProduct, getEditproduct, getProducts, getaddProduct, getunlistedProduct, offerApplyProduct, offerRemoveProduct, productOfferListing, restoreProduct, updateProduct } from "../controller/adminController/productCtrl";
import { blockUser, getUsers, unblockUser} from "../controller/adminController/userCtrl";
import { adminOrder, updateOrder} from "../controller/adminController/orderCtrl";
import { addCoupon, adminAddCoupon, adminCoupon, adminDeletedCoupon, adminEditCoupon, deleteCoupon, updateCoupon } from "../controller/adminController/couponCtrl";
import { addOffer, createOffer, deleteOffer, editOffer, getEditoffer, getOffer, offerChangeStatus } from "../controller/adminController/offerCtrl";


const adminRoute: Router = Router();


adminRoute.get("/dashboard", adminLoggedIn, getDashboard);
adminRoute.get("/users", adminLoggedIn, getUsers);
adminRoute.get("/category", adminLoggedIn, getCategory);
adminRoute.get("/products", adminLoggedIn, getProducts);
adminRoute.get("/adminlogin", checkAdmin, getAdminlogin);
adminRoute.get("/adminlogout", getAdminlogout);
adminRoute.get("/addProduct", adminLoggedIn, getaddProduct);
adminRoute.get("/unlistedProduct", adminLoggedIn, getunlistedProduct);
adminRoute.get("/editProduct/:id", adminLoggedIn, getEditproduct);
adminRoute.get("/blockuser", adminLoggedIn, blockUser);
adminRoute.get("/unblockuser", adminLoggedIn, unblockUser);
adminRoute.get("/adminOrder",adminLoggedIn, adminOrder);
adminRoute.get("/adminCoupon",adminLoggedIn, adminCoupon );
adminRoute.get("/adminAddCoupon",adminLoggedIn, adminAddCoupon );
adminRoute.get("/editCoupon/:id",adminLoggedIn, adminEditCoupon);
adminRoute.get("/adminDeletedCoupons",adminLoggedIn, adminDeletedCoupon);
adminRoute.get("/offerList",adminLoggedIn, getOffer);
adminRoute.get("/addOffers",adminLoggedIn, addOffer);
adminRoute.get("/editOffer",getEditoffer);



adminRoute.post("/adminlogin", adminLoginValidation, validateadminRegistration, isAdmin);
adminRoute.post("/adminRegister", adminRegister);
adminRoute.post("/addcategory", categoryValidation, validateCategory, addCategory);
adminRoute.post("/addProduct", addProduct)
adminRoute.post("/deleteproduct",deleteProduct);
adminRoute.post("/restoreproduct", restoreProduct);
adminRoute.post('/getCategorySearch', getCategorySearch);
adminRoute.post("/updateOrderStatus", updateOrder)
adminRoute.post('/addCoupon', addCoupon);
adminRoute.post('/addOffers', createOffer);
adminRoute.post('/editOffer', editOffer);
adminRoute.post('/changeStatus', offerChangeStatus);


adminRoute.post('/categoryOfferListing', categoryOfferControl);
adminRoute.post('/applyOfferToCategory', offerApplyCategory);
adminRoute.post('/removeOfferCategory', offerRemoveCategory);



adminRoute.post('/productOfferListing', productOfferListing);
adminRoute.post('/applyOfferToProduct', offerApplyProduct);
adminRoute.post('/removeOfferProduct', offerRemoveProduct);





adminRoute.patch("/listCategory", listCategory);
adminRoute.patch("/unlistCategory", unlistCategory);
adminRoute.patch("/editcategory", editcategoryValidation, editvalidateCategory, editCategory);
adminRoute.patch("/updateCoupon/:id", updateCoupon);


adminRoute.put("/updateproduct/:id", updateProduct);


adminRoute.delete("/deleteimage/:id/:productid", deleteImage);
adminRoute.delete("/deleteCoupon/:id", deleteCoupon);
adminRoute.delete("/deleteProduct/:id", deleteProduct);
adminRoute.delete('/deleteOffer', deleteOffer);



export default adminRoute;