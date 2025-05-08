import Notification from "../models/notification.model.js";
import Post from "../models/post.model.js";
import User from "../models/user.model.js";
import { v2 as cloudinary } from "cloudinary";

// CREATE POST
export const createPost = async (req, res) => {
	try {
		const { text, sos, location } = req.body;
		const userId = req.user._id.toString();
		const user = await User.findById(userId);

		if (!user) return res.status(404).json({ message: "User not found" });
		if (!text && !req.file) {
			return res.status(400).json({ error: "Post must have text or image" });
		}

		let imageUrl = null;
		let publicId = null;

		if (req.file) {
			// Upload image buffer to Cloudinary
			const result = await new Promise((resolve, reject) => {
				const uploadStream = cloudinary.uploader.upload_stream(
					{ resource_type: "auto" },
					(error, result) => {
						if (error) reject(error);
						else resolve(result);
					}
				);
				uploadStream.end(req.file.buffer);
			});

			imageUrl = result.secure_url;
			publicId = result.public_id;
		}

		const newPost = new Post({
			user: userId,
			text,
			img: imageUrl,
			imgPublicId: publicId,
			sos,
			location,
		});

		await newPost.save();
		res.status(201).json(newPost);
	} catch (error) {
		console.log("Error in createPost controller: ", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

// DELETE POST
export const deletePost = async (req, res) => {
	try {
		const post = await Post.findById(req.params.id);
		if (!post) return res.status(404).json({ error: "Post not found" });

		if (post.user.toString() !== req.user._id.toString()) {
			return res.status(401).json({ error: "Not authorized to delete this post" });
		}

		if (post.imgPublicId) {
			await cloudinary.uploader.destroy(post.imgPublicId);
		}

		await Post.findByIdAndDelete(req.params.id);
		res.status(200).json({ message: "Post deleted successfully" });
	} catch (error) {
		console.log("Error in deletePost controller: ", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

// COMMENT ON POST
export const commentOnPost = async (req, res) => {
	try {
		const { text } = req.body;
		const postId = req.params.id;
		const userId = req.user._id;

		if (!text) return res.status(400).json({ error: "Text field is required" });

		const post = await Post.findById(postId);
		if (!post) return res.status(404).json({ error: "Post not found" });

		const comment = { user: userId, text };
		post.comments.push(comment);
		await post.save();

		res.status(200).json(post);
	} catch (error) {
		console.log("Error in commentOnPost controller: ", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

// LIKE / UNLIKE POST
export const likeUnlikePost = async (req, res) => {
	try {
		const userId = req.user._id;
		const { id: postId } = req.params;

		const post = await Post.findById(postId);
		if (!post) return res.status(404).json({ error: "Post not found" });

		const alreadyLiked = post.likes.includes(userId);

		if (alreadyLiked) {
			await Post.updateOne({ _id: postId }, { $pull: { likes: userId } });
			await User.updateOne({ _id: userId }, { $pull: { likedPosts: postId } });

			const updatedLikes = post.likes.filter(id => id.toString() !== userId.toString());
			res.status(200).json(updatedLikes);
		} else {
			post.likes.push(userId);
			await post.save();
			await User.updateOne({ _id: userId }, { $push: { likedPosts: postId } });

			const notification = new Notification({
				from: userId,
				to: post.user,
				type: "like",
			});
			await notification.save();

			res.status(200).json(post.likes);
		}
	} catch (error) {
		console.log("Error in likeUnlikePost controller: ", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

// GET ALL POSTS
export const getAllPosts = async (req, res) => {
	try {
		const posts = await Post.find()
			.sort({ createdAt: -1 })
			.populate("user", "-password")
			.populate("comments.user", "-password");

		res.status(200).json(posts);
	} catch (error) {
		console.log("Error in getAllPosts controller: ", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

// GET LIKED POSTS
export const getLikedPosts = async (req, res) => {
	const userId = req.params.id;

	try {
		const user = await User.findById(userId);
		if (!user) return res.status(404).json({ error: "User not found" });

		const likedPosts = await Post.find({ _id: { $in: user.likedPosts } })
			.populate("user", "-password")
			.populate("comments.user", "-password");

		res.status(200).json(likedPosts);
	} catch (error) {
		console.log("Error in getLikedPosts controller: ", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

// GET FOLLOWING POSTS
export const getFollowingPosts = async (req, res) => {
	try {
		const userId = req.user._id;
		const user = await User.findById(userId);
		if (!user) return res.status(404).json({ error: "User not found" });

		const following = user.following;

		const posts = await Post.find({ user: { $in: following } })
			.sort({ createdAt: -1 })
			.populate("user", "-password")
			.populate("comments.user", "-password");

		res.status(200).json(posts);
	} catch (error) {
		console.log("Error in getFollowingPosts controller: ", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

// GET POSTS OF A USER
export const getUserPosts = async (req, res) => {
	try {
		const { username } = req.params;

		const user = await User.findOne({ username });
		if (!user) return res.status(404).json({ error: "User not found" });

		const posts = await Post.find({ user: user._id })
			.sort({ createdAt: -1 })
			.populate("user", "-password")
			.populate("comments.user", "-password");

		res.status(200).json(posts);
	} catch (error) {
		console.log("Error in getUserPosts controller: ", error);
		res.status(500).json({ error: "Internal server error" });
	}
};