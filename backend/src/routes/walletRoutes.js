import express from 'express';
import db from '../db/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get Wallet Balance & Transaction History
router.get('/', authenticateToken, (req, res) => {
  try {
    const wallet = db.getWallet(req.user.id);
    return res.json({ success: true, wallet });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve wallet details' });
  }
});

// Top-up Simulated Wallet Balance (UPI / Card / NetBanking simulation)
router.post('/topup', authenticateToken, (req, res) => {
  try {
    const { amount, payment_method } = req.body;
    const numAmount = Number(amount);

    if (!numAmount || numAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Please enter a valid top-up amount' });
    }

    if (numAmount > 50000) {
      return res.status(400).json({ success: false, message: 'Maximum single recharge limit is ₹50,000' });
    }

    const wallet = db.topupWallet(req.user.id, numAmount);

    db.createNotification({
      user_id: req.user.id,
      type: 'WALLET_TOPUP',
      title: 'Wallet Recharged! 💳',
      message: `Successfully credited ₹${numAmount} to your wallet balance via ${payment_method || 'Simulated UPI'}.`,
      link_url: '/wallet'
    });

    return res.json({
      success: true,
      message: `Successfully added ₹${numAmount} to wallet!`,
      wallet
    });
  } catch (err) {
    console.error('Wallet topup error:', err);
    return res.status(500).json({ success: false, message: 'Top-up failed' });
  }
});

export default router;
