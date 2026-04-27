import { Router } from "express";
import * as Services from "./Services/users.service.js";
import { authenticationMiddleware } from "../../Middlewares/authentication.middleware.js";

const userController = Router();

userController.post("/signup", Services.SignupService);
userController.post("/login", Services.LoginService);
userController.patch("", authenticationMiddleware, Services.UpdateService);
userController.delete("", authenticationMiddleware, Services.DeleteService);
userController.get("", authenticationMiddleware, Services.GetUserDataService);

export default userController;
