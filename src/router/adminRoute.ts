import { Router } from "express";
import { addCategory, addproduct, adminRegister, blockuser, deleteImage, deleteProduct, editCategory, getAdminlogin, getAdminlogout, getCategory, getCategorySearch, getDashboard, getEditproduct, getProducts, getUsers, getaddProduct, getunlistedProduct, isAdmin, listCategory, restoreProduct, unblockuser, unlistCategory, updateproduct } from "../controller/adminController";
import { adminLoginValidation, checkAdmin, validateadminRegistration } from "../middleware/adminAuth";
import { categoryValidation, editcategoryValidation, editvalidateCategory, validateCategory } from "../middleware/categoryAuth";
import { adminLoggedIn } from "../middleware/sessionAuth";

    
const adminRoute:Router = Router();
adminRoute.get("/dashboard", adminLoggedIn, getDashboard);
adminRoute.get("/users", adminLoggedIn, getUsers);
adminRoute.get("/category", adminLoggedIn, getCategory); 
adminRoute.get("/products",adminLoggedIn, getProducts);
adminRoute.get("/adminlogin",checkAdmin, getAdminlogin);
adminRoute.get("/adminlogout",getAdminlogout);
adminRoute.get("/addProduct",adminLoggedIn, getaddProduct);
adminRoute.get("/unlistedProduct",adminLoggedIn, getunlistedProduct);
adminRoute.get("/editProduct/:id",adminLoggedIn, getEditproduct);
adminRoute.get("/blockuser",adminLoggedIn, blockuser);
adminRoute.get("/unblockuser",adminLoggedIn, unblockuser);


adminRoute.post("/adminlogin",adminLoginValidation,validateadminRegistration,isAdmin);
adminRoute.post("/adminRegister",adminRegister);
adminRoute.post("/addcategory",categoryValidation,validateCategory,addCategory);
adminRoute.post("/addProduct",addproduct)
adminRoute.post("/deleteproduct",deleteProduct);
adminRoute.post("/restoreproduct",restoreProduct);
adminRoute.post('/getCategorySearch', getCategorySearch);

adminRoute.patch("/listCategory", listCategory);
adminRoute.patch("/unlistCategory", unlistCategory);
adminRoute.patch("/editcategory",editcategoryValidation,editvalidateCategory, editCategory);


adminRoute.put("/updateproduct/:id", updateproduct);


adminRoute.delete("/deleteimage/:id/:productid", deleteImage)


export default adminRoute;