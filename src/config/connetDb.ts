import mongoose from "mongoose";
const url = process.env.DATABASE_URL || "mongodb://localhost:27017/NIHCE_Backup"

function connectionDB(){
    mongoose.set('strictQuery',true);
    mongoose
    .connect(url)
    .then(()=>console.log("database connected", url))
    .catch((error)=>console.error(error));
}
export default connectionDB;