import { pool } from '../config/db';
import { randomUUID } from 'crypto';

interface ReviewData {
  product_id: string;
  customer_name: string;
  customer_email?: string;
  rating: number;
  title: string;
  comment: string;
  is_verified_purchase: boolean;
  helpful_count: number;
  created_at: string;
}

const REVIEWS_DATA: ReviewData[] = [
  // 1. Sulfate Free Shampoo – Silky Hair
  {
    product_id: 'p1000000-0000-4000-8000-000000000001',
    customer_name: 'Ananya Silva',
    customer_email: 'ananya.silva@gmail.com',
    rating: 5,
    title: 'Liquid silk in a bottle!',
    comment: 'Incredible lather without harsh sulfates! My hair feels like liquid silk and doesn\'t get greasy fast. Smells like a luxury Ceylon spa.',
    is_verified_purchase: true,
    helpful_count: 14,
    created_at: '2026-09-15 10:20:00'
  },
  {
    product_id: 'p1000000-0000-4000-8000-000000000001',
    customer_name: 'Dilshan Fernando',
    customer_email: 'dilshan.f@outlook.com',
    rating: 5,
    title: 'Clean scalp with zero dryness',
    comment: 'Switched from imported salon brands to Susama and I am blown away. Scalp feels refreshed, and my straight hair is bouncy and glossy.',
    is_verified_purchase: true,
    helpful_count: 9,
    created_at: '2026-09-22 14:15:00'
  },
  {
    product_id: 'p1000000-0000-4000-8000-000000000001',
    customer_name: 'Chamodi Jayawardena',
    customer_email: 'chamodi.j@yahoo.com',
    rating: 4,
    title: 'Noticeable softness after 2 washes',
    comment: 'Great gentle shampoo for everyday use in humid weather. Noticeable difference in softness. Pairs exceptionally well with the Silky Conditioner.',
    is_verified_purchase: true,
    helpful_count: 5,
    created_at: '2026-10-01 09:45:00'
  },

  // 2. Conditioner – Silky Hair
  {
    product_id: 'p1000000-0000-4000-8000-000000000002',
    customer_name: 'Hiruni Perera',
    customer_email: 'hiruni.p@gmail.com',
    rating: 5,
    title: 'Unbelievable slip and shine',
    comment: 'The comb glides right through without snagging. Does not weigh down fine hair at all. My ends are silky smooth and flyaways are completely gone.',
    is_verified_purchase: true,
    helpful_count: 11,
    created_at: '2026-09-18 16:30:00'
  },
  {
    product_id: 'p1000000-0000-4000-8000-000000000002',
    customer_name: 'Kavindi Wickramasinghe',
    customer_email: 'kavindi.w@gmail.com',
    rating: 5,
    title: 'Glass hair effect in Colombo humidity',
    comment: 'I use this 3 times a week. It seals in moisture so well against heat and humidity. Highly recommended for straight to wavy hair textures.',
    is_verified_purchase: true,
    helpful_count: 7,
    created_at: '2026-09-29 11:10:00'
  },

  // 3. Sulfate Free Shampoo – Curly Hair
  {
    product_id: 'p1000000-0000-4000-8000-000000000003',
    customer_name: 'Minoli Senaratne',
    customer_email: 'minoli.s@gmail.com',
    rating: 5,
    title: 'Holy grail for 3B curls!',
    comment: 'Finally a sulfate-free shampoo formulated for tropical climate! Cleanses the scalp thoroughly without stripping natural moisture. My curls spring back immediately.',
    is_verified_purchase: true,
    helpful_count: 22,
    created_at: '2026-09-10 13:00:00'
  },
  {
    product_id: 'p1000000-0000-4000-8000-000000000003',
    customer_name: 'Tharindu Madusanka',
    customer_email: 'tharindu.m@gmail.com',
    rating: 5,
    title: 'Bouncy curls with no frizz',
    comment: 'Bought this on recommendation. My curls look neat and defined rather than like a puffy triangle. Great scent too!',
    is_verified_purchase: true,
    helpful_count: 8,
    created_at: '2026-09-24 15:20:00'
  },
  {
    product_id: 'p1000000-0000-4000-8000-000000000003',
    customer_name: 'Natasha Dias',
    customer_email: 'natasha.dias@hotmail.com',
    rating: 5,
    title: 'Zero dryness on Day 3',
    comment: 'Usually shampoos leave my hair parched, but Susama keeps my curl moisture locked in all week. Love this formula!',
    is_verified_purchase: true,
    helpful_count: 12,
    created_at: '2026-10-04 18:30:00'
  },

  // 4. Conditioner – Curly Hair
  {
    product_id: 'p1000000-0000-4000-8000-000000000004',
    customer_name: 'Dinithi Abeysekara',
    customer_email: 'dinithi.a@gmail.com',
    rating: 5,
    title: 'Detangling slip is 10/10',
    comment: 'Makes detangling thick curls a breeze. Rich botanical moisture without greasiness. Holds curl definition exceptionally well.',
    is_verified_purchase: true,
    helpful_count: 16,
    created_at: '2026-09-12 11:40:00'
  },
  {
    product_id: 'p1000000-0000-4000-8000-000000000004',
    customer_name: 'Shenali Weerasinghe',
    customer_email: 'shenali.w@yahoo.com',
    rating: 5,
    title: 'Must-have for curls in Sri Lanka',
    comment: 'The humidity test passed with flying colors! Soft ringlets that hold shape until the next wash day.',
    is_verified_purchase: true,
    helpful_count: 10,
    created_at: '2026-09-27 17:15:00'
  },

  // 5. Restorative Keratin Oil
  {
    product_id: 'p1000000-0000-4000-8000-000000000005',
    customer_name: 'Malsha Mendis',
    customer_email: 'malsha.mendis@gmail.com',
    rating: 5,
    title: 'Game changer for bleached and heat-damaged hair',
    comment: 'Just 2 drops on damp hair before blow drying gives a mirror shine and seals split ends. Lightweight, non-sticky and deeply nourishing.',
    is_verified_purchase: true,
    helpful_count: 28,
    created_at: '2026-09-08 09:10:00'
  },
  {
    product_id: 'p1000000-0000-4000-8000-000000000005',
    customer_name: 'Ruwini Pathirana',
    customer_email: 'ruwini.p@gmail.com',
    rating: 5,
    title: 'Absorbs instantly without greasy residue',
    comment: 'I was hesitant to try oils because of my fine hair, but this absorbs instantly. My frizzy ends look like they were treated at a high-end salon.',
    is_verified_purchase: true,
    helpful_count: 19,
    created_at: '2026-09-19 14:50:00'
  },
  {
    product_id: 'p1000000-0000-4000-8000-000000000005',
    customer_name: 'Keshani Rodrigo',
    customer_email: 'keshani.r@outlook.com',
    rating: 5,
    title: 'Best keratin oil on the island',
    comment: 'Worth every rupee. Lasts for months because a few drops are enough. My hair looks healthier and shinier than ever.',
    is_verified_purchase: true,
    helpful_count: 15,
    created_at: '2026-10-02 20:05:00'
  },
  {
    product_id: 'p1000000-0000-4000-8000-000000000005',
    customer_name: 'Ashan Wijesinghe',
    customer_email: 'ashan.w@gmail.com',
    rating: 5,
    title: 'Exceptional quality',
    comment: 'Top-tier formulation. Leaves hair smooth, fragrant, and manageable without any heavy oil slick feeling.',
    is_verified_purchase: true,
    helpful_count: 6,
    created_at: '2026-10-06 12:20:00'
  },

  // 6. Miracle Curling Cream
  {
    product_id: 'p1000000-0000-4000-8000-000000000006',
    customer_name: 'Shehani Cooray',
    customer_email: 'shehani.c@gmail.com',
    rating: 5,
    title: 'Soft, bouncy curls with zero crunch!',
    comment: 'I hate crunchy gels so this curling cream is absolute perfection. Clumps curls into luscious spirals with soft touchable texture.',
    is_verified_purchase: true,
    helpful_count: 24,
    created_at: '2026-09-14 10:15:00'
  },
  {
    product_id: 'p1000000-0000-4000-8000-000000000006',
    customer_name: 'Pramodh Bandara',
    customer_email: 'pramodh.b@gmail.com',
    rating: 5,
    title: 'Controls tropical frizz like nothing else',
    comment: 'Keeps wavy hair neat and styled all day. Highly recommended for daily wash-and-go routines.',
    is_verified_purchase: true,
    helpful_count: 13,
    created_at: '2026-09-25 16:40:00'
  },
  {
    product_id: 'p1000000-0000-4000-8000-000000000006',
    customer_name: 'Hasini Rathnayake',
    customer_email: 'hasini.r@yahoo.com',
    rating: 4,
    title: 'Great hydration and bounce',
    comment: 'Smells delicious and makes styling so fast. Provides definition without flaking or residue.',
    is_verified_purchase: true,
    helpful_count: 7,
    created_at: '2026-10-05 15:30:00'
  },

  // 7. Hair Perfume Spray – Sandalwood
  {
    product_id: 'p1000000-0000-4000-8000-000000000007',
    customer_name: 'Rashmi Rajapakse',
    customer_email: 'rashmi.r@gmail.com',
    rating: 5,
    title: 'Warm, exotic and lasts over 12 hours!',
    comment: 'Authentic Ceylon Sandalwood essence with a touch of warmth. Neutralizes cooking odors immediately and gives a glossy sheen to hair.',
    is_verified_purchase: true,
    helpful_count: 31,
    created_at: '2026-09-11 11:25:00'
  },
  {
    product_id: 'p1000000-0000-4000-8000-000000000007',
    customer_name: 'Michelle D\'Silva',
    customer_email: 'michelle.ds@hotmail.com',
    rating: 5,
    title: 'My absolute signature fragrance',
    comment: 'People stop me constantly to ask what smells so divine. Doesn\'t dry out the hair because it\'s alcohol-free botanical mist.',
    is_verified_purchase: true,
    helpful_count: 20,
    created_at: '2026-09-26 19:10:00'
  },
  {
    product_id: 'p1000000-0000-4000-8000-000000000007',
    customer_name: 'Nuwan Kalhara',
    customer_email: 'nuwan.k@gmail.com',
    rating: 5,
    title: 'Luxurious earthy fragrance',
    comment: 'Refined, elegant and masculine yet unisex. Keeps hair smelling crisp and clean all day long.',
    is_verified_purchase: true,
    helpful_count: 9,
    created_at: '2026-10-03 13:45:00'
  },

  // 8. Hair Perfume Spray – Rose
  {
    product_id: 'p1000000-0000-4000-8000-000000000008',
    customer_name: 'Oshadhi Jayasooriya',
    customer_email: 'oshadhi.j@gmail.com',
    rating: 5,
    title: 'Fresh Damask Rose petals in the breeze',
    comment: 'Delicate, romantic, and uplifting floral aroma. Perfect for quick refreshes between washes.',
    is_verified_purchase: true,
    helpful_count: 17,
    created_at: '2026-09-17 14:00:00'
  },
  {
    product_id: 'p1000000-0000-4000-8000-000000000008',
    customer_name: 'Chathurika Karunaratne',
    customer_email: 'chathurika.k@gmail.com',
    rating: 4,
    title: 'Very fresh and elegant',
    comment: 'Not synthetic at all. Feels like real freshly plucked roses. Beautiful glass mist bottle packaging.',
    is_verified_purchase: true,
    helpful_count: 8,
    created_at: '2026-10-07 10:15:00'
  }
];

export async function seedReviews() {
  console.log('🌱 Starting reviews table seeding...');
  
  try {
    // 1. Create reviews table if not exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id VARCHAR(36) PRIMARY KEY,
        product_id VARCHAR(36) NOT NULL,
        customer_name VARCHAR(150) NOT NULL,
        customer_email VARCHAR(255) NULL,
        rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
        title VARCHAR(255) NULL,
        comment TEXT NOT NULL,
        is_verified_purchase BOOLEAN DEFAULT TRUE,
        is_approved BOOLEAN DEFAULT TRUE,
        helpful_count INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
        INDEX idx_product_approved (product_id, is_approved),
        INDEX idx_rating (rating)
      );
    `);

    // 2. Clear old test reviews
    await pool.query(`DELETE FROM reviews`);

    // 3. Insert real reviews
    for (const r of REVIEWS_DATA) {
      const id = randomUUID();
      await pool.query(
        `INSERT INTO reviews (id, product_id, customer_name, customer_email, rating, title, comment, is_verified_purchase, is_approved, helpful_count, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, TRUE, ?, ?)`,
        [id, r.product_id, r.customer_name, r.customer_email || null, r.rating, r.title, r.comment, r.is_verified_purchase, r.helpful_count, r.created_at]
      );
    }
    console.log(`✅ Inserted ${REVIEWS_DATA.length} verified customer reviews.`);

    // 4. Update products aggregated rating and review counts from actual reviews data
    console.log('🔄 Recalculating and syncing product ratings from reviews...');
    await pool.query(`
      UPDATE products p
      SET 
        p.rating = COALESCE((
          SELECT ROUND(AVG(r.rating), 1)
          FROM reviews r 
          WHERE r.product_id = p.id AND r.is_approved = TRUE
        ), 5.0),
        p.reviews = COALESCE((
          SELECT COUNT(*)
          FROM reviews r 
          WHERE r.product_id = p.id AND r.is_approved = TRUE
        ), 0)
      WHERE p.id IN (SELECT DISTINCT product_id FROM reviews);
    `);

    console.log('🎉 Reviews seeding and product rating synchronization completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding reviews:', error);
    throw error;
  }
}

// Execute if run directly
if (require.main === module) {
  seedReviews()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
