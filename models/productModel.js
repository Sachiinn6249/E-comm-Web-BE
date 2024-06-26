import mongoose from "mongoose";
import slugify from "slugify";
const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
  },
  tags: {
    type: [String],
    required: true,
  },
  // specifications: [
  //   {
  //     title: {
  //       type: String,
  //       required: true,
  //     },
  //     description: {
  //       type: String,
  //       required: true,
  //     },
  //   },
  // ],
  price: {
    type: Number,
    required: true,
  },
  images: [
    {
      url: {
        type: String,
        required: true,
      },
      public_id: {
        type: String,
        required: true,
      },
    },
  ],
  brand: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  subcategory: {
    type: String,
    required: true,
  },
  gender: {
    type: String,
    required: true,
    enum: ["Mens", "Womens", "Kids", "Unisex"],
  },
  sizechart: {
    type: [String],
  },
  stock: {
    type: Number,
    required: true,
    maxlength: 4,
    default: 1,
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Seller",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

productSchema.pre("validate", function (next) {
  if (this.isModified("name")) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

export default mongoose.model("Product", productSchema);
