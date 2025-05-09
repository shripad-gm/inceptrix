import mongoose from "mongoose";

const adminContentSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        
		originalPost: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Post",
			required: true,
			unique: true, // ensures one-to-one mapping
		},
	},
    { timestamps: true }
);

const AdminContent = mongoose.model("AdminContent", adminContentSchema);
export default AdminContent;