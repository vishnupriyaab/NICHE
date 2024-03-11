import { Router } from "express";
import { adminRegister, getAdminlogin, getAdminlogout, getDashboard, isAdmin } from "../controller/adminController/dashboardCtrl";
import { adminLoginValidation, checkAdmin, validateadminRegistration } from "../middleware/adminAuth";
import { categoryValidation, editcategoryValidation, editvalidateCategory, validateCategory } from "../middleware/categoryAuth";
import { adminLoggedIn } from "../middleware/sessionAuth";
import { addCategory, editCategory, getCategory, getCategorySearch, listCategory, unlistCategory } from "../controller/adminController/categoryCtrl";
import { addProduct, deleteImage, deleteProduct, getEditproduct, getProducts, getaddProduct, getunlistedProduct, restoreProduct, updateProduct } from "../controller/adminController/productCtrl";
import { blockUser, getUsers, unblockUser} from "../controller/adminController/userCtrl";
import { adminOrder, updateOrder} from "../controller/adminController/orderCtrl";


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
adminRoute.get("/adminOrder",adminLoggedIn, adminOrder); // checkAdmin,


adminRoute.post("/adminlogin", adminLoginValidation, validateadminRegistration, isAdmin);
adminRoute.post("/adminRegister", adminRegister);
adminRoute.post("/addcategory", categoryValidation, validateCategory, addCategory);
adminRoute.post("/addProduct", addProduct)
adminRoute.post("/deleteproduct", deleteProduct);
adminRoute.post("/restoreproduct", restoreProduct);
adminRoute.post('/getCategorySearch', getCategorySearch);
adminRoute.post("/updateOrderStatus", updateOrder)


adminRoute.patch("/listCategory", listCategory);
adminRoute.patch("/unlistCategory", unlistCategory);
adminRoute.patch("/editcategory", editcategoryValidation, editvalidateCategory, editCategory);


adminRoute.put("/updateproduct/:id", updateProduct);


adminRoute.delete("/deleteimage/:id/:productid", deleteImage)


export default adminRoute;