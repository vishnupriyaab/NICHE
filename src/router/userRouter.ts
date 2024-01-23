import { Router} from "express"
import { getLogin } from "../controller/userController"


const userRoute: Router= Router()

userRoute.get("/userLogin",getLogin)

export default userRoute;