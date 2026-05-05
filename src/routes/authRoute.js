const router = require('express').Router();
const {authenticate,authorize}= require('../middleware/auth');
const authController = require('../controllers/authController');

router.post('/register',authController.register);
router.post('/login',authController.login);
router.get('/profile', authenticate, authController.profile);

module.exports = router;