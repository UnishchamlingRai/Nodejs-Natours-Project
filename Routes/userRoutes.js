const express = require('express');
const usersControllers = require('./../controllers/userControllers');
const authControllers = require('./../controllers/authControllers');
const router = express.Router();

router.post('/signup', authControllers.signup);
router.post('/login', authControllers.login);
router.post('/forgetPassword', authControllers.forgetPassword);
router.patch('/resetPassword/:id', authControllers.resetPassword);
router.patch(
  '/updateMyPassword',
  authControllers.protect,
  authControllers.updateMyPassword
);
router.patch('/updateMe', authControllers.protect, usersControllers.updateMe);
router.delete('/deleteMe', authControllers.protect, usersControllers.deleteMe);

router
  .route('/')
  .get(usersControllers.getAllUsers)
  .post(usersControllers.createUser);
router
  .route('/:id')
  .get(usersControllers.getOneUser)
  .patch(usersControllers.updateUser)
  .delete(usersControllers.deleteUser);

module.exports = router;
