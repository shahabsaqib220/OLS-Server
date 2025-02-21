const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth-middleware');

const { user_filtered_ads, user_add_to_cart_item,getting_users_cart_items, user_delete_cart_item,navigate_user_cart_item, user_other_related_category, search_listing } = require("./router");


router.get('/filtered-ads', user_filtered_ads);
router.post('/user/cart', authMiddleware ,user_add_to_cart_item);
router.get('/cart/items', authMiddleware ,getting_users_cart_items);
router.delete('/cart/:itemId', authMiddleware ,user_delete_cart_item);

router.get('/adId/:cartId',navigate_user_cart_item);



router.get('/search',search_listing);


router.get('/product/:category',user_other_related_category);





module.exports = router;