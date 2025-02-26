import express from "express";
import protectroute from "../middleware/protectroute.js";
import {getNotification,deleteNotification} from './../controller/notification.controller.js'

const router = express.Router();

router.get('/',protectroute,getNotification)
router.delete('/',protectroute,deleteNotification)


export default router;