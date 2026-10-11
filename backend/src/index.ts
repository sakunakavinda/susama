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

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'SUSAMA Backend is running!' });
});

// Category API Routes
app.use('/api/categories', categoryRoutes);

// Product API Routes
app.use('/api/products', productRoutes);

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

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
