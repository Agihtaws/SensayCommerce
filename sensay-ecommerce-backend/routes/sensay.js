const express = require('express');
const sensayService = require('../services/sensayService');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

const router = express.Router();

// Get Sensay system status
router.get('/status', async (req, res) => {
  try {
    const status = await sensayService.getSystemStatus();
    
    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get system status',
      details: error.message
    });
  }
});

// Reinitialize Sensay system (Admin only)
router.post('/reinitialize', verifyAdmin, async (req, res) => {
  try {
    const result = await sensayService.reinitializeSystem(req.user._id);
    
    res.json({
      success: true,
      message: 'System reinitialized successfully',
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to reinitialize system',
      details: error.message
    });
  }
});

// Add knowledge (Admin only)
router.post('/knowledge', verifyAdmin, async (req, res) => {
  try {
    const { content, contentType } = req.body;
    
    if (!content) {
      return res.status(400).json({
        success: false,
        error: 'Content is required'
      });
    }

    const result = await sensayService.addKnowledge(req.user._id, content, contentType);
    
    res.json({
      success: true,
      message: 'Knowledge added successfully',
      data: result
    });
  } catch (error) {
    if (error.message === 'Insufficient balance') {
      return res.status(402).json({
        success: false,
        error: 'Insufficient Sensay balance',
        details: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to add knowledge',
      details: error.message
    });
  }
});

// Update knowledge (Admin only)
router.put('/knowledge/:knowledgeId', verifyAdmin, async (req, res) => {
  try {
    const { knowledgeId } = req.params;
    const { content, contentType } = req.body;
    
    if (!content) {
      return res.status(400).json({
        success: false,
        error: 'Content is required'
      });
    }

    const result = await sensayService.updateKnowledge(req.user._id, knowledgeId, content, contentType);
    
    res.json({
      success: true,
      message: 'Knowledge updated successfully',
      data: result
    });
  } catch (error) {
    if (error.message === 'Insufficient balance') {
      return res.status(402).json({
        success: false,
        error: 'Insufficient Sensay balance',
        details: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to update knowledge',
      details: error.message
    });
  }
});

// Delete knowledge (Admin only)
router.delete('/knowledge/:knowledgeId', verifyAdmin, async (req, res) => {
  try {
    const { knowledgeId } = req.params;

    const result = await sensayService.deleteKnowledge(req.user._id, knowledgeId);
    
    res.json({
      success: true,
      message: 'Knowledge deleted successfully',
      data: result
    });
  } catch (error) {
    if (error.message === 'Insufficient balance') {
      return res.status(402).json({
        success: false,
        error: 'Insufficient Sensay balance',
        details: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to delete knowledge',
      details: error.message
    });
  }
});

// Chat completion
router.post('/chat', verifyToken, async (req, res) => {
  try {
    const { message, context } = req.body;
    
    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'Message is required'
      });
    }

    const result = await sensayService.chatCompletion(req.user._id, message, context || {});
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    if (error.message === 'Insufficient balance') {
      return res.status(402).json({
        success: false,
        error: 'Insufficient Sensay balance',
        details: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Chat completion failed',
      details: error.message
    });
  }
});

// Anonymous chat (no authentication required, uses admin balance)
router.post('/chat/anonymous', async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'Message is required'
      });
    }

    // Use admin user for anonymous chats (system cost)
    const adminUser = await require('../models/User').findOne({ role: 'admin' });
    if (!adminUser) {
      return res.status(500).json({
        success: false,
        error: 'System not properly configured'
      });
    }

    const result = await sensayService.chatCompletion(adminUser._id, message, {
      isAnonymous: true,
      userType: 'anonymous'
    });
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    if (error.message === 'Insufficient balance') {
      return res.status(402).json({
        success: false,
        error: 'System temporarily unavailable',
        details: 'Please try again later'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Chat completion failed',
      details: error.message
    });
  }
});

// Get chat history
router.get('/chat/history', verifyToken, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const result = await sensayService.getChatHistory(req.user._id, limit);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    if (error.message === 'Insufficient balance') {
      return res.status(402).json({
        success: false,
        error: 'Insufficient Sensay balance',
        details: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to get chat history',
      details: error.message
    });
  }
});

module.exports = router;
