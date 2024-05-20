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

export async function createOffer(req:Request, res:Response) {
  try {
    const { title, percentage, startDate, endDate, description } = req.body;

    const errors:any = {};
    const numericChecking = /^\d+$/;
    const titleChecking = /^[a-zA-Z\s]+$/; // Adjusted to allow spaces between words
    const descriptionWords = description ? description.split(/\s+/) : [];

    // Validate title
    if (!title) {
      errors.title = "Title is required.";
    } else if (!titleChecking.test(title)) {
      errors.title = "Title must contain only letters and spaces.";
    }else if(/^\s*$/.test(title)){
      errors.title = "Title cannot be fully spaces";
    }

    // Validate percentage
    if (!percentage) {
      errors.percentage = "Percentage is required.";
    } else if (!numericChecking.test(percentage)) {
      errors.percentage = "Percentage must be a positive number.";
    }else if(/^\s*$/.test(title)){
      errors.percentage = "Percentage cannot be fully spaces";
    }

    // Validate start date
    const currentDate = new Date();
    if (!startDate) {
      errors.startDate = "Start Date is required.";
    } else if (new Date(startDate) < currentDate) {
      errors.startDate = "Start Date cannot be in the past.";
    }

    // Validate end date
    if (!endDate) {
      errors.endDate = "End Date is required.";
    } else if (new Date(endDate) <= new Date(startDate)) {
      errors.endDate = "End Date must be after the Start Date.";
    }

    // Validate description
    if (!description) {
      errors.description = "Description is required.";
    } else if (descriptionWords.length < 2 || descriptionWords.length > 15) {
      errors.description = "Description must contain between 2 and 15 words.";
    }else if(/^\s*$/.test(title)){
      errors.description = "Description cannot be fully spaces";
    }

    // Check if there are any errors
    if (Object.keys(errors).length > 0) {
      res.status(200).json({ success: false, errors });
      return;
    }

    // Check if the offer already exists
    const existingOffer = await Offerdb.findOne({ offerName: title });
    if (existingOffer) {
      res.status(200).json({ success: false, errors: { title: "Offer already exists." } });
      return;
    }

    // Create a new offer
    const newOffer = new Offerdb({
      offerName: title,
      discountPercentage: percentage,
      startingDate: new Date(startDate),
      expiryDate: new Date(endDate),
      offerDescription: description,
      isActive: true,
    });

    // Save the new offer to the database
    const savedOffer = await newOffer.save();

    // Send a success response
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

// export async function editOffer(req:Request,res:Response):Promise<void> {
//   try {
//     const { title, percentage, startDate, endDate, description } = req.body;
//      console.log("couponBodyData", startDate, endDate);
//      const numericRegex = /^\d+$/; // Adjust this regex if you want to allow alphabets as well
//      const titleRegex = /^[a-zA-Z]+(\s+[a-zA-Z]+)*$/;
 
//      if (!title || !percentage || !startDate || !endDate || !description) {
//         res
//          .status(200)
//          .json({ success: false, message: "All fields are required." });
//          return ;

//      }
 
//      if (!titleRegex.test(title)) {
//         res.status(200).json({
//          status: false,
//          message: "Title must contain only letters and at least 4 characters",
//        });
//        return ;
//      }
 
//      if (!numericRegex.test(percentage)) {
//         res.status(200).json({
//          success: false,
//          message: "Percentage must be valid numbers.",
//        });
//        return ;
//      }
 
//      const descriptionWords = description.split(/\s+/);
//      if (descriptionWords.length < 2 || descriptionWords.length > 15) {
//         res.status(200).json({
//          success: false,
//          message: "Description must contain between 2 and 15 words.",
//        });
//        return ;
//      }
 
//      const currentDate = new Date();
//      currentDate.setHours(0, 0, 0, 0);
//      if (new Date(startDate) < currentDate) {
//         res.status(200).json({
//          success: false,
//          message: "The start and expiry date must not be earlier than today.",
//        });
//        return ;
//      }
 
//      const existingOffer = await Offerdb.findOne({ offerName: title });
//      if (existingOffer) {
//        const hasChanges = existingOffer.discountPercentage !== percentage ||
//                            existingOffer.startingDate.toISOString() !== new Date(startDate).toISOString() ||
//                            existingOffer.expiryDate.toISOString() !== new Date(endDate).toISOString() ||
//                            existingOffer.offerDescription !== description;
 
//        if (hasChanges) {
//          existingOffer.discountPercentage = percentage;
//          existingOffer.startingDate = new Date(startDate);
//          existingOffer.expiryDate = new Date(endDate);
//          existingOffer.offerDescription = description;
//          existingOffer.isActive = true;
 
//          const updatedOffer = await existingOffer.save();
 
//           res.status(200).json({
//            success: true,
//            message: "Offer updated successfully.",
//            data: updatedOffer,
//          });
//          return;
//        } else {
//           res.status(200).json({
//            success: false,
//            message: "No changes detected. Please make some changes to update the offer.",
//          });
//          return;
//        }
//      } else {
//         res.status(200).json({
//          success: false,
//          message: "Offer not found. Please check the offer name.",
//        });
//        return;
//      }
//   } catch (error) {
//     console.error("Error editing offer:", error);
//      res.status(500).json({
//        success: false,
//        message: "An error occurred while editing the offer.",
//      });
//   }
// }



export async function editOffer(req:Request, res:Response) {
  try {
    const { title, percentage, startDate, endDate, description } = req.body;
    const errors:any = {};
    const numericRegex = /^\d+$/;
    const titleRegex = /^[a-zA-Z]+(\s+[a-zA-Z]+)*$/;

    // Validate title
    if (!title) {
      errors.title = "Title is required.";
    } else if (!titleRegex.test(title)) {
      errors.title = "Title must contain only letters and spaces.";
    }

    // Validate percentage
    if (!percentage) {
      errors.percentage = "Percentage is required.";
    } else if (!numericRegex.test(percentage)) {
      errors.percentage = "Percentage must be a valid number.";
    }

    // Validate start date
    const currentDate = new Date();
    if (!startDate) {
      errors.startDate = "Start Date is required.";
    } else if (new Date(startDate) < currentDate) {
      errors.startDate = "Start Date cannot be in the past.";
    }

    // Validate end date
    if (!endDate) {
      errors.endDate = "End Date is required.";
    } else if (new Date(endDate) <= new Date(startDate)) {
      errors.endDate = "End Date must be after the Start Date.";
    }

    // Validate description
    if (!description) {
      errors.description = "Description is required.";
    } else {
      const descriptionWords = description.split(/\s+/);
      if (descriptionWords.length < 2 || descriptionWords.length > 15) {
        errors.description = "Description must contain between 2 and 15 words.";
      }
    }

    // Check if there are any errors
    if (Object.keys(errors).length > 0) {
      res.status(200).json({ success: false, errors });
      return;
    }

    // Check if the offer already exists
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
