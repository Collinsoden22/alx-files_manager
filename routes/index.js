const express = require('express');
// App Controller Endpoint
const AppController = require('../controllers/AppController');
// New User Controller Endpoint
const UsersController = require('../controllers/UsersController');
// New Auth Controller Endpoint
const UsersController = require('../controllers/AuthController');
// New File Controller Endpoint
const FilesController = require('../controllers/FilesController');


const router = express.Router();

router.get('/status', AppController.getStatus);
router.get('/stats', AppController.getStats);
router.post('/users', UsersController.postNew);

router.get('/connect', AuthController.getConnect);
router.get('/disconnect', AuthController.getDisconnect);
router.get('/users/me', UserController.getMe);


router.post('/files', FilesController.postUpload);


router.get('/files/:id', FilesController.getShow);

router.get('/files', FilesController.getIndex);

router.put('/files/:id/publish', FilesController.putPublish);

router.put('/files/:id/unpublish', FilesController.putUnpublish);

router.get('/files/:id/data', FilesController.getFile);


module.exports = router;
