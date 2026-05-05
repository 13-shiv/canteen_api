const router = require('express').Router();
const { authenticate, authorize } = require('../middleware/auth');
const {
  createOrder,
  getAllOrders,
  getMyOrders,
  getOrder,
  updateOrderStatus,
  cancelOrder,
} = require('../controllers/orderController');

// POST   /api/orders              
router.post('/createOrder', authenticate, createOrder);

// // GET    /api/orders             
router.get('/', authenticate, authorize(['admin', 'staff']), getAllOrders);

// // GET    /api/orders/my for customer         
 router.get('/myorder', authenticate, getMyOrders);

// // GET    /api/orders/:id   
router.get('/:id', authenticate, getOrder);

// // PATCH  /api/orders/:id/status   → Status update (admin/staff)
router.patch('/:id/status', authenticate, authorize(['admin', 'staff']), updateOrderStatus);

// // PATCH  /api/orders/:id/cancel   
 router.patch('/:id/cancel', authenticate, cancelOrder);

module.exports = router;