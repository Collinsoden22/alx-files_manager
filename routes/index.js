const express = require('express');
// App Controller Endpoint
const AppController = require('../controllers/AppController');
// New User Endpoint
const UsersController = require('../controllers/UsersController');

const router = express.Router();

router.get('/status', AppController.getStatus);
router.get('/stats', AppController.getStats);
router.post('/users', UsersController.postNew);

module.exports = router;
