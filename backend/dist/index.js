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
const productUploadDir = path_1.default.join(uploadDir, 'products');
const categoryUploadDir = path_1.default.join(uploadDir, 'categories');
[uploadDir, productUploadDir, categoryUploadDir].forEach((dir) => {
    if (!fs_1.default.existsSync(dir)) {
        fs_1.default.mkdirSync(dir, { recursive: true });
    }
});
app.use('/uploads', express_1.default.static(uploadDir));
// Multer Setup for Local File Uploads (organized by type)
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        const type = req.query.type || req.body.type;
        if (type === 'category') {
            cb(null, categoryUploadDir);
        }
        else if (type === 'product') {
            cb(null, productUploadDir);
        }
        else {
            cb(null, uploadDir);
        }
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path_1.default.extname(file.originalname).toLowerCase());
    }
});
const upload = (0, multer_1.default)({ storage });
const categoryRoutes_1 = __importDefault(require("./routes/categoryRoutes"));
const productRoutes_1 = __importDefault(require("./routes/productRoutes"));
const reviewRoutes_1 = __importDefault(require("./routes/reviewRoutes"));
const newsletterRoutes_1 = __importDefault(require("./routes/newsletterRoutes"));
const customerAuthRoutes_1 = __importDefault(require("./routes/customerAuthRoutes"));
const orderRoutes_1 = __importDefault(require("./routes/orderRoutes"));
const adminRoutes_1 = __importDefault(require("./routes/adminRoutes"));
const socialScraper_1 = require("./services/socialScraper");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authMiddleware_1 = require("./middleware/authMiddleware");
const JWT_SECRET = process.env.JWT_SECRET || 'susama_luxury_secret_jwt_key_2026_ceylon';
// Ensure default admin user exists in admin_users table (Strictly separated from customers table)
const ensureDefaultAdmin = async () => {
    try {
        await db_1.pool.query(`
      CREATE TABLE IF NOT EXISTS admin_users (
        id VARCHAR(36) PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(100) NOT NULL,
        role VARCHAR(50) DEFAULT 'admin',
        last_login DATETIME NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
        const [rows] = await db_1.pool.query('SELECT id FROM admin_users LIMIT 1');
        if (!rows || rows.length === 0) {
            const defaultPassword = process.env.ADMIN_DEFAULT_PASSWORD || 'admin123';
            const hash = await bcryptjs_1.default.hash(defaultPassword, 10);
            await db_1.pool.query(`
        INSERT INTO admin_users (id, email, password, name, role)
        VALUES (UUID(), 'admin@susama.lk', ?, 'SUSÁMÁ Executive Admin', 'admin')
      `, [hash]);
            console.log('✅ Default administrator account initialized (admin@susama.lk)');
        }
    }
    catch (err) {
        console.error('Admin table check notice:', err);
    }
};
ensureDefaultAdmin();
// Routes
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'SUSAMA Backend is running!' });
});
// Auth API Routes (Customer Registration, Login, Profile)
app.use('/api/auth', customerAuthRoutes_1.default);
// Order API Routes (Checkout & Past Orders)
app.use('/api/orders', orderRoutes_1.default);
// Category API Routes
app.use('/api/categories', categoryRoutes_1.default);
// Product API Routes
app.use('/api/products', productRoutes_1.default);
// Review API Routes
app.use('/api/reviews', reviewRoutes_1.default);
// Newsletter API Routes
app.use('/api/newsletter', newsletterRoutes_1.default);
// Image File Upload Route (Products, Categories, Content)
app.post('/api/upload', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    const type = req.query.type || req.body.type;
    const sub = type === 'category' ? 'categories/' : type === 'product' ? 'products/' : '';
    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${sub}${req.file.filename}`;
    const relativeUrl = `/uploads/${sub}${req.file.filename}`;
    res.json({
        success: true,
        message: 'File uploaded successfully',
        url: fileUrl,
        relative_url: relativeUrl,
        filename: req.file.filename
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
app.post('/api/social-posts/import-url', async (req, res) => {
    try {
        const { url } = req.body;
        if (!url || typeof url !== 'string') {
            return res.status(400).json({ success: false, message: 'Please provide a valid URL' });
        }
        const hostBaseUrl = `${req.protocol}://${req.get('host')}`;
        const scraped = await (0, socialScraper_1.scrapeSocialPost)(url.trim(), uploadDir, hostBaseUrl);
        const postId = `post-${Date.now()}`;
        await db_1.pool.query(`INSERT INTO social_posts (
        id, platform, author, handle, verified, avatar_url, image_url, post_url, caption, likes_count, comments_count, sort_order, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, TRUE)`, [
            postId,
            scraped.platform,
            scraped.author,
            scraped.handle,
            scraped.verified ? 1 : 0,
            scraped.avatar_url || null,
            scraped.image_url,
            scraped.post_url,
            scraped.caption,
            scraped.likes_count,
            scraped.comments_count
        ]);
        res.json({
            success: true,
            message: `Successfully imported ${scraped.platform} post!`,
            data: {
                id: postId,
                ...scraped
            }
        });
    }
    catch (error) {
        console.error('Error importing social post from URL:', error);
        res.status(500).json({ success: false, message: error.message || 'Could not import post from URL' });
    }
});
app.delete('/api/social-posts/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await db_1.pool.query(`DELETE FROM social_posts WHERE id = ?`, [id]);
        res.json({ success: true, message: 'Social post deleted' });
    }
    catch (error) {
        console.error('Error deleting social post:', error);
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
// Shipping Settings API Routes (Free Delivery Threshold & Fee - Admin Managed)
app.get('/api/settings/shipping', async (req, res) => {
    try {
        await db_1.pool.query(`
      CREATE TABLE IF NOT EXISTS store_settings (
        id VARCHAR(36) PRIMARY KEY,
        setting_key VARCHAR(100) NOT NULL UNIQUE,
        setting_value TEXT NOT NULL
      )
    `);
        const [rows] = await db_1.pool.query(`SELECT setting_key, setting_value FROM store_settings WHERE setting_key IN ('free_shipping_threshold', 'standard_shipping_fee')`);
        let freeThreshold = 7500;
        let standardFee = 450;
        if (rows && rows.length > 0) {
            rows.forEach((r) => {
                if (r.setting_key === 'free_shipping_threshold')
                    freeThreshold = Number(r.setting_value) || 7500;
                if (r.setting_key === 'standard_shipping_fee')
                    standardFee = Number(r.setting_value) || 450;
            });
        }
        res.json({
            success: true,
            data: {
                free_shipping_threshold: freeThreshold,
                standard_shipping_fee: standardFee,
                currency: 'LKR'
            }
        });
    }
    catch (error) {
        console.error('Error fetching shipping settings:', error);
        res.json({
            success: true,
            data: {
                free_shipping_threshold: 7500,
                standard_shipping_fee: 450,
                currency: 'LKR'
            }
        });
    }
});
// Admin Authentication Routes (Separated from customer accounts)
app.post('/api/admin/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Please provide administrator email and password.' });
        }
        const trimmedEmail = String(email).trim().toLowerCase();
        // Query admin_users specifically (customers table cannot authenticate as admin)
        const [rows] = await db_1.pool.query('SELECT id, email, password, name, role FROM admin_users WHERE LOWER(email) = ? LIMIT 1', [trimmedEmail]);
        if (!rows || rows.length === 0) {
            return res.status(401).json({ success: false, message: 'Invalid administrator credentials.' });
        }
        const admin = rows[0];
        const isMatch = await bcryptjs_1.default.compare(String(password), admin.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid administrator credentials.' });
        }
        await db_1.pool.query('UPDATE admin_users SET last_login = NOW() WHERE id = ?', [admin.id]);
        const token = jsonwebtoken_1.default.sign({ id: admin.id, email: admin.email, name: admin.name, role: 'admin' }, JWT_SECRET, { expiresIn: '1d' });
        res.json({
            success: true,
            message: 'Admin authentication successful.',
            data: {
                token,
                admin: {
                    id: admin.id,
                    name: admin.name,
                    email: admin.email,
                    role: 'admin'
                }
            }
        });
    }
    catch (error) {
        console.error('Error during admin login:', error);
        res.status(500).json({ success: false, message: 'Server error during authentication.', error: error.message });
    }
});
app.get('/api/admin/verify', authMiddleware_1.verifyAdminToken, (req, res) => {
    res.json({
        success: true,
        admin: req.admin
    });
});
// Admin Management APIs (Protected by verifyAdminToken)
app.use('/api/admin', adminRoutes_1.default);
app.post('/api/settings/shipping', authMiddleware_1.verifyAdminToken, async (req, res) => {
    try {
        const { free_shipping_threshold, standard_shipping_fee } = req.body;
        await db_1.pool.query(`
      CREATE TABLE IF NOT EXISTS store_settings (
        id VARCHAR(36) PRIMARY KEY,
        setting_key VARCHAR(100) NOT NULL UNIQUE,
        setting_value TEXT NOT NULL
      )
    `);
        if (free_shipping_threshold !== undefined) {
            await db_1.pool.query(`
        INSERT INTO store_settings (id, setting_key, setting_value)
        VALUES (UUID(), 'free_shipping_threshold', ?)
        ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)
      `, [String(free_shipping_threshold)]);
        }
        if (standard_shipping_fee !== undefined) {
            await db_1.pool.query(`
        INSERT INTO store_settings (id, setting_key, setting_value)
        VALUES (UUID(), 'standard_shipping_fee', ?)
        ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)
      `, [String(standard_shipping_fee)]);
        }
        res.json({
            success: true,
            message: 'Shipping settings updated successfully!',
            data: {
                free_shipping_threshold: Number(free_shipping_threshold) || 7500,
                standard_shipping_fee: Number(standard_shipping_fee) || 450,
                currency: 'LKR'
            }
        });
    }
    catch (error) {
        console.error('Error saving shipping settings:', error);
        res.status(500).json({ success: false, message: 'Database error', error: error.message });
    }
});
// Bank Transfer Settings API Routes (Admin Managed & Database Persisted)
app.get('/api/settings/bank', async (req, res) => {
    try {
        await db_1.pool.query(`
      CREATE TABLE IF NOT EXISTS store_settings (
        id VARCHAR(36) PRIMARY KEY,
        setting_key VARCHAR(100) NOT NULL UNIQUE,
        setting_value TEXT NOT NULL
      )
    `);
        const [rows] = await db_1.pool.query(`SELECT setting_key, setting_value FROM store_settings WHERE setting_key IN (
        'bank_name', 'bank_account_name', 'bank_account_number', 'bank_branch', 'bank_transfer_instructions'
      )`);
        let bank_name = 'Commercial Bank';
        let account_name = 'SUSÁMÁ (PVT) LTD';
        let account_number = '1000 8492 4110';
        let branch = 'Torrington (07)';
        let instructions = 'Transfer directly to our corporate bank account and attach your reference slip or transaction ID.';
        if (rows && rows.length > 0) {
            rows.forEach((r) => {
                if (r.setting_key === 'bank_name' && r.setting_value)
                    bank_name = r.setting_value;
                if (r.setting_key === 'bank_account_name' && r.setting_value)
                    account_name = r.setting_value;
                if (r.setting_key === 'bank_account_number' && r.setting_value)
                    account_number = r.setting_value;
                if (r.setting_key === 'bank_branch' && r.setting_value)
                    branch = r.setting_value;
                if (r.setting_key === 'bank_transfer_instructions' && r.setting_value)
                    instructions = r.setting_value;
            });
        }
        res.json({
            success: true,
            data: {
                bank_name,
                account_name,
                account_number,
                branch,
                instructions
            }
        });
    }
    catch (error) {
        console.error('Error fetching bank settings:', error);
        res.json({
            success: true,
            data: {
                bank_name: 'Commercial Bank',
                account_name: 'SUSÁMÁ (PVT) LTD',
                account_number: '1000 8492 4110',
                branch: 'Torrington (07)',
                instructions: 'Transfer directly to our corporate bank account and attach your reference slip or transaction ID.'
            }
        });
    }
});
app.post('/api/settings/bank', authMiddleware_1.verifyAdminToken, async (req, res) => {
    try {
        const { bank_name, account_name, account_number, branch, instructions } = req.body;
        await db_1.pool.query(`
      CREATE TABLE IF NOT EXISTS store_settings (
        id VARCHAR(36) PRIMARY KEY,
        setting_key VARCHAR(100) NOT NULL UNIQUE,
        setting_value TEXT NOT NULL
      )
    `);
        const updateMap = {
            bank_name: bank_name !== undefined ? String(bank_name).trim() : undefined,
            bank_account_name: account_name !== undefined ? String(account_name).trim() : undefined,
            bank_account_number: account_number !== undefined ? String(account_number).trim() : undefined,
            bank_branch: branch !== undefined ? String(branch).trim() : undefined,
            bank_transfer_instructions: instructions !== undefined ? String(instructions).trim() : undefined
        };
        for (const [key, val] of Object.entries(updateMap)) {
            if (val !== undefined) {
                await db_1.pool.query(`
          INSERT INTO store_settings (id, setting_key, setting_value)
          VALUES (UUID(), ?, ?)
          ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)
        `, [key, val]);
            }
        }
        // Return current updated settings from database
        const [rows] = await db_1.pool.query(`SELECT setting_key, setting_value FROM store_settings WHERE setting_key IN (
        'bank_name', 'bank_account_name', 'bank_account_number', 'bank_branch', 'bank_transfer_instructions'
      )`);
        let updatedBank = {
            bank_name: bank_name || 'Commercial Bank',
            account_name: account_name || 'SUSÁMÁ (PVT) LTD',
            account_number: account_number || '1000 8492 4110',
            branch: branch || 'Torrington (07)',
            instructions: instructions || 'Transfer directly to our corporate bank account and attach your reference slip or transaction ID.'
        };
        if (rows && rows.length > 0) {
            rows.forEach((r) => {
                if (r.setting_key === 'bank_name')
                    updatedBank.bank_name = r.setting_value;
                if (r.setting_key === 'bank_account_name')
                    updatedBank.account_name = r.setting_value;
                if (r.setting_key === 'bank_account_number')
                    updatedBank.account_number = r.setting_value;
                if (r.setting_key === 'bank_branch')
                    updatedBank.branch = r.setting_value;
                if (r.setting_key === 'bank_transfer_instructions')
                    updatedBank.instructions = r.setting_value;
            });
        }
        res.json({
            success: true,
            message: 'Bank details saved to database successfully!',
            data: updatedBank
        });
    }
    catch (error) {
        console.error('Error saving bank settings:', error);
        res.status(500).json({ success: false, message: 'Database error', error: error.message });
    }
});
app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
