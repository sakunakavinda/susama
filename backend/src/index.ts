import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import multer from 'multer';
import fs from 'fs';
import { pool } from './config/db'; // Initializes DB connection

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded static files
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
app.use('/uploads', express.static(uploadDir));

// Multer Setup for Local File Uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

import categoryRoutes from './routes/categoryRoutes';
import productRoutes from './routes/productRoutes';
import reviewRoutes from './routes/reviewRoutes';
import newsletterRoutes from './routes/newsletterRoutes';
import customerAuthRoutes from './routes/customerAuthRoutes';
import { scrapeSocialPost } from './services/socialScraper';

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'SUSAMA Backend is running!' });
});

// Auth API Routes (Customer Registration, Login, Profile)
app.use('/api/auth', customerAuthRoutes);

// Category API Routes
app.use('/api/categories', categoryRoutes);

// Product API Routes
app.use('/api/products', productRoutes);

// Review API Routes
app.use('/api/reviews', reviewRoutes);

// Newsletter API Routes
app.use('/api/newsletter', newsletterRoutes);

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
    const [rows]: any = await pool.query(
      `SELECT * FROM social_posts WHERE is_active = TRUE ORDER BY sort_order ASC, created_at DESC`
    );
    res.json({
      success: true,
      data: rows
    });
  } catch (error: any) {
    console.error('Error fetching social posts:', error);
    res.status(500).json({ success: false, message: 'Database error', error: error.message });
  }
});

app.put('/api/social-posts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { post_url, author, handle, caption, likes_count, comments_count, is_active } = req.body;
    
    await pool.query(
      `UPDATE social_posts SET 
        post_url = COALESCE(?, post_url),
        author = COALESCE(?, author),
        handle = COALESCE(?, handle),
        caption = COALESCE(?, caption),
        likes_count = COALESCE(?, likes_count),
        comments_count = COALESCE(?, comments_count),
        is_active = COALESCE(?, is_active)
       WHERE id = ?`,
      [post_url, author, handle, caption, likes_count, comments_count, is_active, id]
    );

    res.json({ success: true, message: 'Social post updated successfully' });
  } catch (error: any) {
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
    const scraped = await scrapeSocialPost(url.trim(), uploadDir, hostBaseUrl);

    const postId = `post-${Date.now()}`;
    await pool.query(
      `INSERT INTO social_posts (
        id, platform, author, handle, verified, avatar_url, image_url, post_url, caption, likes_count, comments_count, sort_order, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, TRUE)`,
      [
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
      ]
    );

    res.json({
      success: true,
      message: `Successfully imported ${scraped.platform} post!`,
      data: {
        id: postId,
        ...scraped
      }
    });
  } catch (error: any) {
    console.error('Error importing social post from URL:', error);
    res.status(500).json({ success: false, message: error.message || 'Could not import post from URL' });
  }
});

app.delete('/api/social-posts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query(`DELETE FROM social_posts WHERE id = ?`, [id]);
    res.json({ success: true, message: 'Social post deleted' });
  } catch (error: any) {
    console.error('Error deleting social post:', error);
    res.status(500).json({ success: false, message: 'Database error', error: error.message });
  }
});


// Ritual Video Database API Routes
app.get('/api/settings/ritual-video', async (req, res) => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS store_settings (
        id VARCHAR(36) PRIMARY KEY,
        setting_key VARCHAR(100) NOT NULL UNIQUE,
        setting_value TEXT NOT NULL
      )
    `);

    const [rows]: any = await pool.query(
      `SELECT setting_value FROM store_settings WHERE setting_key = 'ritual_video_url' LIMIT 1`
    );

    let videoUrl = '/ritual-video.mp4';
    if (rows && rows.length > 0 && rows[0].setting_value) {
      videoUrl = rows[0].setting_value;
    }

    const [titleRows]: any = await pool.query(
      `SELECT setting_value FROM store_settings WHERE setting_key = 'ritual_video_title' LIMIT 1`
    );

    let videoTitle = 'Ceylon Keratin Curl Elixir';
    if (titleRows && titleRows.length > 0 && titleRows[0].setting_value) {
      videoTitle = titleRows[0].setting_value;
    }

    const [descRows]: any = await pool.query(
      `SELECT setting_value FROM store_settings WHERE setting_key = 'ritual_video_description' LIMIT 1`
    );

    let videoDescription = 'Watch the botanical curl transformation in action and explore real results shared across social media by our growing island community.';
    if (descRows && descRows.length > 0 && descRows[0].setting_value) {
      videoDescription = descRows[0].setting_value;
    }

    const [headingRows]: any = await pool.query(
      `SELECT setting_value FROM store_settings WHERE setting_key = 'ritual_video_heading' LIMIT 1`
    );

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
  } catch (error: any) {
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
    await pool.query(`
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
      await pool.query(`
        INSERT INTO store_settings (id, setting_key, setting_value)
        VALUES (UUID(), 'ritual_video_url', ?)
        ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)
      `, [videoUrl]);
      console.log('✅ Ritual video updated in database:', videoUrl);
    }

    if (req.body?.description) {
      await pool.query(`
        INSERT INTO store_settings (id, setting_key, setting_value)
        VALUES (UUID(), 'ritual_video_description', ?)
        ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)
      `, [req.body.description]);
    }

    if (req.body?.heading) {
      await pool.query(`
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
  } catch (error: any) {
    console.error('Error saving ritual video to database:', error);
    res.status(500).json({ success: false, message: 'Database error', error: error.message });
  }
});

// Shipping Settings API Routes (Free Delivery Threshold & Fee - Admin Managed)
app.get('/api/settings/shipping', async (req, res) => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS store_settings (
        id VARCHAR(36) PRIMARY KEY,
        setting_key VARCHAR(100) NOT NULL UNIQUE,
        setting_value TEXT NOT NULL
      )
    `);

    const [rows]: any = await pool.query(
      `SELECT setting_key, setting_value FROM store_settings WHERE setting_key IN ('free_shipping_threshold', 'standard_shipping_fee')`
    );

    let freeThreshold = 7500;
    let standardFee = 450;

    if (rows && rows.length > 0) {
      rows.forEach((r: any) => {
        if (r.setting_key === 'free_shipping_threshold') freeThreshold = Number(r.setting_value) || 7500;
        if (r.setting_key === 'standard_shipping_fee') standardFee = Number(r.setting_value) || 450;
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
  } catch (error: any) {
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

app.post('/api/settings/shipping', async (req, res) => {
  try {
    const { free_shipping_threshold, standard_shipping_fee } = req.body;

    await pool.query(`
      CREATE TABLE IF NOT EXISTS store_settings (
        id VARCHAR(36) PRIMARY KEY,
        setting_key VARCHAR(100) NOT NULL UNIQUE,
        setting_value TEXT NOT NULL
      )
    `);

    if (free_shipping_threshold !== undefined) {
      await pool.query(`
        INSERT INTO store_settings (id, setting_key, setting_value)
        VALUES (UUID(), 'free_shipping_threshold', ?)
        ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)
      `, [String(free_shipping_threshold)]);
    }

    if (standard_shipping_fee !== undefined) {
      await pool.query(`
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
  } catch (error: any) {
    console.error('Error saving shipping settings:', error);
    res.status(500).json({ success: false, message: 'Database error', error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
