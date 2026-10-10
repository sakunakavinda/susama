import { pool } from '../config/db.js';
import { randomUUID } from 'crypto';

const categoriesToInsert = [
  {
    id: 'c1000000-0000-4000-8000-000000000001',
    name: 'Shampoos & Cleansers',
    slug: 'shampoos',
    description: 'Gentle, sulfate-free botanical cleansers crafted to purify scalp and nourish hair textures.',
    image_url: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?q=80&w=800&auto=format&fit=crop',
    sort_order: 1
  },
  {
    id: 'c1000000-0000-4000-8000-000000000002',
    name: 'Nourishing Conditioners',
    slug: 'conditioners',
    description: 'Rich, hydrating and detangling formulas for silkiness, curl bounce, and lasting softness.',
    image_url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=800&auto=format&fit=crop',
    sort_order: 2
  },
  {
    id: 'c1000000-0000-4000-8000-000000000003',
    name: 'Hair Treatments & Oils',
    slug: 'hair-treatments',
    description: 'Restorative keratin elixirs, antioxidant oils, and intensive repair rituals.',
    image_url: 'https://images.unsplash.com/photo-1608248597266-c89a9f243003?q=80&w=800&auto=format&fit=crop',
    sort_order: 3
  },
  {
    id: 'c1000000-0000-4000-8000-000000000004',
    name: 'Curl Care & Styling',
    slug: 'curl-care-styling',
    description: 'Miracle curling creams and definition stylers that activate bounce and tame frizz.',
    image_url: 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?q=80&w=800&auto=format&fit=crop',
    sort_order: 4
  },
  {
    id: 'c1000000-0000-4000-8000-000000000005',
    name: 'Hair Perfumes & Mists',
    slug: 'hair-perfumes',
    description: 'Long-lasting luxury hair mists infused with sandalwood and damask rose botanical essences.',
    image_url: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=800&auto=format&fit=crop',
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
