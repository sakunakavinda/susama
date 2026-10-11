"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const multer_1 = __importDefault(require("multer"));
const fs_1 = __importDefault(require("fs"));
const db_1 = require("./config/db"); // Initializes DB connection
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5001;
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Serve uploaded static files
const uploadDir = path_1.default.join(__dirname, '../uploads');
if (!fs_1.default.existsSync(uploadDir)) {
    fs_1.default.mkdirSync(uploadDir, { recursive: true });
}
app.use('/uploads', express_1.default.static(uploadDir));
// Multer Setup for Local File Uploads
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path_1.default.extname(file.originalname));
    }
});
const upload = (0, multer_1.default)({ storage });
const categoryRoutes_1 = __importDefault(require("./routes/categoryRoutes"));
const productRoutes_1 = __importDefault(require("./routes/productRoutes"));
// Routes
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'SUSAMA Backend is running!' });
});
// Category API Routes
app.use('/api/categories', categoryRoutes_1.default);
// Product API Routes
app.use('/api/products', productRoutes_1.default);
// Example Product Image Upload Route
app.post('/api/upload', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    // The URL to access the file from the frontend
    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    res.json({
        success: true,
        message: 'File uploaded successfully',
        url: fileUrl
    });
});
// Community & Social Posts API Routes
app.get('/api/social-posts', async (req, res) => {
    try {
        const [rows] = await db_1.pool.query(`SELECT * FROM social_posts WHERE is_active = TRUE ORDER BY sort_order ASC, created_at DESC`);
        res.json({
            success: true,
            data: rows
        });
    }
    catch (error) {
        console.error('Error fetching social posts:', error);
        res.status(500).json({ success: false, message: 'Database error', error: error.message });
    }
});
app.put('/api/social-posts/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { post_url, author, handle, caption, likes_count, comments_count, is_active } = req.body;
        await db_1.pool.query(`UPDATE social_posts SET 
        post_url = COALESCE(?, post_url),
        author = COALESCE(?, author),
        handle = COALESCE(?, handle),
        caption = COALESCE(?, caption),
        likes_count = COALESCE(?, likes_count),
        comments_count = COALESCE(?, comments_count),
        is_active = COALESCE(?, is_active)
       WHERE id = ?`, [post_url, author, handle, caption, likes_count, comments_count, is_active, id]);
        res.json({ success: true, message: 'Social post updated successfully' });
    }
    catch (error) {
        console.error('Error updating social post:', error);
        res.status(500).json({ success: false, message: 'Database error', error: error.message });
    }
});
// Ritual Video Database API Routes
app.get('/api/settings/ritual-video', async (req, res) => {
    try {
        await db_1.pool.query(`
      CREATE TABLE IF NOT EXISTS store_settings (
        id VARCHAR(36) PRIMARY KEY,
        setting_key VARCHAR(100) NOT NULL UNIQUE,
        setting_value TEXT NOT NULL
      )
    `);
        const [rows] = await db_1.pool.query(`SELECT setting_value FROM store_settings WHERE setting_key = 'ritual_video_url' LIMIT 1`);
        let videoUrl = '/ritual-video.mp4';
        if (rows && rows.length > 0 && rows[0].setting_value) {
            videoUrl = rows[0].setting_value;
        }
        const [titleRows] = await db_1.pool.query(`SELECT setting_value FROM store_settings WHERE setting_key = 'ritual_video_title' LIMIT 1`);
        let videoTitle = 'Ceylon Keratin Curl Elixir';
        if (titleRows && titleRows.length > 0 && titleRows[0].setting_value) {
            videoTitle = titleRows[0].setting_value;
        }
        const [descRows] = await db_1.pool.query(`SELECT setting_value FROM store_settings WHERE setting_key = 'ritual_video_description' LIMIT 1`);
        let videoDescription = 'Watch the botanical curl transformation in action and explore real results shared across social media by our growing island community.';
        if (descRows && descRows.length > 0 && descRows[0].setting_value) {
            videoDescription = descRows[0].setting_value;
        }
        const [headingRows] = await db_1.pool.query(`SELECT setting_value FROM store_settings WHERE setting_key = 'ritual_video_heading' LIMIT 1`);
        let videoHeading = 'The Ritual In Motion';
        if (headingRows && headingRows.length > 0 && headingRows[0].setting_value) {
            videoHeading = headingRows[0].setting_value;
        }
        res.json({
            success: true,
            data: {
                video_url: videoUrl,
                video_title: videoTitle,
                heading: videoHeading,
                description: videoDescription
            }
        });
    }
    catch (error) {
        console.error('Error reading ritual video setting:', error);
        res.json({
            success: true,
            data: {
                video_url: '/ritual-video.mp4',
                heading: 'The Ritual In Motion',
                description: 'Watch the botanical curl transformation in action and explore real results shared across social media by our growing island community.'
            }
        });
    }
});
app.post('/api/settings/ritual-video', upload.single('video'), async (req, res) => {
    try {
        await db_1.pool.query(`
      CREATE TABLE IF NOT EXISTS store_settings (
        id VARCHAR(36) PRIMARY KEY,
        setting_key VARCHAR(100) NOT NULL UNIQUE,
        setting_value TEXT NOT NULL
      )
    `);
        let videoUrl = req.body?.video_url;
        if (req.file) {
            videoUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
        }
        if (videoUrl) {
            // Save or update in store_settings table in database
            await db_1.pool.query(`
        INSERT INTO store_settings (id, setting_key, setting_value)
        VALUES (UUID(), 'ritual_video_url', ?)
        ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)
      `, [videoUrl]);
            console.log('✅ Ritual video updated in database:', videoUrl);
        }
        if (req.body?.description) {
            await db_1.pool.query(`
        INSERT INTO store_settings (id, setting_key, setting_value)
        VALUES (UUID(), 'ritual_video_description', ?)
        ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)
      `, [req.body.description]);
        }
        if (req.body?.heading) {
            await db_1.pool.query(`
        INSERT INTO store_settings (id, setting_key, setting_value)
        VALUES (UUID(), 'ritual_video_heading', ?)
        ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)
      `, [req.body.heading]);
        }
        res.json({
            success: true,
            message: 'Ritual video settings successfully saved to database',
            data: {
                video_url: videoUrl,
                description: req.body?.description,
                heading: req.body?.heading
            }
        });
    }
    catch (error) {
        console.error('Error saving ritual video to database:', error);
        res.status(500).json({ success: false, message: 'Database error', error: error.message });
    }
});
app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
