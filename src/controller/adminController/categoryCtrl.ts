import { Request, Response } from "express";
import categoryDb from "../../model/categoryModel";
import { getListedAllCategories } from "../../config/dbHelper";
import Offerdb from "../../model/offerModel";
import productDb from "../../model/productModel";

export async function getCategory(req: Request, res: Response) {
  try {
    const currentDate = new Date();
    const offers = await Offerdb.find({
      expiryDate: { $gte: currentDate },
      isActive: true,
    });

    const selectedCat = req.query.filter || "ALL";
    const allCategories = await categoryDb.find();
    const page: number | undefined =
      typeof req.query.page === "string" ? parseInt(req.query.page) : undefined;
    const category = await getListedAllCategories(false, page);
    const totalCategories = allCategories.length;
    res.render("admin/category", {
      allCategories,
      selectedCat,
      category,
      totalCategories,
      currentPage: Number(req.query.page),
      offers,
    });
  } catch (error: any) {
    console.error(error);
  }
}

export async function addCategory(req: Request, res: Response) {
  try {
    const { name } = req.body;
    console.log(name);
    const cname = name.toUpperCase().trim();

    const alreadyExisted = await categoryDb.findOne({ name: cname });

    if (alreadyExisted) {
      res.send("Already Existed");
    } else {
      const newCategory = new categoryDb({
        name: cname,
      });
      await newCategory.save();
      res.send("success");
    }
  } catch (error) {
    console.log(error);
  }
}

export async function editCategory(req: Request, res: Response) {
  try {
    const { name, id } = req.body;
    const cname = name.toUpperCase().trim();

    const alreadyExisted = await categoryDb.findOne({ name: cname });
    if (alreadyExisted) {
      res.send("Already Existed");
    } else {
      await categoryDb.updateOne({ _id: id }, { $set: { name: cname } });
      res.send("success");
    }
  } catch (error) {
    console.log(error);
  }
}

export async function listCategory(req: Request, res: Response) {
  try {
    console.log("zsdfghjkl");

    const data = await categoryDb.findOneAndUpdate(
      { _id: req.body.id },
      { $set: { unlistStatus: false } }
    );
    console.log(data, "dataaaa");

    if (data) {
      res.status(200).json({ status: true });
    } else {
      res.status(401).json({
        message: "Invalid Id",
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
}

export async function unlistCategory(req: Request, res: Response) {
  try {
    console.log("sdfghjk");

    const data = await categoryDb.findOneAndUpdate(
      { _id: req.body.id },
      { $set: { unlistStatus: true } }
    );
    console.log(data, "data22");

    if (data) {
      res.status(200).json({ status: true });
      console.log("wertyuio");
    } else {
      res.status(401).json({
        message: "Invalid Id",
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
}

export async function getCategorySearch(req: Request, res: Response) {
  try {
    const payLoad = req.body.payLoad.trim();
    let search = await categoryDb.find({
      name: { $regex: new RegExp("^" + payLoad + ".*", "i") },
    });
    search = search.slice(0, 10);
    res.status(200).json({ payLoad: search });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
}

export async function categoryOfferControl(req: Request, res: Response) {
  try {
    const currentDate = new Date();
    const offerDetails = await Offerdb.find({
      expiryDate: { $gte: currentDate },
    });

    res.status(200).json({ success: true, offerDetails });
  } catch (error) {
    console.log("offerDetailsError", error);
  }
}

export async function offerApplyCategory(req: Request, res: Response) {
  try {
    const { offerName, categoryId } = req.body;
    // console.log(req.body, "req.body");

    const categoryData = await categoryDb.findById(categoryId);
    // console.log(categoryData, "categoryData");

    if (!categoryData) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }
    // console.log("ONEEEEEE");

    const offer = await Offerdb.findOne({ offerName: offerName });
    // console.log(offer, "offer");

    if (!offer) {
      return res
        .status(404)
        .json({ success: false, message: "Offer not found" });
    }
    // console.log("Twooooooo");

    const offerAlreadyApplied = categoryData.offer.some(
      (offerId) => offerId.toString() === offer._id.toString()
    );
    // console.log(offerAlreadyApplied, "offerAlreadyApplied");

    if (offerAlreadyApplied) {
      return res.json({ success: true, message: "Offer already applied" });
    } else {
      // console.log("Threeeeeeeee");

      const products = await productDb.find({ category: categoryId });
      // console.log(products,"products");

      await categoryDb.updateOne(
        { _id: categoryId },
        { $push: { offer: offer._id }, offerApplied: true }
      );
      // console.log("Fourrrrrrrrrrrrr");
      for (const product of products) {
        const productDetails = await productDb.findByIdAndUpdate(
          { _id: product._id },
          {
            $push: { offer: offer._id },
            $set: {
              offerApplied: true,
              offerPrice:
                product.price -
                (product.price * offer.discountPercentage) / 100,
            },
          },
          { new: true } // Return updated document
        );
        if (!productDetails) {
          return res
            .status(404)
            .json({ success: false, message: "Product not found" });
        }
        await productDetails.save();
      }
    }
    return res.json({ success: true, message: "Offer applied successfully" });
  } catch (error) {
    console.log("offerDetailsError", error);
    return res.status(500).json({
      success: false,
      message: "There was an error encountered while applying the offer.",
    });
  }
}

export async function offerRemoveCategory(req: Request, res: Response) {
  try {
    const { offerName, categoryId } = req.body;
    console.log("bodyData", req.body);
    const categoryData = await categoryDb.findById(categoryId);
    console.log("category", categoryData);
    if (!categoryData) {
      res.status(404).json({ success: false, message: "Category not found" });
      return;
    }
    const offer = await Offerdb.findOne({ offerName: offerName });
    const offerAlreadyApplied = categoryData.offer.some(
      (offerId) => offerId.toString() === offerId._id.toString()
    );
    if (offerAlreadyApplied) {
      const products = await productDb.find({ category: categoryId });
      categoryData.offerApplied = false;
      categoryData.offer = [];
      await categoryData.save();

      products.forEach(async (product) => {
        product.offerApplied = false;
        product.offer = [];
        product.offerPrice = 0;
        await product.save();
      });
      res.json({ success: true, message: "Offer removed successfully" });
    } else {
      res.json({ success: false, message: "Offer not exist" });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "There was an error encountered while removing the offer.",
    });
  }
}
