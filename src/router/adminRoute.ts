import { Router } from "express";
import { adminRegister, getAdminlogin, getAdminlogout, getDashboard, isAdmin } from "../controller/adminController/dashboardCtrl";
import { adminLoginValidation, checkAdmin, validateadminRegistration } from "../middleware/adminAuth";
import { categoryValidation, editcategoryValidation, editvalidateCategory, validateCategory } from "../middleware/categoryAuth";
import { adminLoggedIn } from "../middleware/sessionAuth";
import { addCategory, editCategory, getCategory, getCategorySearch, listCategory, unlistCategory } from "../controller/adminController/categoryCtrl";
import { addProduct, deleteImage, deleteProduct, getEditproduct, getProducts, getaddProduct, getunlistedProduct, restoreProduct, updateProduct } from "../controller/adminController/productCtrl";
import { blockUser, getUsers, unblockUser} from "../controller/adminController/userCtrl";
import { adminOrder, updateOrder} from "../controller/adminController/orderCtrl";
import { addCoupon, adminAddCoupon, adminCoupon, adminDeletedCoupon, adminEditCoupon, deleteCoupon, updateCoupon } from "../controller/adminController/couponCtrl";
import { addCategoryOffer, offer } from "../controller/adminController/offerCtrl";


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
adminRoute.get("/adminOffer",adminLoggedIn, offer);
adminRoute.get("/addCategoryOffer",adminLoggedIn, addCategoryOffer);



adminRoute.post("/adminlogin", adminLoginValidation, validateadminRegistration, isAdmin);
adminRoute.post("/adminRegister", adminRegister);
adminRoute.post("/addcategory", categoryValidation, validateCategory, addCategory);
adminRoute.post("/addProduct",checkAdmin, addProduct)
adminRoute.post("/deleteproduct",checkAdmin, deleteProduct);
adminRoute.post("/restoreproduct",checkAdmin, restoreProduct);
adminRoute.post('/getCategorySearch',checkAdmin, getCategorySearch);
adminRoute.post("/updateOrderStatus",checkAdmin, updateOrder)
adminRoute.post('/addCoupon', addCoupon)



adminRoute.patch("/listCategory", listCategory);
adminRoute.patch("/unlistCategory", unlistCategory);
adminRoute.patch("/editcategory", editcategoryValidation, editvalidateCategory, editCategory);
adminRoute.patch("/updateCoupon/:id", updateCoupon);


adminRoute.put("/updateproduct/:id", updateProduct);


adminRoute.delete("/deleteimage/:id/:productid", deleteImage)
adminRoute.delete("/deleteCoupon/:id", deleteCoupon)


export default adminRoute;