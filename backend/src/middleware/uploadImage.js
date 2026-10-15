const multer = require("multer");

const allowedMimeTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const upload = multer({
  storage: multer.memoryStorage(),

  limits: {
    fileSize: 5 * 1024 * 1024, 
    files: 1,
  },

  fileFilter: (req, file, callback) => {
    if (!allowedMimeTypes.has(file.mimetype)) {
      const error = new Error(
        "Only JPG, PNG, and WEBP images are allowed."
      );

      error.statusCode = 400;
      return callback(error);
    }

    callback(null, true);
  },
});

// Handle Multer errors without returning a generic server error.
const handleImageUpload = (req, res, next) => {
  upload.single("image")(req, res, (error) => {
    if (!error) {
      return next();
    }

    if (error instanceof multer.MulterError) {
      if (error.code === "LIMIT_FILE_SIZE") {
        return res.status(413).json({
          success: false,
          message: "Image size must not exceed 5 MB.",
        });
      }

      return res.status(400).json({
        success: false,
        message: "The image upload request is invalid.",
      });
    }

    return res.status(error.statusCode || 400).json({
      success: false,
      message: error.message || "Image upload failed.",
    });
  });
};

module.exports = handleImageUpload;
