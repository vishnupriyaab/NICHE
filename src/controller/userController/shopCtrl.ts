import { Request, Response } from "express";
import productDb from "../../model/productModel";
import CartDb from "../../model/cartModel";
import categoryDb from "../../model/categoryModel";
import mongoose from "mongoose";

export async function getShop(req: Request, res: Response) {
  try {
    const startingPrice = Number(req.query.startingPrice) || 0;
    const endPrice = Number(req.query.endPrice) || 0;
    const sortingInput: any = req.query.sorting || "default";
    let productSearch: any = "";
    const isFrondEnd = Boolean(req.query.fromFrontEnd);

    let query: any = { unlistStatus: true };

    if (startingPrice && endPrice) {
      query.price = { $gte: startingPrice, $lte: endPrice };
    } else if (startingPrice) {
      query.price = { $gte: startingPrice };
    } else if (endPrice) {
      query.price = { $lte: endPrice };
    } else {
      query.price = { $gte: 0 };
    }
    if (req.query.category) {
      query.category = req.query.category;
    }
    let sorting: any = {};

    switch (sortingInput) {
      case "lowToHigh":
        sorting = { effectivePrice: 1 };
        break;
      case "highToLow":
        sorting = { effectivePrice: -1 };
        break;
      case "newToOld":
        sorting = { createdAt: -1 };
        break;
      case "oldToNew":
        sorting = { createdAt: 1 };
        break;
      default:
        sorting = { createdAt: 1 };
        break;
    }

    const user = req.session.userId;
    const page = parseInt(req.query.page as string) || 1;
    const perProduct = 9;

    const listedCategories = await categoryDb.find({ unlistStatus: true });

    let listedCategoryIds = listedCategories.map(
      (category) => new mongoose.Types.ObjectId(category._id)
    );
    if (query.category) {
      listedCategoryIds = [new mongoose.Types.ObjectId(query.category)];
    }
    const totalProducts = await productDb.countDocuments({
      ...query.category,
      category: { $in: listedCategoryIds },
    });

    const totalPages = Math.ceil(totalProducts / perProduct);
    const match: any = {
      $match: {
        category: { $in: listedCategoryIds },
      },
    }

    const color = req.query.color;

    if(color){
      match.$match.color = color;
    }

    const product = await productDb.aggregate([
      match,
      {
        $lookup: {
          from: "categorydbs",
          localField: "category",
          foreignField: "_id",
          as: "category",
        },
      },
      {
        $lookup: {
          from: "offerdbs",
          localField: "offer",
          foreignField: "_id",
          as: "offer",
        },
      },
      {
        $addFields: {
          effectivePrice: {
            $cond: {
              if: { $gt: ["$offerPrice", null] },
              then: "$offerPrice",
              else: "$price",
            },
          },
        },
      },
      {
        $match: { effectivePrice: query.price },
      },
      {
        $sort: sorting,
      },
      {
        $skip: (page - 1) * perProduct,
      },
      {
        $limit: perProduct,
      },
    ]);
    console.log(product,"productctcttctct");
    
    const cart = await CartDb.findOne({ userId: user }).populate("products");
    const distinctColors = await productDb.distinct("color");
    const uniqueColors = distinctColors.filter(color => color);
    

    if (!isFrondEnd) {
      return res.render("user/shop", {
        user,
        cart,
        product,
        listedCategories,
        totalPages,
        currentPage: page,
        sorting: sortingInput,
        colors: uniqueColors,
      });
    } else {
      return res.status(200).json({
        success: true,
        user,
        cart,
        product,
        listedCategories,
        totalPages,
        currentPage: page,
        sorting: sortingInput,
      });
    }
  } catch (error: any) {
    console.error(error);
  }
}
