const express = require('express');
const router = express.Router();
const { allads, userpostads, upload, useradstable, usereditads, deleteuserad } = require('./users-ads-router'); // Ensure correct path

const authMiddleware = require('../middlewares/auth-middleware'); // Your authentication middleware

router.post('/postads', authMiddleware, upload.array('images', 5), userpostads);



router.get('/myads', authMiddleware, useradstable);

router.delete('/deletead/:id', authMiddleware, deleteuserad); // Example for deleting ads

router.get('/edit/user/ad/:id', authMiddleware, usereditads);

router.get('/ads', allads); // Example for fetching ads

module.exports = router;
