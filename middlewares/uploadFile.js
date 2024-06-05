import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { cloudinaryv2 } from "../config/cloudinary.js";

// Configure Multer storage with Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinaryv2,
  params: {
    folder: "grab-products",
    format: async (req, file) => {
      const extension = file.originalname.split(".").pop().toLowerCase();
      switch (extension) {
        case "jpg":
        case "jpeg":
          return "jpg";
        case "png":
          return "png";
        case "gif":
          return "gif";
        case "webp":
          return "webp";
        default:
          // Fallback to 'png' if the extension is not recognized
          return "png";
      }
    },
    public_id: (req, file) => `${Date.now()}-${file.originalname}`,
  },
});

// Initialize Multer with the Cloudinary storage
const upload = multer({ storage: storage });
export default upload;
// Route for handling multiple image uploads
// app.post('/upload', upload.array('images', 10), (req, res) => {
//   if (!req.files || req.files.length === 0) {
//     return res.status(400).json({ message: 'No images were uploaded.' });
//   }

//   const imageUrls = req.files.map(file => file.path);

//   // Process the uploaded images as needed
//   console.log('Uploaded images:', imageUrls);

//   res.status(200).json({ message: 'Images uploaded successfully.', images: imageUrls });
// });

// app.listen(3000, () => {
//   console.log('Server is running on port 3000');
// });
