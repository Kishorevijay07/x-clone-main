import Post from "./Post";
import PostSkeleton from "../skeletons/PostSkeleton.js";
import { baseUrl } from "../../urls/Constant.js";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

const Posts = ({feedType , username , userId}) => {

	const getpostendpoint = () =>{
		switch(feedType){
			case "forYou":
				return `${baseUrl}/api/posts/getallpost`
			case "following":
				return `${baseUrl}/api/posts/getfollowingposts`
			case "posts":
				return `${baseUrl}/api/posts/getuserpost/${username}`
			case "likes":
				return `${baseUrl}/api/posts/getlikedpost/${userId}`
			default:
				return `${baseUrl}/api/posts/getallpost`
		}
	}
	const methodpointend = getpostendpoint();
	
	const {data:posts,isLoading,refetch,isRefetching} = useQuery({
		queryKey : ["posts"],
		queryFn : async()=>{
			try {
				const res = await fetch(methodpointend,{
					method : "GET",
					credentials : "include",
					headers : {
						"Content-Type" : "application/json"
					}
				})
				const data =await res.json();
		
				if(!res.ok){
					throw new Error(data.error || "Something went Wrong")
				}
				return data;
				
			} catch (error) {
				throw error;				
			}
		}
	})
	useEffect(()=>{  
		refetch();
	},[feedType,refetch,username]);

	return (
		<>
			{(isLoading || isRefetching )&& (
				<div className='flex flex-col justify-center'>
					<PostSkeleton />
					<PostSkeleton />
					<PostSkeleton />
				</div>
			)}
			{!isLoading && posts?.length === 0 && <p className='text-center my-4'>No posts in this tab. Switch 👻</p>}
			{!isLoading && posts && (
				<div>

					{posts.map((post) => (
						<Post key={post._id} post={post} />
					))}
				</div>
			)}
		</>
	);
};
export default Posts;