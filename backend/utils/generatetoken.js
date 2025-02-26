import JWt from "jsonwebtoken";

const generatetoken = (user_id,res)=>{
    const token = JWt.sign({user_id},
        process.env.secret_code,
        {expiresIn:"15d"}
    );

    res.cookie("jwt",token,{
        maxAge:15*60*24*1000,
        sameSite:"strict",
        httpOnly : true,
        secure:process.env.NODE_ENV!=="development"
    })

    
}
export default generatetoken;