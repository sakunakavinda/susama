"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const newsletterController_1 = require("../controllers/newsletterController");
const router = (0, express_1.Router)();
// POST /api/newsletter/subscribe - Subscribe to newsletter
router.post('/subscribe', newsletterController_1.subscribe);
// GET /api/newsletter/subscribers - Get subscriber list (admin/internal)
router.get('/subscribers', newsletterController_1.getSubscribers);
// POST /api/newsletter/unsubscribe - Unsubscribe from newsletter
router.post('/unsubscribe', newsletterController_1.unsubscribe);
exports.default = router;
