const express = require('express');
const sensayService = require('../services/sensayService');
const { verifyAdmin } = require('../middleware/auth');
const router = express.Router();

// Request a signed URL from Sensay to upload a file to knowledge base
router.post('/admin/knowledge-files/request-upload', verifyAdmin, async (req, res) => {
  try {
    const { filename, filetype, title } = req.body; // filetype is MIME type

    if (!filename || !filetype) {
      return res.status(400).json({ success: false, error: 'Filename and filetype are required' });
    }

    const result = await sensayService.addFileKnowledge(req.user._id, filename, filetype, title);

    res.json({
      success: true,
      message: 'Signed URL generated for file upload',
      data: result
    });
  } catch (error) {
    if (error.message === 'Insufficient balance') {
      return res.status(402).json({ success: false, error: 'Insufficient Sensay balance', details: error.message });
    }
    console.error('❌ Failed to request signed URL for knowledge file:', error);
    res.status(500).json({ success: false, error: 'Failed to request signed URL', details: error.message });
  }
});

// Get all knowledge base entries (for admin management)
router.get('/admin/knowledge-files/all', verifyAdmin, async (req, res) => {
  try {
    const result = await sensayService.getAllKnowledgeBaseEntries();
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('❌ Failed to get all knowledge base entries for admin:', error);
    res.status(500).json({ success: false, error: 'Failed to get knowledge entries', details: error.message });
  }
});

// Get status of a specific knowledge base entry
router.get('/admin/knowledge-files/:knowledgeBaseID/status', verifyAdmin, async (req, res) => {
  try {
    const { knowledgeBaseID } = req.params;
    const result = await sensayService.getKnowledgeBaseEntryStatus(knowledgeBaseID);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error(`❌ Failed to get status for knowledge base entry ${knowledgeBaseID}:`, error);
    res.status(500).json({ success: false, error: 'Failed to get knowledge entry status', details: error.message });
  }
});


// Delete a knowledge base entry
router.delete('/admin/knowledge-files/:knowledgeBaseID', verifyAdmin, async (req, res) => {
  try {
    const { knowledgeBaseID } = req.params;
    const result = await sensayService.deleteKnowledge(req.user._id, knowledgeBaseID);
    res.json({ success: true, message: 'Knowledge base entry deleted from Sensay AI', data: result });
  } catch (error) {
    if (error.message === 'Insufficient balance') {
      return res.status(402).json({ success: false, error: 'Insufficient Sensay balance', details: error.message });
    }
    console.error(`❌ Failed to delete knowledge base entry ${knowledgeBaseID}:`, error);
    res.status(500).json({ success: false, error: 'Failed to delete knowledge base entry', details: error.message });
  }
});

// Update a knowledge base entry (PATCH method for partial update)
router.patch('/admin/knowledge-files/:knowledgeBaseID', verifyAdmin, async (req, res) => {
  try {
    const { knowledgeBaseID } = req.params;
    const { content, title } = req.body;

    if (!content) {
      return res.status(400).json({ success: false, error: 'Content is required for update' });
    }

    const result = await sensayService.updateKnowledge(req.user._id, knowledgeBaseID, content, 'manual_update'); // Assuming 'manual_update' type
    res.json({ success: true, message: 'Knowledge base entry updated in Sensay AI', data: result });
  } catch (error) {
    if (error.message === 'Insufficient balance') {
      return res.status(402).json({ success: false, error: 'Insufficient Sensay balance', details: error.message });
    }
    console.error(`❌ Failed to update knowledge base entry ${knowledgeBaseID}:`, error);
    res.status(500).json({ success: false, error: 'Failed to update knowledge base entry', details: error.message });
  }
});


module.exports = router;
