interface IOffer extends Document {
    name: string;
    description: string;
    discount: number;
    startingDate: Date;
    expiryDate: Date;
    isActive: boolean;
  }

  export default IOffer