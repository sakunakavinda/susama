import { pool } from '../config/db.js';
import { randomUUID } from 'crypto';

const categoriesToInsert = [
  {
    id: randomUUID(),
    name: 'Category 1',
    slug: 'category-1',
    description: 'Skincare Essentials - Category 1',
    image_url: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=80&w=600&auto=format&fit=crop',
    sort_order: 1
  },
  {
    id: randomUUID(),
    name: 'Category 2',
    slug: 'category-2',
    description: 'Luxury Serums - Category 2',
    image_url: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=600&auto=format&fit=crop',
    sort_order: 2
  },
  {
    id: randomUUID(),
    name: 'Category 3',
    slug: 'category-3',
    description: 'Natural Cleansers - Category 3',
    image_url: 'https://images.unsplash.com/photo-1556228720-192a6af4e865?q=80&w=600&auto=format&fit=crop',
    sort_order: 3
  },
  {
    id: randomUUID(),
    name: 'Category 4',
    slug: 'category-4',
    description: 'Face Oils & Creams - Category 4',
    image_url: 'https://images.unsplash.com/photo-1608248597266-c89a9f243003?q=80&w=600&auto=format&fit=crop',
    sort_order: 4
  },
  {
    id: randomUUID(),
    name: 'Category 5',
    slug: 'category-5',
    description: 'Sun Protection - Category 5',
    image_url: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?q=80&w=600&auto=format&fit=crop',
    sort_order: 5
  }
];

async function seedCategories() {
  try {
    console.log('Seeding categories into MySQL database...');

    for (const cat of categoriesToInsert) {
      await pool.execute(
        `INSERT INTO categories (id, name, slug, description, image_url, sort_order) 
         VALUES (?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE 
           name = VALUES(name),
           description = VALUES(description),
           image_url = VALUES(image_url),
           sort_order = VALUES(sort_order)`,
        [cat.id, cat.name, cat.slug, cat.description, cat.image_url, cat.sort_order]
      );
      console.log(`✅ Seeded: ${cat.name} (${cat.slug})`);
    }

    const [rows]: any = await pool.query('SELECT id, name, slug, image_url FROM categories ORDER BY sort_order ASC');
    console.log('\n📋 All categories currently in database:');
    console.table(rows);

    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to seed categories:', error);
    process.exit(1);
  }
}

seedCategories();
