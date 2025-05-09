import express from "express";
import { pushPopularPostsToAdmin,gettAllAdminPosts } from "../controllers/adminContent.controller.js";
import protectRoute from "../middleware/protectedRoute.js";

const router = express.Router();

router.get("/all", protectRoute,gettAllAdminPosts );
router.post("/pushadmin", protectRoute, pushPopularPostsToAdmin);


export default router;