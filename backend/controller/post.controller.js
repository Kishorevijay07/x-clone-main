import User from "../model/auth.model.js";
import Post from "../model/post.model.js";
import cloudinary from 'cloudinary';
import Notification from "../model/user.notification.js";

export const createpost =async(req,res)=>{
    try {
        
        const {text}=req.body;
        let {img}=req.body;
        const userid = req.user._id.toString()

        const user = await User.findById({_id:userid})

        if(!user){
            res.status(404).json({error:"User not found"})
        }
        if (!text && !img){
            res.status(404).json({error:"text oe img not get from user"})
        }

        if (img){
            const updateresponse = await cloudinary.uploader.upload(img)
            img = updateresponse.secure_url;
        }

        const newpost = new Post({
            user:userid,
            img,
            text
        })
        await newpost.save();
        res.status(200).json(newpost)

    } catch (error) {
        console.log(`error occured in ${error}`)
        res.status(404).json({error:`Geting error in createpost ${error}`})
    }
}
export const deletepost = async (req, res) => {
    try {
        const { id } = req.params;

        // Find the post by ID
        const post = await Post.findById(id); // No need to pass an object here

        // Check if the post exists
        if (!post) {
            return res.status(404).json({ error: "Post not found" });
        }

        // Check if the current user is the owner of the post
        if (post.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ error: "User authentication error" });
        }

        // Check if the post has an associated image
        if (post.img) {
            const imgid = post.img.split("/").pop().split(".")[0];
            await cloudinary.uploader.destroy(imgid);
        }

        // Delete the post
        await Post.findByIdAndDelete(id); // No need to pass an object here

        // Respond with success
        return res.status(200).json({ message: "The post was deleted successfully" });
    } catch (error) {
        console.error(`Error occurred: ${error.message}`);
        return res.status(500).json({ error: "Internal server error" });
    }
};

export const createcommand = async (req, res) => {
    try {
        const { id } = req.params;
        const { text } = req.body;
        const user_id = req.user._id;

        if (!id) {
            return res.status(404).json({ error: "Post ID is required" });
        }
        // Find the post by ID
        const post = await Post.findById({_id:id}); // No need to pass an object here
        console.log(post)
        // Check if the post exists
        if (!post) {
            return res.status(404).json({ error: "Post not found" })
        }

        // Check if text is provided
        if (!text || text.trim() === "") {
            return res.status(404).json({ error: "Text must be provided by the user" });
        }

        // Create a new comment object
        const comment = {
            user: user_id,
            text // Trim to remove unnecessary whitespace
        };

        // Add the comment to the post's comments array
        post.comments.push(comment);
        await post.save();

        // Respond with success
        return res.status(200).json({
            message: "The comment was created successfully",
            comments: post.comments, // Optionally return updated comments
        });
    } catch (error) {
        console.error(`Error occurred: ${error.message}`);
        return res.status(500).json({ error: "Internal server error" })
    }
};
export const likeunlike = async (req, res) => {
    try {
        const {id} = req.params;
        const user_id = req.user?._id;

        // Validate user_id
        if (!user_id) {
            return res.status(401).json({ error: "Unauthorized: User ID is required" });
        }
        console.log(id)
        // Find the post
        const post = await Post.findById(id);
        if (!post) {
            return res.status(404).json({ error: "Post not found" });
        }

        // Check if the user has already liked the post
        const isLiked = post.like.includes(user_id);
        if (isLiked) {
            // Unlike the post
            await Post.findByIdAndUpdate(id, { $pull: { like: user_id } });
            await User.findByIdAndUpdate(user_id, {$pull:{likedposts:id}});

            const updatedlikes = post.like.filter((id)=>id.toString() !== user_id.toString())
            return res.status(200).json(updatedlikes);
        } else {
            // Like the post
            post.like.push(user_id);
            await User.findByIdAndUpdate(user_id, {$push:{likedposts:id}})
            await post.save();

            // Create a notification
            const notification = new Notification({
                from: user_id,
                to: post.user,
                type: "like",
            });
            await notification.save();
            const updatedlikes = post.like;
            return res.status(200).json(updatedlikes);
        }
    } catch (error) {
        console.error(`Error occurred: ${error.message}`);
        return res.status(500).json({ error: "Internal server error" });
    }
};
export const getallpost = async(req,res)=>{
    try {
        const posts = await Post.find().sort({createdAt:-1}).populate({
            path : "user",
            select : "-password"
        }).
        populate({
            path : "comments.user",
            select:["-password","-bio","-link","-email"]
        })
        if(posts.length == 0)
            {
                return res.status(200).json([])
            } 
        res.status(200).json(posts)
        
    } catch (error) {
        console.error(`Error occurred: ${error.message}`);
        return res.status(500).json({ error: "Internal server error" });
    }
}
export const getlikedpost=async(req,res)=>{
    try {
        const user_id = req.params.id;
        const user= await User.findById(user_id)
        if(!user){
            return res.status(404).json({error:"user not found"})
        }
        const likedpost = await Post.find({_id:{$in:user.likedposts}}).populate({
            path:"user",
            select : "-password"
        }).
        populate({
            path:"comments.user",
            select :["-password","-bio","-link","-email"]
        })
        res.status(200).json(likedpost)

    } catch (error) {
        console.error(`Error occurred: ${error.message}`);
        return res.status(500).json({ error: "Internal server error" });
    }
}
import mongoose from "mongoose";
export const getfollowingposts = async (req, res) => {
    try {
        const userid = req.user._id; 
        const user = await User.findById(userid);

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const followedByMe = user.following;
        console.log("Followed Users:", followedByMe);

        // Check if user follows anyone
        if (!followedByMe || followedByMe.length === 0) {
            return res.status(200).json({ message: "No posts from followed users" });
        }

        // Ensure all IDs are ObjectIds
        const followedByMeObjectIds = followedByMe.map(id => new mongoose.Types.ObjectId(id));

        // Fetch posts from followed users
        const feedPosts = await Post.find({ user: { $in: followedByMeObjectIds } })
            .sort({ createdAt: -1 })
            .populate({ path: "user", select: "-password" })
            .populate({ path: "comments.user", select: "-password" });

        console.log("Feed Posts:", feedPosts);

        res.status(200).json(feedPosts);
    } catch (error) {
        console.error(`Error occurred: ${error.message}`);
        return res.status(500).json({ error: "Internal server error" });
    }
}

export const getuserpost  = async(req,res)=>{
    try {

        const {username} = req.params;
        const user = await User.findOne({username })
        if(!user){
            return res.status(404).json({error:"user not found"})
        }
        const feeds = await Post.find({user:user._id}).sort({createdAt:-1})
        .populate({
            path : "user",
            select : "-password"
            })
        .populate({
            path : "comments.user",
            select:"-password"
        })
        res.status(200).json(feeds)
        
    } catch (error) {
        console.error(`Error occurred: ${error.message}`);
        return res.status(500).json({ error: "Internal server error" });
    }
}