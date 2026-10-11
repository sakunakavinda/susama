"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const reviewController_1 = require("../controllers/reviewController");
const router = (0, express_1.Router)();
// Overall brand reviews & math calculation
router.get('/overall', reviewController_1.getOverallReviews);
router.post('/overall', reviewController_1.createOverallReview);
// Product reviews & per-product rating math
router.get('/product/:productId', reviewController_1.getProductReviews);
router.post('/product', reviewController_1.createProductReview);
// General reviews endpoints
router.get('/', reviewController_1.getReviews);
router.post('/', reviewController_1.createReview);
exports.default = router;
