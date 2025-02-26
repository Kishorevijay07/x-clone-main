import { FaRegComment } from "react-icons/fa";
import { BiRepost } from "react-icons/bi";
import { FaRegHeart } from "react-icons/fa";
import { FaRegBookmark } from "react-icons/fa6";
import { FaTrash } from "react-icons/fa";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { baseUrl } from "../../urls/Constant";
import LoadingSpinner from "./LoadingSpinner";
import { useMutation } from "@tanstack/react-query";
import toast from 'react-hot-toast';
import { formatPostDate } from "../../utils/data/index";

const Post = ({ post }) => {
	const [comment, setComment] = useState("");
	const postOwner = post.user;
	const queryClient = useQueryClient();
	const {data:authUser} = useQuery({queryKey : ["authUser"]})
	const {mutate:deletepost , isPending:isDeleting} = useMutation({
		mutationFn : async () => {
			try {
				console.log(post._id)
				const res = await fetch(`${baseUrl}/api/posts/deletepost/${post._id}`,{
					method:"DELETE",
					credentials : "include",
					headers : {
						"Content-Type" : "application/json"
					}
				})
				const data = await res.json();
				if(!res.ok){
					throw new Error(data.error || "Something went Wrong")
				}
				return data;
			} catch (error) {
				throw error;
			}
		},
		onSuccess : ()=>{
			toast.success("Deleted Successfully");
			queryClient.invalidateQueries({
				queryKey:["posts"]
			})
		},
	})
	const isMyPost = authUser._id === post.user._id;
	
	const formattedDate = formatPostDate(post.createdAt);
	const isLiked = post.like.includes(authUser._id);
	//const isCommenting = false;

	const {mutate:commentpost , isPending : isCommenting} = useMutation({
		mutationFn : async () =>{
			try {
				const res = await fetch(`${baseUrl}/api/posts//createcommend/${post._id}`,{
					method : "POST",
					credentials : "include",
					headers : {
						"Content-Type":"application/json",
						"Accept" : "application/json"
					},

					body:JSON.stringify({text : comment})
				})
				const data = await res.json();
				if(!res.ok){
					throw new Error(data.error || "Something went Wrong")
				}			
				return data;	
			} catch (error) {
				throw error;
			}
		},
		onSuccess : () =>{
			toast.success("Comment posted")
			setComment('')
			queryClient.invalidateQueries({
				queryKey : ["posts"]
			})
		}
	});

	const handleDeletePost = () => {
		deletepost();
	};

	const handlePostComment = (e) => {
		e.preventDefault();
		if (isCommenting) return ;
		commentpost();
	};
	

	const {mutate : likepost , isPending : isLiking} = useMutation({
		mutationFn : async () =>{
			try {
				const res = await fetch(`${baseUrl}/api/posts/likeunlike/${post._id}`,{
					method:"POST",
					credentials : "include",
					headers : {
						"Content-Type" : "application/json"
					}
				})
				const data = await res.json();
				console.log(data)
				if(!res.ok){
					throw new Error(data.error || "Something went Wrong")
				}
				return data;
			} catch (error) {
				throw error;
			}
		},
		onSuccess : (updatedlike) =>{
			toast.success("u like the pzost ")
			// queryClient.invalidateQueries({
			// 	queryKey:["posts"]
			// })
			//instead we use anoher method 
			queryClient.setQueryData(["posts"],(oldData)=>{
				return oldData.map((irukapost)=>{
					if(irukapost._id === post._id){  //post = current post 
						return {...irukapost ,like:updatedlike}
					}
					return irukapost;
				})
			})
		},
		onError : (error) =>{
			toast.error(error.message)
		}
	});
	const handleLikePost = () => {
		if(isLiking) return;
		likepost();
	};
	return (
		<>
			<div className='flex gap-2 items-start p-4 border-b border-gray-700'>
				<div className='avatar'>
					<Link to={`/profile/${postOwner.username}`} className='w-8 rounded-full overflow-hidden'>
						<img src={postOwner.profileimg || "/avatar-placeholder.png"} />
					</Link>
				</div>
				<div className='flex flex-col flex-1'>
					<div className='flex gap-2 items-center'>
						<Link to={`/profile/${postOwner.username}`} className='font-bold'>
							{postOwner.fullName}
						</Link>
						<span className='text-gray-700 flex gap-1 text-sm'>
							<Link to={`/profile/${postOwner.username}`}>@{postOwner.username}</Link>
							<span>·</span>
							<span>{formattedDate}</span>
						</span>
						{isMyPost && (
							<span className='flex justify-end flex-1'>
								{!isDeleting && (
									<FaTrash className='cursor-pointer hover:text-red-500' onClick={handleDeletePost} />
								)}
								{isDeleting && (
									<LoadingSpinner size="sm" />
								)}
							</span>
						)}
					</div>
					<div className='flex flex-col gap-3 overflow-hidden'>
						<span>{post.text}</span>
						{post.img && (
							<img
								src={post.img}
								className='h-80 object-contain rounded-lg border border-gray-700'
								alt=''
							/>
						)}
					</div>
					<div className='flex justify-between mt-3'>
						<div className='flex gap-4 items-center w-2/3 justify-between'>
							<div
								className='flex gap-1 items-center cursor-pointer group'
								onClick={() => document.getElementById("comments_modal" + post._id).showModal()}
							>
								<FaRegComment className='w-4 h-4  text-slate-500 group-hover:text-sky-400' />
								<span className='text-sm text-slate-500 group-hover:text-sky-400'>
									{post.comments.length}
								</span>
							</div>
							{/* We're using Modal Component from DaisyUI */}
							<dialog id={`comments_modal${post._id}`} className='modal border-none outline-none'>
								<div className='modal-box rounded border border-gray-600'>
									<h3 className='font-bold text-lg mb-4'>COMMENTS</h3>
									<div className='flex flex-col gap-3 max-h-60 overflow-auto'>
										{post.comments.length === 0 && (
											<p className='text-sm text-slate-500'>
												No comments yet 🤔 Be the first one 😉
											</p>
										)}
										{post.comments.map((comment) => (
											<div key={comment._id} className='flex gap-2 items-start'>
												<div className='avatar'>
													<div className='w-8 rounded-full'>
														<img
															src={comment.user.profileimg || "/avatar-placeholder.png"}
														/>
													</div>
												</div>
												<div className='flex flex-col'>
													<div className='flex items-center gap-1'>
														<span className='font-bold'>{comment.user.fullName}</span>
														<span className='text-gray-700 text-sm'>
															@{comment.user.username}
														</span>
													</div>
													<div className='text-sm'>{comment.text}</div>
												</div>
											</div>
										))}
									</div>
									<form
										className='flex gap-2 items-center mt-4 border-t border-gray-600 pt-2'
										onSubmit={handlePostComment}
									>
										<textarea
											className='textarea w-full p-1 rounded text-md resize-none border focus:outline-none  border-gray-800'
											placeholder='Add a comment...'
											value={comment}
											onChange={(e) => setComment(e.target.value)}
										/>
										<button className='btn btn-primary rounded-full btn-sm text-white px-4'>
											{isCommenting ? (
												<span className='loading loading-spinner loading-md'></span>
											) : (
												"Post"
											)}
										</button>
									</form>
								</div>
								<form method='dialog' className='modal-backdrop'>
									<button className='outline-none'>close</button>
								</form>
							</dialog>
							<div className='flex gap-1 items-center group cursor-pointer'>
								<BiRepost className='w-6 h-6  text-slate-500 group-hover:text-green-500' />
								<span className='text-sm text-slate-500 group-hover:text-green-500'>0</span>
							</div>
							<div className='flex gap-1 items-center group cursor-pointer' onClick={handleLikePost}>
								{isLiking && <LoadingSpinner size="sm"/>}
								{!isLiked && !isLiking && (
									<FaRegHeart className='w-4 h-4 cursor-pointer text-slate-500 group-hover:text-pink-500' />
								)}
								{isLiked && !isLiking && (<FaRegHeart className='w-4 h-4 cursor-pointer text-pink-500 ' />)}

								<span
									className={`text-sm  group-hover:text-pink-500 ${
										isLiked ? "text-pink-500" : "text-slate-500" 
									}`}
								>
									{post.like.length}
								</span>
							</div>
						</div>
						<div className='flex w-1/3 justify-end gap-2 items-center'>
							<FaRegBookmark className='w-4 h-4 text-slate-500 cursor-pointer' />
						</div>
					</div>
				</div>
			</div>
		</>
	);
};
export default Post;
