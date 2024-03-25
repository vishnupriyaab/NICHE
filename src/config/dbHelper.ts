import { isObjectIdOrHexString } from "mongoose";
import categoryDb from "../model/categoryModel";
import productDb from "../model/productModel";
import userDb from "../model/userModel";
import CouponDb from "../model/couponModel";

export async function getAllUsers(page = 1) {
  try {
    const skip = Number(page) ? Number(page) - 1 : 0;
    const agg = [
      {
        $skip: 10 * skip,
      },
      {
        $limit: 10,
      },
    ];
    return await userDb.aggregate(agg);
  } catch (err) {
    throw err;
  }
}


export async function getListedProducts(status = false, page = 1) {
  try {
    const skip = Number(page) ? Number(page) - 1 : 0;
    // flase to return all listed product and true to return all unlisted product
    const agg = [
      {
        $match: {
          isHidden: status,
        },
      },
      {
        $skip: 10 * skip,
      },
      {
        $limit: 10,
      },
      {
        $lookup: {
          from: "categorydb", // Assuming the name of the category collection is "categories"
          localField: "category", // Field in the current collection
          foreignField: "_id", // Field in the referenced collection
          as: "category" // Output array field
        }
      }
    ]
    return await productDb.aggregate(agg);
  } catch (err) {
    throw err;
  }
}



export async function getListedAllCategories(
  isHidden = false,
  page = 1,
  categoryId = null
) {
  try {
    //for single category for updation
    if (categoryId) {
      return await categoryDb.findOne({ _id: categoryId });
    }
    const skip = Number(page) ? Number(page) - 1 : 0;
    // if(search){
    //     return await Categorydb.find({isHidden}).skip((skip * 10)).limit(10);
    // }
    // if(forSelectBox){
    //     return await Categorydb.find({isHidden});
    // }
    return await categoryDb.find({ isHidden })
      .skip(skip * 10)
      .limit(10);
  } catch (err) {
    throw err;
  }
}


interface AggregationStage {
  $unwind: string;
  $lookup?: {
    from: string;
    localField: string;
    foreignField: string;
    as: string;
  };
  $skip?: number;
  $limit?: number;
}


export async function getAllCoupon(couponId: string | null = null, page?: number | null) {
  try {
    const skip = Number(page) ? Number(page) - 1 : 0;
    // for updation of coupon we need details of the particular coupon
    if (couponId) {
      if (!isObjectIdOrHexString(couponId)) {
        return null;
      }
      return await CouponDb.findOne({ _id: couponId,isDeleted:false });
    }
    return await CouponDb.find({isDeleted:false})
      .skip(10 * skip)
      .limit(10);
  } catch (err) {
    throw err;
  }
}

export async function getAllDeletedCoupons(couponId = null, page = null) {
  try {
    const skip = Number(page) ? Number(page) - 1 : 0;
    // for updation of coupon we need details of the particular coupon
    if (couponId) {
      if (!isObjectIdOrHexString(couponId)) {
        return null;
      }
      return await CouponDb.findOne({ _id: couponId,isDeleted:true });
    }
    return await CouponDb.find({isDeleted:true})
      .skip(10 * skip)
      .limit(10);
  } catch (err) {
    throw err;
  }
}