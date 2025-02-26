import express from "express";
import protectroute from "../middleware/protectroute.js";
import { createpost , deletepost,createcommand,likeunlike ,getallpost,getlikedpost,getfollowingposts,getuserpost} from "../controller/post.controller.js";

const router = express.Router()

router.get('/getallpost',protectroute,getallpost)
router.post("/createpost",protectroute,createpost)
router.delete("/deletepost/:id",protectroute,deletepost)
router.post("/createcommend/:id",protectroute,createcommand)
router.post("/likeunlike/:id",protectroute,likeunlike)
router.get("/getlikedpost/:id",protectroute,getlikedpost);
router.get("/getfollowingposts",protectroute,getfollowingposts)
router.get("/getuserpost/:username",protectroute,getuserpost)
export default router;