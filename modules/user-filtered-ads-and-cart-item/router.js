

// routes/ads.js
const express = require('express');

const Ad = require('../user-ads/users-ads-model'); 
const connectDB = require('../../db');
const Cart = require("../user-filtered-ads-and-cart-item/user-add-to-cart-item-model");
connectDB();

const user_filtered_ads = async (req, res) => {
  try {
    const { category, minPrice, maxPrice, location } = req.query;

    const filterCriteria = {
      ...(category && { category }),
      ...(location && { 'location.readable': location }),
      ...(minPrice && maxPrice && { price: { $gte: parseInt(minPrice), $lte: parseInt(maxPrice) } })
    };

    const ads = await Ad.find(filterCriteria);

    const uniqueCategories = await Ad.distinct('category');
    const uniqueLocations = await Ad.distinct('location.readable');

    res.json({
      ads,
      categories: uniqueCategories,
      locations: uniqueLocations,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const user_add_to_cart_item = async (req, res) => {
  const { adId, quantity = 1 } = req.body;
  const userId = req.userId;

  try {
    const ad = await Ad.findById(adId);
    if (!ad) {
      return res.status(404).json({ message: "Ad not found" });
    }

    const images = Array.isArray(ad.images)
      ? ad.images.map((image) => ({ url: image, alt: "Image description" }))
      : [{ url: ad.images, alt: "Image description" }];

    let cartItem = await Cart.findOne({ userId, adId });

    if (cartItem) {
      cartItem.quantity += quantity;

    
      const currentAd = await Ad.findById(adId);
      if (currentAd.adStatus !== cartItem.adStatus) {
        console.log(`Updating cart item adStatus from ${cartItem.adStatus} to ${currentAd.adStatus}`);
        cartItem.adStatus = currentAd.adStatus; 
      }

      await cartItem.save();
    } else {
      cartItem = new Cart({
        userId,
        adId,
        adDetails: {
          category: ad.category,
          brand: ad.brand,
          model: ad.model,
          price: ad.price,
          description: ad.description,
          MobilePhone: ad.MobilePhone,
          condition: ad.condition,
          location: ad.location,
          images: images,
        },
        quantity,
        adStatus: ad.adStatus, // Set initial adStatus from the ad
      });
      await cartItem.save();
    }

    res.status(201).json({ message: "Item added to cart successfully", cartItem, adId: ad._id }); // Include adId in the response
  } catch (error) {
    console.error("Error adding item to cart:", error);
    res.status(500).json({ message: "Error adding item to cart", error });
  }
};


const getting_users_cart_items = async (req, res) => {
  const userId = req.userId; // Get userId from the authentication middleware

  try {
    // Find the cart items and populate the ad details, excluding deleted ads
    const cartItems = await Cart.find({ userId }).populate('adId');

    // Filter out cart items where the associated ad is deleted
    const validCartItems = cartItems.filter(cartItem => {
      const ad = cartItem.adId;
      return ad && ad.adStatus !== "deleted"; // Only keep items with ads that are not deleted
    });

    if (!validCartItems || validCartItems.length === 0) {
      return res.status(404).json({ message: "No cart items found" });
    }

    // Iterate over valid cart items to construct the response
    const updatedCartItems = await Promise.all(validCartItems.map(async (cartItem) => {
      const ad = cartItem.adId; // Access ad details populated by 'populate'
      const adStatus = ad ? ad.adStatus : "deleted"; // Determine the ad status

      // Construct the response for each cart item
      return {
        _id: cartItem._id, // Include the cart item ID
        adId: ad ? ad._id : null, // Include adId if it exists
        adDetails: ad ? {
          model: ad.model,
          condition: ad.condition,
          price: ad.price,
          location: ad.location,
          images: ad.images // Ensure images are included
        } : {}, // Return an empty object if ad does not exist
        adStatus: adStatus // Include updated ad status
      };
    }));

    res.json(updatedCartItems); // Send the updated cart items
  } catch (error) {
    res.status(500).json({ message: "Error fetching cart items", error });
  }
}



const user_delete_cart_item = async (req, res) => {

  try {
    const userId = req.userId; // Ensure this matches your auth middleware
    const { itemId } = req.params;

    // Find the cart item with the userId and itemId
    const cartItem = await Cart.findOne({ _id: itemId, userId: userId });

    // Check if the cart item exists and belongs to the user
    if (!cartItem) {
      return res.status(404).json({ message: 'Cart item not found or not authorized' });
    }

    // Delete the cart item
    await Cart.deleteOne({ _id: itemId, userId: userId });

    return res.status(200).json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Error deleting cart item:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};


const navigate_user_cart_item = async (req, res) => {
  try {
    // Get the cart ID from the request parameters
    const cartId = req.params.cartId;

    // Find the adId in the specific cart item
    const cart = await Cart.findOne({ _id: cartId });

    // Check if the cart is found
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    // Return the adId
    return res.json({ adId: cart.adId });
  } catch (error) {
    console.error('Error fetching adId:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};



const user_other_related_category = async (req, res) => {
  try {
    // Fetch all ads filtered by category and ensure adStatus is "available"
    const products = await Ad.find({ 
      category: req.params.category,
      adStatus: "available" // Ensure only "available" ads are returned
    });

    // Return the fetched products
    res.json(products);
  } catch (error) {
    console.error("Error fetching related ads:", error); // Log error for debugging
    res.status(500).json({ message: 'Error fetching related ads' });
  }
};











module.exports = {user_filtered_ads, user_add_to_cart_item, getting_users_cart_items, user_delete_cart_item, navigate_user_cart_item,user_other_related_category }
