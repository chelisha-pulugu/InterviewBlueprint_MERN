const multer = require("multer")


const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 3 * 1024 * 1024
    },
    fileFilter(_req, file, callback) {
        if (file.mimetype !== "application/pdf" || !file.originalname.toLowerCase().endsWith(".pdf")) {
            const error = new Error("Resume uploads must be PDF files.");
            error.status = 400;
            return callback(error);
        }
        return callback(null, true);
    },
});


module.exports = upload