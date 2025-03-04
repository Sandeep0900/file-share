require("dotenv").config(); // Load environment variables

const express = require("express");
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;

const app = express();
const PORT = 8080;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

// Configure Multer to use Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "uploads", // Folder name in Cloudinary
    format: async (req, file) => "png", // Convert all files to PNG
    public_id: (req, file) => file.originalname.split(".")[0], // Use original filename
  },
});

const upload = multer({ storage: storage });

// Set EJS as the view engine
app.set("view engine", "ejs");

// Home route to display uploaded files
app.get("/", async (req, res) => {
  try {
    const resources = await cloudinary.api.resources({ type: "upload", prefix: "uploads/" });
    const files = resources.resources.map((file) => ({
      url: file.secure_url,
      filename: file.public_id,
    }));
    res.render("index", { files });
  } catch (error) {
    res.status(500).send("Error fetching files from Cloudinary.");
  }
});

// Upload file route
app.post("/upload", upload.single("file"), (req, res) => {
  res.redirect("/");
});

// Delete file route
app.get("/delete/:filename", async (req, res) => {
  try {
    await cloudinary.uploader.destroy(req.params.filename);
    res.redirect("/");
  } catch (error) {
    res.status(500).send("Error deleting file from Cloudinary.");
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
