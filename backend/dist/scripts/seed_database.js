"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PRODUCTS_SEED = exports.CATEGORIES_SEED = void 0;
const db_1 = require("../config/db");
exports.CATEGORIES_SEED = [
    {
        id: 'c1000000-0000-4000-8000-000000000001',
        name: 'Shampoos & Cleansers',
        slug: 'shampoos',
        description: 'Gentle, sulfate-free botanical cleansers crafted to purify scalp and nourish silky and curly hair textures.',
        image_url: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?q=80&w=800&auto=format&fit=crop',
        sort_order: 1
    },
    {
        id: 'c1000000-0000-4000-8000-000000000002',
        name: 'Nourishing Conditioners',
        slug: 'conditioners',
        description: 'Rich, hydrating and detangling formulas for sleek silkiness, curl bounce, and lasting softness.',
        image_url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=800&auto=format&fit=crop',
        sort_order: 2
    },
    {
        id: 'c1000000-0000-4000-8000-000000000003',
        name: 'Hair Treatments & Oils',
        slug: 'hair-treatments',
        description: 'Restorative keratin elixirs, antioxidant oils, and intensive repair rituals.',
        image_url: 'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?q=80&w=800&auto=format&fit=crop',
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
exports.PRODUCTS_SEED = [
    {
        id: 'p1000000-0000-4000-8000-000000000001',
        category_id: 'c1000000-0000-4000-8000-000000000001',
        name: 'SUSÁMÁ Sulfate Free Shampoo – Silky Hair',
        slug: 'susama-sulfate-free-shampoo-silky-hair',
        sku: 'SUS-SH-SILK-250',
        short_description: 'Gentle sulfate-free daily cleanser enriched with silk amino acids and botanical extracts for sleek, ultra-smooth, glossy hair.',
        full_description: "SUSÁMÁ Sulfate-Free Shampoo for Silky Hair gently washes away daily impurities without stripping the hair's natural oils. Infused with hydrolysed silk proteins and organic coconut water, it smooths flyaways, tames frizz, and leaves straight-to-wavy hair with brilliant shine and mirror-like reflection.",
        ingredients: 'Aqua, Sodium Cocoyl Isethionate, Cocamidopropyl Betaine, Hydrolyzed Silk Protein, Argania Spinosa Kernel Oil, Aloe Barbadensis Leaf Juice, Panthenol, Tocopherol, Natural Botanical Fragrance, Citric Acid.',
        how_to_use: 'Apply to wet scalp and massage gently into a rich lather. Rinse thoroughly with lukewarm water. Follow with SUSÁMÁ Conditioner – Silky Hair for optimal sleekness.',
        base_price: 3200.00,
        sale_price: 2850.00,
        stock_quantity: 50,
        is_in_stock: true,
        is_featured: true,
        is_new_arrival: false,
        is_active: true,
        image_url: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?q=80&w=800&auto=format&fit=crop'
    },
    {
        id: 'p1000000-0000-4000-8000-000000000002',
        category_id: 'c1000000-0000-4000-8000-000000000002',
        name: 'SUSÁMÁ Conditioner – Silky Hair',
        slug: 'susama-conditioner-silky-hair',
        sku: 'SUS-CO-SILK-250',
        short_description: 'Weightless smoothing conditioner with organic camellia oil and provitamin B5 to detangle and deeply nourish silky strands.',
        full_description: 'Lock in moisture and softness with SUSÁMÁ Conditioner for Silky Hair. Specially formulated with cold-pressed camellia seed oil, hydrolysed wheat protein, and provitamin B5 to detangle instantly, seal split ends, and deliver touchable, fluid silkiness without weighing hair down.',
        ingredients: 'Aqua, Cetearyl Alcohol, Behentrimonium Chloride, Camellia Japonica Seed Oil, Hydrolyzed Wheat Protein, Butyrospermum Parkii Butter, Cetyl Esters, Panthenol, Ethylhexylglycerin, Natural Aroma.',
        how_to_use: 'After shampooing, smooth generously from mid-lengths to ends. Leave on for 2-3 minutes, then rinse completely.',
        base_price: 3400.00,
        sale_price: 2990.00,
        stock_quantity: 50,
        is_in_stock: true,
        is_featured: true,
        is_new_arrival: false,
        is_active: true,
        image_url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=800&auto=format&fit=crop'
    },
    {
        id: 'p1000000-0000-4000-8000-000000000003',
        category_id: 'c1000000-0000-4000-8000-000000000001',
        name: 'SUSÁMÁ Sulfate Free Shampoo – Curly Hair',
        slug: 'susama-sulfate-free-shampoo-curly-hair',
        sku: 'SUS-SH-CURL-250',
        short_description: 'Hydrating, curl-loving sulfate-free wash packed with shea butter and flaxseed extract to cleanse while preserving natural curl bounce.',
        full_description: 'Cleanse and enhance your curls without causing dryness. SUSÁMÁ Sulfate-Free Shampoo for Curly Hair preserves your curl pattern while gently removing scalp buildup. Flaxseed mucilage and avocado oil infuse lasting moisture for bouncy, defined, frizz-free curls.',
        ingredients: 'Aqua, Sodium Lauroyl Methyl Isethionate, Cocamidopropyl Hydroxysultaine, Linum Usitatissimum (Flaxseed) Extract, Persea Gratissima Oil, Shea Butter, Vegetable Glycerin, Hydrolyzed Quinoa, Citric Acid.',
        how_to_use: 'Lather generously into wet scalp and curls with fingertips. Rinse thoroughly with lukewarm water.',
        base_price: 3400.00,
        sale_price: 3100.00,
        stock_quantity: 45,
        is_in_stock: true,
        is_featured: true,
        is_new_arrival: false,
        is_active: true,
        image_url: 'https://images.unsplash.com/photo-1585232351009-aa87416fca90?q=80&w=800&auto=format&fit=crop'
    },
    {
        id: 'p1000000-0000-4000-8000-000000000004',
        category_id: 'c1000000-0000-4000-8000-000000000002',
        name: 'SUSÁMÁ Conditioner – Curly Hair',
        slug: 'susama-conditioner-curly-hair',
        sku: 'SUS-CO-CURL-250',
        short_description: 'Rich, slip-heavy curl conditioner with murumuru butter and jojoba to detangle, lock in intense hydration, and define curls.',
        full_description: 'Provide high-slip detangling and profound hydration for textured, curly, and coily hair. SUSÁMÁ Conditioner for Curly Hair blends Amazonian murumuru butter and golden jojoba oil to seal in moisture, eliminate friction, and enhance natural curl spring.',
        ingredients: 'Aqua, Cetearyl Alcohol, Astrocaryum Murumuru Seed Butter, Simmondsia Chinensis Seed Oil, Glycerin, Behentrimonium Methosulfate, Hydrolyzed Vegetable Protein, Lactic Acid, Natural Botanical Extract.',
        how_to_use: 'Apply section by section to wet hair. Detangle with fingers or wide-tooth comb. Leave in for 3-5 minutes, then rinse.',
        base_price: 3600.00,
        sale_price: 3250.00,
        stock_quantity: 40,
        is_in_stock: true,
        is_featured: true,
        is_new_arrival: false,
        is_active: true,
        image_url: 'https://images.unsplash.com/photo-1526947425960-945c6e72858f?q=80&w=800&auto=format&fit=crop'
    },
    {
        id: 'p1000000-0000-4000-8000-000000000005',
        category_id: 'c1000000-0000-4000-8000-000000000003',
        name: 'SUSÁMÁ Restorative Keratin Oil',
        slug: 'susama-keratin-oil',
        sku: 'SUS-OIL-KER-50',
        short_description: 'Intensive keratin elixir that seals split ends, protects against heat styling up to 230°C, and restores lustrous hair vitality.',
        full_description: 'SUSÁMÁ Keratin Oil is a salon-strength restorative elixir formulated with bioactive keratin proteins, pure argan oil, and macadamia seed oil. It deeply penetrates damaged hair fibers, seals split ends, repairs heat damage, and leaves hair visibly smoother with a luminous glass-hair finish.',
        ingredients: 'Cyclopentasiloxane, Dimethiconol, Hydrolyzed Keratin, Argania Spinosa Kernel Oil, Macadamia Integrifolia Seed Oil, Helianthus Annuus Seed Oil, Tocopheryl Acetate, Fragrance.',
        how_to_use: 'Warm 2-3 drops between palms and glide through damp or dry hair from mid-lengths to ends. Use daily or before heat styling.',
        base_price: 4800.00,
        sale_price: 4200.00,
        stock_quantity: 65,
        is_in_stock: true,
        is_featured: true,
        is_new_arrival: false,
        is_active: true,
        image_url: 'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?q=80&w=800&auto=format&fit=crop'
    },
    {
        id: 'p1000000-0000-4000-8000-000000000006',
        category_id: 'c1000000-0000-4000-8000-000000000004',
        name: 'SUSÁMÁ Miracle Curling Cream',
        slug: 'susama-miracle-curling-cream',
        sku: 'SUS-CR-CURL-200',
        short_description: 'Leave-in curl perfecting cream delivering 48-hour definition, zero crunch, and touchable softness for curls and waves.',
        full_description: 'Transform frizzy, undefined curls into soft, glossy, sculpted spirals. SUSÁMÁ Miracle Curling Cream infuses pure mango seed butter, organic aloe leaf juice, and coconut water into a weightless leave-in styling cream that locks in bounce without stiffness or flaking.',
        ingredients: 'Aqua, Mangifera Indica Seed Butter, Aloe Barbadensis Leaf Juice, Cocos Nucifera Extract, Cetearyl Alcohol, Hydroxyethylcellulose, Polyquaternium-11, PVP, Vanilla & Coconut Natural Aroma.',
        how_to_use: 'Distribute evenly through damp curls. Scrunch upward toward roots to encourage curl formation. Let air-dry or diffuse on low heat.',
        base_price: 3900.00,
        sale_price: 3450.00,
        stock_quantity: 55,
        is_in_stock: true,
        is_featured: true,
        is_new_arrival: false,
        is_active: true,
        image_url: 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?q=80&w=800&auto=format&fit=crop'
    },
    {
        id: 'p1000000-0000-4000-8000-000000000007',
        category_id: 'c1000000-0000-4000-8000-000000000005',
        name: 'SUSÁMÁ Hair Perfume Spray – Sandalwood',
        slug: 'susama-hair-perfume-spray-sandal',
        sku: 'SUS-MIST-SAN-100',
        short_description: 'Luxury hair fragrance mist infused with Ceylon Sandalwood essence and UV filters to refresh strands with warm, woody serenity.',
        full_description: 'Impart a captivating, long-lasting scent ritual to your hair. SUSÁMÁ Hair Perfume Spray in Sandalwood features an alcohol-gentle formula blended with rich Ceylon sandalwood oil, creamy amber, and hydrolysed silk to protect strands against environmental odors while giving hair a radiant glow.',
        ingredients: 'Aqua, Plant-Derived Alcohol Denat., Santalum Album Oil, PEG-40 Hydrogenated Castor Oil, Glycerin, Hydrolyzed Silk, Benzophenone-4 (UV Filter), Fragrance, Amber Resin Extract.',
        how_to_use: 'Hold spray bottle 20 cm from hair and mist evenly across dry locks. Reapply whenever a fragrance refresher is desired.',
        base_price: 4500.00,
        sale_price: 3950.00,
        stock_quantity: 50,
        is_in_stock: true,
        is_featured: true,
        is_new_arrival: true,
        is_active: true,
        image_url: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=800&auto=format&fit=crop'
    },
    {
        id: 'p1000000-0000-4000-8000-000000000008',
        category_id: 'c1000000-0000-4000-8000-000000000005',
        name: 'SUSÁMÁ Hair Perfume Spray – Rose',
        slug: 'susama-hair-perfume-spray-rose',
        sku: 'SUS-MIST-ROSE-100',
        short_description: 'Delicate botanical hair mist with Damask Rose petals and antioxidant green tea to envelop hair in fresh, romantic floral notes.',
        full_description: 'Spritz your hair with the elegance of freshly bloomed roses. SUSÁMÁ Hair Perfume Spray in Rose infuses organic Damask rose water and antioxidant green tea extract to refresh cuticles, provide subtle shine, and leave a graceful, lingering floral bouquet throughout the day.',
        ingredients: 'Aqua, Rosa Damascena Flower Water, Plant Alcohol, Camellia Sinensis Leaf Extract, Panthenol, PEG-40 Hydrogenated Castor Oil, Rose Petal Extract, Musk Aroma, Ethylhexyl Methoxycinnamate.',
        how_to_use: 'Spray gently across styled dry hair from an arm’s length away for an immediate scent and shine boost.',
        base_price: 4500.00,
        sale_price: 3950.00,
        stock_quantity: 50,
        is_in_stock: true,
        is_featured: true,
        is_new_arrival: true,
        is_active: true,
        image_url: 'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?q=80&w=800&auto=format&fit=crop'
    }
];
async function seedDatabase() {
    const connection = await db_1.pool.getConnection();
    try {
        console.log('🌱 Starting full database seed for SUSÁMÁ Hair Care...');
        await connection.beginTransaction();
        // 1. Clear existing products & categories to prevent orphaned or stale data
        console.log('Cleaning existing product images, products, and categories...');
        await connection.execute('DELETE FROM product_images');
        await connection.execute('DELETE FROM order_items');
        await connection.execute('DELETE FROM products');
        await connection.execute('DELETE FROM categories');
        // 2. Insert Categories
        console.log('Inserting Categories...');
        for (const cat of exports.CATEGORIES_SEED) {
            await connection.execute(`INSERT INTO categories (id, name, slug, description, image_url, sort_order, is_active)
         VALUES (?, ?, ?, ?, ?, ?, TRUE)`, [cat.id, cat.name, cat.slug, cat.description, cat.image_url, cat.sort_order]);
            console.log(`  ✓ Category: ${cat.name} (${cat.slug})`);
        }
        // 3. Insert Products & Images
        console.log('\nInserting Products & Images...');
        for (const prod of exports.PRODUCTS_SEED) {
            await connection.execute(`INSERT INTO products (
           id, category_id, name, slug, sku, short_description, full_description, 
           ingredients, how_to_use, base_price, sale_price, stock_quantity, 
           is_in_stock, is_featured, is_new_arrival, is_active
         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
                prod.id,
                prod.category_id,
                prod.name,
                prod.slug,
                prod.sku,
                prod.short_description,
                prod.full_description,
                prod.ingredients,
                prod.how_to_use,
                prod.base_price,
                prod.sale_price,
                prod.stock_quantity,
                prod.is_in_stock,
                prod.is_featured,
                prod.is_new_arrival,
                prod.is_active
            ]);
            // Primary product image
            await connection.execute(`INSERT INTO product_images (id, product_id, image_url, sort_order, is_primary)
         VALUES (UUID(), ?, ?, 0, TRUE)`, [prod.id, prod.image_url]);
            console.log(`  ✓ Product: ${prod.name} [SKU: ${prod.sku}]`);
        }
        await connection.commit();
        console.log('\n✅ Database seeded successfully with all categories and products!');
        // Verify Counts
        const [catCount] = await db_1.pool.query('SELECT COUNT(*) as count FROM categories');
        const [prodCount] = await db_1.pool.query('SELECT COUNT(*) as count FROM products');
        const [imgCount] = await db_1.pool.query('SELECT COUNT(*) as count FROM product_images');
        console.log(`📊 Summary in Database:
  • Categories: ${catCount[0].count}
  • Products: ${prodCount[0].count}
  • Images: ${imgCount[0].count}`);
    }
    catch (error) {
        await connection.rollback();
        console.error('❌ Database seeding failed:', error);
    }
    finally {
        connection.release();
        await db_1.pool.end();
    }
}
seedDatabase();
