import Notification from "../model/user.notification.js";
export const  getNotification = async(req,res)=>{
    try {
        const userid = req.user._id;
        const notification = await Notification.find({to:userid}).populate({
                            path: "from",
                            select : "username profileimg"
                        })
    await Notification.updateMany({to:userid},{read:true})
    res.status(200).json(notification)
        
    } catch (error) {
        console.log(`error occured ${error.message}`)
        res.status(500).json({error : "internal server error"})   
    }
}
export const deleteNotification= async(req,res)=>{
    try {
    const userid = req.user._id;
    
    await Notification.deleteMany({to:userid})
    res.status(200).json({message:"Notification delete Successfully"})     
    } catch (error) {
        console.log(`error occured ${error.message}`)
        res.status(500).json({error : "internal server error"})
    }
} 
