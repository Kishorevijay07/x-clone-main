import express from "express"
import { signup,login,logout,getme} from "../controller/auth.contoller.js";
import protectroute from '../middleware/protectroute.js';
const router = express.Router();

router.post('/signup',signup)
router.post('/login',login)
router.post('/logout',logout)
router.get('/me',protectroute,getme)

export default router;