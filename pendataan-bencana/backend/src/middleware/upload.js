import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure storage
const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
        try {
            const uploadDir = path.join(__dirname, '../../uploads/disasters');
            await fs.mkdir(uploadDir, { recursive: true });
            cb(null, uploadDir);
        } catch (error) {
            cb(error);
        }
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, `disaster-${uniqueSuffix}${ext}`);
    }
});

// File filter
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only JPEG, JPG, PNG, and WebP images are allowed.'), false);
    }
};

// Configure multer
const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB default
        files: 5 // Maximum 5 files per request
    }
});

// Process uploaded images (resize, compress, create thumbnails)
const processImages = async (req, res, next) => {
    if (!req.files || req.files.length === 0) {
        return next();
    }

    try {
        const processedFiles = [];

        for (const file of req.files) {
            const originalPath = file.path;
            const filename = file.filename;
            const nameWithoutExt = path.parse(filename).name;
            const ext = path.extname(filename);

            // Paths for processed images
            const mainImagePath = path.join(file.destination, `${nameWithoutExt}${ext}`);
            const thumbnailPath = path.join(file.destination, `${nameWithoutExt}-thumb${ext}`);

            try {
                // Process main image (resize to max 1200px width, maintain aspect ratio)
                await sharp(originalPath)
                    .resize(1200, null, {
                        withoutEnlargement: true,
                        fit: 'inside'
                    })
                    .jpeg({ quality: 80, progressive: true })
                    .toFile(mainImagePath);

                // Create thumbnail (300px width)
                await sharp(originalPath)
                    .resize(300, null, {
                        withoutEnlargement: true,
                        fit: 'inside'
                    })
                    .jpeg({ quality: 70, progressive: true })
                    .toFile(thumbnailPath);

                // Get image metadata
                const metadata = await sharp(mainImagePath).metadata();

                // Create file info object
                const fileInfo = {
                    id: nameWithoutExt,
                    original_name: file.originalname,
                    filename: `${nameWithoutExt}${ext}`,
                    thumbnail_filename: `${nameWithoutExt}-thumb${ext}`,
                    path: mainImagePath,
                    thumbnail_path: thumbnailPath,
                    size: (await fs.stat(mainImagePath)).size,
                    thumbnail_size: (await fs.stat(thumbnailPath)).size,
                    width: metadata.width,
                    height: metadata.height,
                    mime_type: file.mimetype,
                    uploaded_at: new Date().toISOString()
                };

                processedFiles.push(fileInfo);

                // Remove original file
                await fs.unlink(originalPath);

            } catch (processError) {
                console.error(`Error processing image ${filename}:`, processError);
                // Clean up original file if processing failed
                try {
                    await fs.unlink(originalPath);
                } catch (cleanupError) {
                    console.error(`Error cleaning up file ${originalPath}:`, cleanupError);
                }
                throw new Error(`Failed to process image: ${file.originalname}`);
            }
        }

        // Add processed files info to request
        req.processedFiles = processedFiles;
        next();

    } catch (error) {
        console.error('Image processing error:', error);

        // Clean up any uploaded files if processing fails
        if (req.files) {
            for (const file of req.files) {
                try {
                    await fs.unlink(file.path);
                } catch (cleanupError) {
                    console.error(`Error cleaning up file ${file.path}:`, cleanupError);
                }
            }
        }

        res.status(500).json({
            success: false,
            message: 'Failed to process uploaded images',
            code: 'IMAGE_PROCESSING_ERROR',
            error: error.message
        });
    }
};

// Middleware to handle single image upload
const uploadSingleImage = upload.single('image');

// Middleware to handle multiple images upload
const uploadMultipleImages = upload.array('images', 5);

// Validation middleware for image upload
const validateImageUpload = (req, res, next) => {
    // Check if any files were uploaded
    if (!req.file && !req.files) {
        return res.status(400).json({
            success: false,
            message: 'No image files uploaded',
            code: 'NO_FILES_UPLOADED'
        });
    }

    // For multiple images upload, check if files array has content
    if (req.files && req.files.length === 0) {
        return res.status(400).json({
            success: false,
            message: 'No valid image files uploaded',
            code: 'NO_VALID_FILES'
        });
    }

    next();
};

// Clean up old images (can be called by a cron job)
const cleanupOldImages = async (daysOld = 30) => {
    try {
        const uploadDir = path.join(__dirname, '../../uploads/disasters');
        const files = await fs.readdir(uploadDir);
        const cutoffTime = Date.now() - (daysOld * 24 * 60 * 60 * 1000);

        for (const file of files) {
            const filePath = path.join(uploadDir, file);
            const stats = await fs.stat(filePath);

            if (stats.mtime.getTime() < cutoffTime) {
                await fs.unlink(filePath);
                console.log(`Deleted old image: ${file}`);
            }
        }
    } catch (error) {
        console.error('Error cleaning up old images:', error);
    }
};

// Get image URL helper
const getImageUrl = (filename, isThumbnail = false) => {
    const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 3001}`;
    const imageFilename = isThumbnail && filename.includes('.')
        ? filename.replace('.', '-thumb.')
        : filename;

    return `${baseUrl}/uploads/disasters/${imageFilename}`;
};

// Delete image files
const deleteImageFiles = async (imageInfo) => {
    try {
        if (imageInfo.path) {
            await fs.unlink(imageInfo.path);
        }
        if (imageInfo.thumbnail_path) {
            await fs.unlink(imageInfo.thumbnail_path);
        }
        console.log(`Deleted image files for: ${imageInfo.filename}`);
    } catch (error) {
        console.error(`Error deleting image files: ${error.message}`);
    }
};

export {
    upload,
    uploadSingleImage,
    uploadMultipleImages,
    processImages,
    validateImageUpload,
    cleanupOldImages,
    getImageUrl,
    deleteImageFiles
};