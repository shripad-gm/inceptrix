import Post from "../models/post.model.js";
import AdminContent from "../models/adminContent.model.js";

export const pushPopularPostsToAdmin = async (req, res) => {
	try {
		// Fetch posts with >10 likes
		const popularPosts = await Post.find({
			likes: { $exists: true, $not: { $size: 0 } },
		});

		const filteredPopular = popularPosts.filter((post) => post.likes.length > 0);

		// Fetch SOS posts separately
		const sosPosts = await Post.find({ sos: true });

		// Merge both sets and deduplicate by _id
		const postMap = new Map();
		[...filteredPopular, ...sosPosts].forEach((post) => {
			postMap.set(post._id.toString(), post); // ensures uniqueness
		});

		const uniquePosts = Array.from(postMap.values());

		const newAdminContents = [];

		for (const post of uniquePosts) {
			const exists = await AdminContent.findOne({ originalPost: post._id });
			if (!exists) {
				const adminEntry = new AdminContent({
					user: post.user,
					originalPost: post._id,
				});
				await adminEntry.save();
				newAdminContents.push(adminEntry);
			}
		}

		res.status(200).json({
			message: "Popular and SOS posts pushed to admin content",
			count: newAdminContents.length,
			data: newAdminContents,
		});
	} catch (error) {
		console.error("Error pushing posts to AdminContent:", error);
		res.status(500).json({ error: "Internal server error" });
	}
};


export const gettAllAdminPosts = async (req, res) => {
    try {
        const adminContent = await AdminContent.find()
            .populate("user", "-password")
            .populate("originalPost");

        if (!adminContent || adminContent.length === 0) {
            return res.status(200).json({ message: "No admin content found" });
        }

        res.status(200).json(adminContent);
    } catch (error) {
        console.error("Error fetching admin content:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};