import { Router } from "express";
import { adminRegister, getAdminlogin, getAdminlogout, getDashboard, getDetailsChart, isAdmin } from "../controller/adminController/dashboardCtrl";
import { adminLoginValidation, checkAdmin, validateadminRegistration } from "../middleware/adminAuth";
import { categoryValidation, editCategoryValidation, editValidateCategory,validateCategory } from "../middleware/categoryAuth";
import { adminLoggedIn } from "../middleware/sessionAuth";
import { addCategory,  categoryOfferControl,  editCategory, getCategory, getCategorySearch, listCategory, offerApplyCategory, offerRemoveCategory, unlistCategory } from "../controller/adminController/categoryCtrl";
import { addProduct, deleteImage, deleteProduct, getAddProduct, getEditProduct,  getProducts, getUnlistedProduct, gettingProduct, offerApplyProduct, offerRemoveProduct, productOfferListing, restoreProduct, updateProduct } from "../controller/adminController/productCtrl";
import { blockUser, getUsers, unblockUser} from "../controller/adminController/userCtrl";
import { adminOrder, returnAproval, updateOrder} from "../controller/adminController/orderCtrl";
import { addCoupon, adminAddCoupon, adminCoupon, adminDeletedCoupon, adminEditCoupon, deleteCoupon, updateCoupon } from "../controller/adminController/couponCtrl";
import { addOffer, createOffer, deleteOffer, editOffer, getEditoffer, getOffer, offerChangeStatus } from "../controller/adminController/offerCtrl";
import { salesReport, salesReportExcel, salesReportPDF } from "../controller/adminController/salesReportCtrl";


const adminRoute: Router = Router();


adminRoute.get("/dashboard", adminLoggedIn, getDashboard);
adminRoute.get("/salesReport", adminLoggedIn, salesReport);
adminRoute.get("/users", adminLoggedIn, getUsers);
adminRoute.get("/category", adminLoggedIn, getCategory);
adminRoute.get("/products", adminLoggedIn, getProducts);
adminRoute.get("/adminlogin", checkAdmin, getAdminlogin);
adminRoute.get("/adminlogout", getAdminlogout);
adminRoute.get("/addProduct", adminLoggedIn, getAddProduct);
adminRoute.get("/unlistedProduct", adminLoggedIn, getUnlistedProduct);
adminRoute.get("/editProduct/:id", adminLoggedIn, getEditProduct);
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


adminRoute.get("/salesReport",salesReport)
adminRoute.get("/salesReportExcel",salesReportExcel)
adminRoute.get("/salesReportPDF", salesReportPDF);
adminRoute.get("/gettingProduct/:productId",gettingProduct)


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
adminRoute.post('/admin/chartData',getDetailsChart);


adminRoute.post('/categoryOfferListing', categoryOfferControl);
adminRoute.post('/applyOfferToCategory', offerApplyCategory);
adminRoute.post('/removeOfferCategory', offerRemoveCategory);


adminRoute.post('/productOfferListing', productOfferListing);
adminRoute.post('/applyOfferToProduct', offerApplyProduct);
adminRoute.post('/removeOfferProduct', offerRemoveProduct);
adminRoute.post('/returnAproval', returnAproval);


adminRoute.patch("/unlistCategory", unlistCategory);
adminRoute.patch("/listCategory", listCategory);
adminRoute.patch("/editcategory", editCategoryValidation, editValidateCategory, editCategory);
adminRoute.patch("/updateCoupon/:id", updateCoupon);


adminRoute.put("/updateproduct/:id", updateProduct);


adminRoute.delete("/deleteimage/:id/:productid", deleteImage);
adminRoute.delete("/deleteCoupon/:id", deleteCoupon);
adminRoute.delete("/deleteProduct/:id", deleteProduct);
adminRoute.delete('/deleteOffer', deleteOffer);



export default adminRoute;