const express = require('express');

const usersControllers = require('./../controllers/userControllers');
const authControllers = require('./../controllers/authControllers');

const router = express.Router();

router.post('/signup', authControllers.signup);
router.post('/login', authControllers.login);
router.get('/logOut', authControllers.logOut);
router.post('/forgetPassword', authControllers.forgetPassword);
router.patch('/resetPassword/:id', authControllers.resetPassword);

//Protect All routes After this Middleware
router.use(authControllers.protect);
router.patch('/updateMyPassword', authControllers.updateMyPassword);
router.get('/me', usersControllers.getMe, usersControllers.getOneUser);
router.patch(
  '/updateMe',
  usersControllers.uploadUserPhoto,
  usersControllers.resizeUserPhoto,
  usersControllers.updateMe
);
router.delete('/deleteMe', usersControllers.deleteMe);

//Restict All routes after this Middleware
router.use(authControllers.restrictTo('admin'));
router.route('/').get(usersControllers.getAllUsers);
router
  .route('/:id')
  .get(usersControllers.getOneUser)
  .patch(usersControllers.updateUser)
  .delete(usersControllers.deleteUser);

module.exports = router;
