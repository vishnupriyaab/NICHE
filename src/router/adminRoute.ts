import { Router } from "express";
import { adminRegister, getAdminlogin, getAdminlogout, getDashboard, isAdmin } from "../controller/adminController/dashboardContro";
import { adminLoginValidation, checkAdmin, validateadminRegistration } from "../middleware/adminAuth";
import { categoryValidation, editcategoryValidation, editvalidateCategory, validateCategory } from "../middleware/categoryAuth";
import { adminLoggedIn } from "../middleware/sessionAuth";
import { addCategory, editCategory, getCategory, getCategorySearch, listCategory, unlistCategory } from "../controller/adminController/categoryContro";
import { addproduct, deleteImage, deleteProduct, getEditproduct, getProducts, getaddProduct, getunlistedProduct, restoreProduct, updateproduct } from "../controller/adminController/productContro";
import { blockuser, getUsers, unblockuser } from "../controller/adminController/userContro";


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
adminRoute.get("/blockuser", adminLoggedIn, blockuser);
adminRoute.get("/unblockuser", adminLoggedIn, unblockuser);


adminRoute.post("/adminlogin", adminLoginValidation, validateadminRegistration, isAdmin);
adminRoute.post("/adminRegister", adminRegister);
adminRoute.post("/addcategory", categoryValidation, validateCategory, addCategory);
adminRoute.post("/addProduct", addproduct)
adminRoute.post("/deleteproduct", deleteProduct);
adminRoute.post("/restoreproduct", restoreProduct);
adminRoute.post('/getCategorySearch', getCategorySearch);

adminRoute.patch("/listCategory", listCategory);
adminRoute.patch("/unlistCategory", unlistCategory);
adminRoute.patch("/editcategory", editcategoryValidation, editvalidateCategory, editCategory);


adminRoute.put("/updateproduct/:id", updateproduct);


adminRoute.delete("/deleteimage/:id/:productid", deleteImage)


export default adminRoute;