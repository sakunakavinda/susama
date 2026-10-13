"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const customerAuthController_1 = require("../controllers/customerAuthController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// Public routes
router.post('/register', customerAuthController_1.registerCustomer);
router.post('/login', customerAuthController_1.loginCustomer);
// Protected routes (require valid JWT)
router.get('/me', authMiddleware_1.verifyCustomerToken, customerAuthController_1.getCustomerProfile);
router.put('/profile', authMiddleware_1.verifyCustomerToken, customerAuthController_1.updateCustomerProfile);
exports.default = router;
