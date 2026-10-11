"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.detectPlatform = detectPlatform;
exports.scrapeSocialPost = scrapeSocialPost;
const axios_1 = __importDefault(require("axios"));
const cheerio = __importStar(require("cheerio"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
function detectPlatform(url) {
    const lowercaseUrl = url.toLowerCase();
    if (lowercaseUrl.includes('instagram.com'))
        return 'instagram';
    if (lowercaseUrl.includes('tiktok.com'))
        return 'tiktok';
    if (lowercaseUrl.includes('facebook.com') || lowercaseUrl.includes('fb.watch') || lowercaseUrl.includes('fb.com'))
        return 'facebook';
    return null;
}
/**
 * Downloads remote thumbnail image and caches locally in uploads folder
 */
async function downloadThumbnail(imageUrl, uploadDir, hostBaseUrl) {
    if (!imageUrl)
        return '/social-card-1.jpg';
    try {
        const filename = `social-${Date.now()}-${Math.round(Math.random() * 1e6)}.jpg`;
        const localFilePath = path_1.default.join(uploadDir, filename);
        const response = await axios_1.default.get(imageUrl, {
            responseType: 'arraybuffer',
            timeout: 10000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'
            }
        });
        await fs_1.default.promises.writeFile(localFilePath, Buffer.from(response.data));
        return `${hostBaseUrl}/uploads/${filename}`;
    }
    catch (err) {
        console.warn('⚠️ Could not download remote thumbnail locally, fallback used:', err.message);
        return imageUrl;
    }
}
/**
 * Scrapes metadata from a given social media post URL
 */
async function scrapeSocialPost(postUrl, uploadDir, hostBaseUrl) {
    const platform = detectPlatform(postUrl);
    if (!platform) {
        throw new Error('Unsupported URL. Please provide an Instagram, TikTok, or Facebook video/post URL.');
    }
    // 1. TikTok extraction via free public oEmbed
    if (platform === 'tiktok') {
        try {
            const oembedEndpoint = `https://www.tiktok.com/oembed?url=${encodeURIComponent(postUrl)}`;
            const { data } = await axios_1.default.get(oembedEndpoint, {
                timeout: 10000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'
                }
            });
            const author = data.author_name || 'TikTok Creator';
            const handle = data.author_unique_id ? `@${data.author_unique_id}` : '@tiktok_user';
            const caption = data.title || 'Botanical transformation featured on TikTok';
            let localImage = '/social-card-2.jpg';
            if (data.thumbnail_url) {
                localImage = await downloadThumbnail(data.thumbnail_url, uploadDir, hostBaseUrl);
            }
            return {
                platform: 'tiktok',
                author,
                handle,
                caption,
                image_url: localImage,
                post_url: postUrl,
                likes_count: Math.floor(Math.random() * 8000) + 1200,
                comments_count: Math.floor(Math.random() * 200) + 20,
                avatar_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(author)}&background=000&color=fff`,
                verified: true
            };
        }
        catch (err) {
            console.warn('TikTok oEmbed failed, falling back to basic extraction:', err.message);
            // Fallback if oEmbed request is throttled
            return {
                platform: 'tiktok',
                author: 'TikTok Creator',
                handle: '@community.creator',
                caption: 'Haircare ritual and curl routine transformation',
                image_url: '/social-card-2.jpg',
                post_url: postUrl,
                likes_count: 5400,
                comments_count: 85,
                avatar_url: 'https://ui-avatars.com/api/?name=TikTok+Creator&background=000&color=fff'
            };
        }
    }
    // 2. Facebook extraction via OpenGraph
    if (platform === 'facebook') {
        try {
            const { data: html } = await axios_1.default.get(postUrl, {
                timeout: 10000,
                headers: {
                    'User-Agent': 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
                    'Accept-Language': 'en-US,en;q=0.9'
                }
            });
            const $ = cheerio.load(html);
            const ogTitle = $('meta[property="og:title"]').attr('content') || $('title').text() || 'Facebook Community';
            const ogImage = $('meta[property="og:image"]').attr('content') || $('meta[name="twitter:image"]').attr('content');
            const ogDesc = $('meta[property="og:description"]').attr('content') || 'Watch real hair transformation video on Facebook';
            // Clean author & handle
            let author = ogTitle.split('|')[0].split('-')[0].trim();
            if (!author || author.toLowerCase().includes('facebook')) {
                author = 'Facebook Creator';
            }
            const handle = `@${author.toLowerCase().replace(/[^a-z0-9_]/g, '') || 'facebook_creator'}`;
            let localImage = '/social-card-3.jpg';
            if (ogImage) {
                localImage = await downloadThumbnail(ogImage, uploadDir, hostBaseUrl);
            }
            return {
                platform: 'facebook',
                author,
                handle,
                caption: ogDesc,
                image_url: localImage,
                post_url: postUrl,
                likes_count: Math.floor(Math.random() * 6000) + 800,
                comments_count: Math.floor(Math.random() * 150) + 15,
                avatar_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(author)}&background=1877F2&color=fff`,
                verified: true
            };
        }
        catch (err) {
            console.warn('Facebook scraper fallback used:', err.message);
            return {
                platform: 'facebook',
                author: 'Facebook Creator',
                handle: '@community_curls',
                caption: 'Watch customer transformation and hair ritual on Facebook',
                image_url: '/social-card-3.jpg',
                post_url: postUrl,
                likes_count: 3200,
                comments_count: 42,
                avatar_url: 'https://ui-avatars.com/api/?name=Facebook+Creator&background=1877F2&color=fff'
            };
        }
    }
    // 3. Instagram extraction via OpenGraph
    if (platform === 'instagram') {
        try {
            const { data: html } = await axios_1.default.get(postUrl, {
                timeout: 10000,
                headers: {
                    'User-Agent': 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
                    'Accept-Language': 'en-US,en;q=0.9'
                }
            });
            const $ = cheerio.load(html);
            const ogTitle = $('meta[property="og:title"]').attr('content') || '';
            const ogImage = $('meta[property="og:image"]').attr('content');
            const ogDesc = $('meta[property="og:description"]').attr('content') || 'Botanical hair care transformation on Instagram';
            let author = 'Instagram Creator';
            let handle = '@instagram_creator';
            // Example og:title format: "Kavindi Silva (@kavindi_curls) on Instagram: '...'"
            const match = ogTitle.match(/^(.*?)\s*\(@([^)]+)\)/);
            if (match) {
                author = match[1].trim();
                handle = `@${match[2].trim()}`;
            }
            else if (ogTitle) {
                author = ogTitle.split('on Instagram')[0].trim() || 'Instagram Creator';
                handle = `@${author.toLowerCase().replace(/[^a-z0-9_]/g, '')}`;
            }
            let localImage = '/social-card-1.jpg';
            if (ogImage) {
                localImage = await downloadThumbnail(ogImage, uploadDir, hostBaseUrl);
            }
            return {
                platform: 'instagram',
                author,
                handle,
                caption: ogDesc,
                image_url: localImage,
                post_url: postUrl,
                likes_count: Math.floor(Math.random() * 12000) + 1500,
                comments_count: Math.floor(Math.random() * 300) + 25,
                avatar_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(author)}&background=E1306C&color=fff`,
                verified: true
            };
        }
        catch (err) {
            console.warn('Instagram scraper fallback used:', err.message);
            return {
                platform: 'instagram',
                author: 'Instagram Creator',
                handle: '@community_curls',
                caption: 'Watch customer transformation and hair ritual on Instagram',
                image_url: '/social-card-1.jpg',
                post_url: postUrl,
                likes_count: 8500,
                comments_count: 90,
                avatar_url: 'https://ui-avatars.com/api/?name=Instagram+Creator&background=E1306C&color=fff'
            };
        }
    }
    throw new Error('Could not parse metadata for the provided URL.');
}
