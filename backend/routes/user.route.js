import express from "express";
import protectroute from "../middleware/protectroute.js";
import {getprofile,followunfollow,suggestedlist,updateuser} from '../controller/user.controller.js';

const router = express.Router();

router.get('/profile/:username',protectroute,getprofile)
router.post('/followunfollow/:id',protectroute,followunfollow)
router.get('/suggested',protectroute,suggestedlist)
router.post('/updateuser',protectroute,updateuser)
export default router;