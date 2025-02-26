import User from "../model/auth.model.js";
import Notification from "../model/user.notification.js";
import bcrypt from 'bcryptjs';
import cloudinary from 'cloudinary';

export const getprofile = async(req,res)=>{
    try {
        const {username}=req.params;
        const user = await User.findOne({username})
        if(!user)
        {
            return res.status(500).json({error:"The user not found"})
        }
        res.status(200).json(user)
    } catch (error) {
        console.log(`error occures in ${error}`)
        res.status(500).json({error:`The error Occurs ${error}`})
    }   
}
export const followunfollow =async(req,res)=>{
    try {
        const {id} = req.params;
        const usertomodify = await User.findById({_id:id});
        console.log(usertomodify.username)
        const currentuser = await User.findById({_id : req.user._id})

        if (id===req.user._id)
        {
            return res.status(404).json({error : "User cant follow or un follow"})
        }
        
        if(!usertomodify || !currentuser)
        {
            return res.status(404).json({error:"User not found"})
        }
        const isfollowing = currentuser.following.includes(id)

        if(isfollowing){
            await User.findByIdAndUpdate({_id:id},{$pull:{followers:req.user._id}})
            await User.findByIdAndUpdate({_id:req.user._id},{$pull:{following:id}})  

            res.status(200).json({message:"Unfollow successfully"}) 
        }
        else{
            await User.findByIdAndUpdate({_id:id},{$push:{followers:req.user._id}})
            await User.findByIdAndUpdate({_id:req.user._id},{$push:{following:id}})
            const newnotification = new Notification({
                type:"follow",
                from : req.user._id,
                to : usertomodify._id,
            })
            await newnotification.save() // Notification save in mongo db

            res.status(200).json({message:"Following SucCessfully"})
        }
            
    } catch (error) {
        console.log(`error occures in follow unfollow request ${error}`)
        res.status(500).json({error:`The error Occurs ${error}`})
    }
}

export const suggestedlist = async(req,res)=>{
    try {
        const userid = req.user._id
        const userfollowedbyme = await User.findById({_id : userid}).select('-password')

        const users = await User.aggregate([
            {
                $match :{
                    _id:{$ne : userid}
                }
            },{
                $sample : {size:10}
            }
        ])
        const filltereduser = users.filter((user)=> !userfollowedbyme.following.includes(user._id))

        const suggesteduser = filltereduser.slice(0,4);
        console.log(`user is ${userid}`)
        suggesteduser.forEach((user)=>user.password=null)
        res.status(200).json(suggesteduser)


    } catch (error) {
        console.log(`error occures in follow unfollow request ${error}`)
        res.status(500).json({error:`The error Occurs ${error}`})
    }
}
export const updateuser = async (req, res) => {
    try {
        const userid = req.user._id;
        const { username, fullname, currentpassword, newpassword, email, bio, link } = req.body;
        let { coverimg, profileimg } = req.body;

        let user = await User.findById({ _id: userid });

        if (!user) {
            return res.status(500).json({ error: 'user not found' });
        }

        if ((!currentpassword && newpassword) || (!newpassword && currentpassword)) {
            return res.status(404).json({ error: "Fill the password" });
        }

        if (currentpassword && newpassword) {
            const ismatch = await bcrypt.compare(currentpassword, user.password);
            if (!ismatch) {
                return res.status(500).json({ error: "password not matching" });
            }
            if (newpassword.length < 6) {
                return res.status(404).json({ error: 'password must be 6 letters' });
            }
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(newpassword, salt);
        }

        if (profileimg) {
            if (user.profileimg) {
                const publicId = user.profileimg.split("/").pop().split(".").shift(); // ✅ Extracts correct public ID
                await cloudinary.uploader.destroy(publicId);
            }
            const uploadedResponse = await cloudinary.uploader.upload(profileimg);
            profileimg = uploadedResponse.secure_url;
        }
        
        if (coverimg) {
            if (user.coverimg) {
                const publicId = user.coverimg.split("/").pop().split(".").shift(); // ✅ Extracts correct public ID
                await cloudinary.uploader.destroy(publicId);
            }
            const uploadedResponse = await cloudinary.uploader.upload(coverimg);
            coverimg = uploadedResponse.secure_url;
        }
        
        user.fullname = fullname || user.fullname;
        user.email = email || user.email;
        user.profileimg = profileimg || user.profileimg;
        user.coverimg = coverimg || user.coverimg;
        user.bio = bio || user.bio;
        user.link = link || user.link;

        try {
            user = await user.save();
        } catch (saveError) {
            return res.status(500).json({ error: `Failed to save user: ${saveError.message}` });
        }

        user.password = null; // Do not send the password back
        return res.status(200).json(user)

    } catch (error) {
        console.error(`Error in updating user: ${error}`);
        res.status(500).json({ error: `The error occurs: ${error.message}` });
    }
};

