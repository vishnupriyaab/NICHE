import { Request, Response, json } from "express";
import productDb from "../../model/productModel";
import categoryDb from "../../model/categoryModel";
import cloudinaryUploadImage from "../../config/cloudinary";
import { Product } from "../../interface/productInterface";
import { getListedProducts } from "../../config/dbHelper";
import userDb from "../../model/userModel";
import Offerdb from "../../model/offerModel";
import Orderdb from "../../model/orderModel";



export async function getProducts(req: Request, res: Response) {
  try {
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    const product: Product[] = await productDb
      .find()
      .sort({ createdAt: -1 })
      .populate('category')
      .populate('offer')
      .limit(limit)
      .skip(skip);

    const totalProducts = await productDb.countDocuments();

    res.render('admin/products', {
      product,
      totalProducts,
      currentPage: page,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
}
export async function getEditProduct(req: Request, res: Response) {
  try {
    const product = await productDb.findOne({ _id: req.params.id }).populate('category');
    const category = await categoryDb.find();
    res.status(200).render("admin/editProduct", { product, category});
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
}

export async function getUnlistedProduct(req: Request, res: Response) {
  try {
    const product = await productDb.find().populate("category");
    res.render("admin/unlistedProduct", { product });
  } catch (error: any) {
    console.error(error);
  }
}

export async function updateProduct(req: Request, res: Response) {
  try {
    let { productname, description, price, stock, imgArr, category, color, size } = req.body;
    const categoryname = await categoryDb.findOne({ name: { $regex: new RegExp(category, 'i') }},{_id: 1});

    const url = await cloudinaryUploadImage(imgArr);
    await productDb.updateOne(
      { _id: req.params.id },
      {
        $set: {
          productname,
          description,
          price,
          stock,
          color,
          size,
          category: categoryname?._id,
        },
      }
    );

    await productDb.updateOne(
      { _id: req.params.id },
      { $set: { imgArr: url } },
      { upsert: true }
    );

    res.status(200).send(true);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
}

export async function gettingProduct(req:Request,res:Response) {
  try {
    const productDetails = await productDb.findById(req.params.productId, {imgArr: 1, _id: 0})
    res.status(200).json({
      success: true,
      imgArr: productDetails?.imgArr
    });
  } catch (error) {
    console.log(error);
    res.json("Internal Srver Error")
  }  
}

export async function deleteImage(req: Request, res: Response) {
  try {
    const imagePublicId = req.params.id;
    console.log(imagePublicId);

    const { productid } = req.params;
    console.log(req.params);

    const data = await productDb.updateOne(
      { _id: productid },
      {
        $unset: {
          [`imgArr.${Number(imagePublicId)}`]: 1,
        },
      }
    );
    await productDb.findOneAndUpdate(
      { _id: productid },
      {
        $pull: {
          imgArr: null,
        },
      }
    );

    res.status(200).send(true);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error deleting image reference");
  }
}

export async function getAddProduct(req: Request, res: Response) {
  try {
    const category = await categoryDb.find({ unlistStatus: true });
    res.render("admin/addProductChange", { category });
  } catch (error: any) {
    res.status(500).send("Internal Server Error");
  }
}

export async function addProduct(req: Request, res: Response) {
  try {
    let { name, description, price, stock, imgArr, category, color, size } = req.body;
    // console.log(color, size,"qwertyuiop");

    const catID = await categoryDb.findById(category);

    const url = await cloudinaryUploadImage(imgArr);
    // console.log(url);
    const newCat = new productDb({
      name,
      description,
      price,
      color,
      size,
      stock,
      imgArr: url,
      category: catID,
    });
    const saved = await newCat.save();
    if (saved) {
      res.status(201).json({ message: "Product Added" });
      return;
    }
    res.status(500).send("Internal Server Error");
    return;
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
    return;
  }
}

export async function deleteProduct(
  req: Request,
  res: Response
): Promise<Response<any, Record<string, any>> | undefined> {
  try {
    const productId = req.params.id.trim(); // Trim any leading/trailing spaces
    // const alreadyOrdered = await Orderdb.find()
    const data = await productDb.findByIdAndUpdate(productId, {
      $set: { isHidden: true },
    });
    
    if(data){
      return res.status(201).json({message: "we can't "})
    }
    // console.log(data);
    return res.status(201).json({ message: "Product Deleted" });
  } catch (error) {
    console.error("Error deleting coupon:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

export async function restoreProduct(req: Request, res: Response) {
  try {
    const data = await productDb.updateOne(
      { _id: req.body.id },
      { $set: { isHidden: false } }
    );

    if (data) res.status(200).send(true);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
}

export async function productOfferListing(req: Request, res: Response) {
  try {
    const currentData = new Date();
    const offerDetails = await Offerdb.find({
      expiryDate: { $gte: currentData },
    });
    //console.log("sdvsdv", offerDetails);
    res.status(200).json({ success: true, offerDetails });
  } catch (error) {
    res.json({ success: true, message: "Offer already applied" });
    return;
  }
}

export async function offerApplyProduct(req: Request, res: Response) {
  try {
    const { offerName, productId } = req.body;
    const productData = await productDb.findById(productId);
    if (!productData) {
      res.status(404).json({ success: false, message: "Product not found" });
      return;
    }
    const productPrice = productData.price;

    const offer = await Offerdb.findOne({ offerName: offerName });

    if (!offer) {
      res.status(404).json({ success: false, message: "offer not found" });
      return;
    }

    const offerAlreadyApplied = productData.offer.some(
      (offerId) => offerId.toString() === offerId.toString()
    );
    if (offerAlreadyApplied) {
      res.json({ success: true, message: "Offer already applied" });
      return;
    }

    const offerDiscount = offer.discountPercentage;
    const discountAmount = (productPrice * offerDiscount) / 100;
    productData.offerPrice = productPrice - discountAmount;
    productData.offerApplied = true;
    const sample = await productDb.updateOne(
      { _id: productId },
      { $push: { offer: offer }, offerApplied: true }
    );
    await productData.save();
    res.json({ success: true, message: "Offer applied successfully" });
  } catch (error) {
    console.log("offerDetailsError", error);
    res
    .status(500)
    .json({
      success: false,
      message: "There was an error encountered while applying the offer.",
    });
  }
}


export async function offerRemoveProduct(req:Request,res:Response) {
  try {
    const { offerName, productId } = req.body;
    const productData = await productDb.findById(productId);
    if (!productData) {
      res.status(404).json({ success: false, message: "productData not found" });
      return;
    }
    const offer = await Offerdb.findOne({ offerName: offerName });
    const offerAlreadyApplied = productData.offer.some(
      (offerId) => offerId.toString() === offerId.toString()
      );
    if(offerAlreadyApplied || !offer){
      productData.offerPrice = 0;
    productData.offerApplied = false;
    productData.offer = [];
    await productData.save();
    res.json({ success: true, message: "Offer removed successfully" });
    } else {
      res.json({ success: false, message: "Offer not exist" });
    }
    
  } catch (error) {
    console.log("offerDetailsError", error);
    res
    .status(500)
    .json({
      success: false,
      message: "There was an error encountered while removing the offer.",
    });
  }
}