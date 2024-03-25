import categoryDb from "../../model/categoryModel";
import Offerdb from "../../model/offerModel";
import { Request, Response } from "express";

export async function getOffer(req: Request, res: Response) {
  try {
    const offerData = await Offerdb.find();
    res.render("admin/offerList", { offerData });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
}

export async function addOffer(req: Request, res: Response) {
  try {
    const offer = await Offerdb.find();
    res.render("admin/addOffers", { offer });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
}


export async function createOffer(req: Request, res: Response): Promise<void> {
  try {
    const { title, percentage, startDate, endDate, description } = req.body;

    const numericChecking = /^\d+$/;
    const titleChecking = /^[a-zA-Z]+(\s+[a-zA-Z]+)*$/;
    const descriptionWords = description.split(/\s+/);

    console.log(req.body, "createOffersssss");
    if (!title || !percentage || !startDate || !endDate || !description) {
      res
        .status(200)
        .json({ success: false, message: "All fields are required." });
      return;
    }

    if (!titleChecking.test(title)) {
      res.status(200).json({
        status: false,
        message:
          "Title must contain only letters and be at least 4 characters long.",
      });
      return ;
    }

    if (!numericChecking.test(percentage)) {
      res.status(200).json({
        success: false,
        message:
          "Coupon code must be exactly 6 characters long and can only contain alphabets and numbers.",
      });
      return ;
    }

    if (descriptionWords.length < 2 || descriptionWords.length > 15) {
      res.status(200).json({
        success: false,
        message: "Description must contain between 2 and 15 words.",
      });
      return ;
    }

    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    if (new Date(startDate) < currentDate) {
       res.status(200).json({
        success: false,
        message: "The expiry date must not be earlier than today.",
      });
      return ;
    }

    const existingOffer = await Offerdb.findOne({ offerName: title });
    if (existingOffer) {
       res
        .status(200)
        .json({ success: false, message: "Offer already exist." });
        return ;
    }

    const newOffer = new Offerdb({
      offerName: title,
      discountPercentage: percentage,
      startingDate: new Date(startDate),
      expiryDate: new Date(endDate),
      offerDescription: description,
      isActive: true,
    });

    const savedOffer = await newOffer.save();
    //console.log("savedcoupon", savedOffer);

    res.status(201).json({
      success: true,
      message: "Offer added successfully.",
      data: savedOffer,
    });

  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
}


export async function getEditoffer(req: Request, res: Response) {
  try {
    console.log("asdfghjk");
    
    const offerId = req.query.id
    console.log(offerId,"offerIddddddd");
    
    const offer = await Offerdb.findById(offerId);
    console.log(
      "offer",offer
    );
    
    res.render("admin/editOffer", { offer });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
}

export async function editOffer(req:Request,res:Response):Promise<void> {
  try {
    const { title, percentage, startDate, endDate, description } = req.body;
     console.log("couponBodyData", startDate, endDate);
     const numericRegex = /^\d+$/; // Adjust this regex if you want to allow alphabets as well
     const titleRegex = /^[a-zA-Z]+(\s+[a-zA-Z]+)*$/;
 
     if (!title || !percentage || !startDate || !endDate || !description) {
        res
         .status(200)
         .json({ success: false, message: "All fields are required." });
         return ;

     }
 
     if (!titleRegex.test(title)) {
        res.status(200).json({
         status: false,
         message: "Title must contain only letters and at least 4 characters",
       });
       return ;
     }
 
     if (!numericRegex.test(percentage)) {
        res.status(200).json({
         success: false,
         message: "Percentage must be valid numbers.",
       });
       return ;
     }
 
     const descriptionWords = description.split(/\s+/);
     if (descriptionWords.length < 2 || descriptionWords.length > 15) {
        res.status(200).json({
         success: false,
         message: "Description must contain between 2 and 15 words.",
       });
       return ;
     }
 
     const currentDate = new Date();
     currentDate.setHours(0, 0, 0, 0);
     if (new Date(startDate) < currentDate) {
        res.status(200).json({
         success: false,
         message: "The start and expiry date must not be earlier than today.",
       });
       return ;
     }
 
     const existingOffer = await Offerdb.findOne({ offerName: title });
     if (existingOffer) {
       const hasChanges = existingOffer.discountPercentage !== percentage ||
                           existingOffer.startingDate.toISOString() !== new Date(startDate).toISOString() ||
                           existingOffer.expiryDate.toISOString() !== new Date(endDate).toISOString() ||
                           existingOffer.offerDescription !== description;
 
       if (hasChanges) {
         existingOffer.discountPercentage = percentage;
         existingOffer.startingDate = new Date(startDate);
         existingOffer.expiryDate = new Date(endDate);
         existingOffer.offerDescription = description;
         existingOffer.isActive = true;
 
         const updatedOffer = await existingOffer.save();
 
          res.status(200).json({
           success: true,
           message: "Offer updated successfully.",
           data: updatedOffer,
         });
         return;
       } else {
          res.status(200).json({
           success: false,
           message: "No changes detected. Please make some changes to update the offer.",
         });
         return;
       }
     } else {
        res.status(200).json({
         success: false,
         message: "Offer not found. Please check the offer name.",
       });
       return;
     }
  } catch (error) {
    console.error("Error editing offer:", error);
     res.status(500).json({
       success: false,
       message: "An error occurred while editing the offer.",
     });
  }
}

 
export async function deleteOffer(req: Request, res: Response) {
  try {
    
    const { offerId } = req.body;
    await Offerdb.findByIdAndDelete(offerId);
     res
      .status(200)
      .json({ success: true, message: "Coupon successfully Deleted" });
      return ;
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
}


export async function offerChangeStatus(req:Request,res:Response):Promise<void>{

  try {
    const { offerId, status } = req.body;
    //console.log(req.body);
    const offerID = { _id: offerId };
    const offer = await Offerdb.findOne(offerID);
    if (!offer) {
       res
        .status(404)
        .json({ success: false, message: "Coupon not found" });
        return;
    }
    const update = { isActive: status === "enable" ? true : false };

   await Offerdb.findOneAndUpdate(offerID, update, { new: true });
    res
      .status(200)
      .json({ success: true, message: "Status changed successfully" });
    
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
}
