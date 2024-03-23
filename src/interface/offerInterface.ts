interface IOffer extends Document {
  offerName: string;
  offerDescription: string;
  discountPercentage: number;
  startingDate: Date;
  expiryDate: Date;
  isActive: boolean;
  }

  export default IOffer