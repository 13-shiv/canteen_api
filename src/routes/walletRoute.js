const router = require('express').Router();
const { authenticate, authorize } = require('../middleware/auth');
const {
  topup,
  getBalance,
  getAllTransactions,
  payOrder,
} = require('../controllers/walletController');

// POST /api/wallet/topup — Admin + Supervisor
router.post('/topup', authenticate, authorize(['admin', 'supervisor']), topup);

// GET /api/wallet/balance 
// router.get('/balance', authenticate, getBalance);

// // GET /api/wallet/transactions — History dekho
// router.get( '/transactions', authenticate, getAllTransactions);

// // POST /api/wallet/pay — Order payment
// router.post('/pay', authenticate, authorize(['admin', 'supervisor', 'counter']), payOrder);

module.exports = router;