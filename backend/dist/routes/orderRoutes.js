"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const orderController_1 = require("../controllers/orderController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// Place a new order (accessible to guests and logged-in customers)
router.post('/', authMiddleware_1.optionalCustomerToken, orderController_1.createOrder);
// Retrieve past orders of the authenticated customer
router.get('/my-orders', authMiddleware_1.verifyCustomerToken, orderController_1.getMyOrders);
// Get single order receipt by order number (e.g. SUS-261048)
router.get('/:orderNumber', orderController_1.getOrderByNumber);
exports.default = router;
