require("dotenv").config();
const app = require("./app");
const connectWithDB = require("./config/dbConfig");
const cloudinary = require("cloudinary");
const PORT = process.env.PORT;

// DB configuration
connectWithDB(process.env.MONGODB_URI);

// Cloudinary  configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

app.listen(PORT, (req, res) => {
    console.log(`App listening at http://localhost:${PORT}`);
});
