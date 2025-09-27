import api from './api';
import axios from 'axios'; // Import axios for direct file upload to signed URL

class SensayFileService {
  async requestSignedUrlForUpload(filename, filetype, title = null) {
    try {
      const response = await api.post('/sensay-files/admin/knowledge-files/request-upload', {
        filename,
        filetype,
        title,
      });
      if (response.data.success) {
        return response.data.data;
      }
    } catch (error) {
      console.error('❌ Failed to request signed URL:', error.response?.data || error.message);
      throw new Error(error.response?.data?.error || 'Failed to request signed URL');
    }
  }

  async uploadFileToSignedUrl(signedURL, file, contentType) {
    try {
      // Use raw axios for direct file upload, without our interceptors
      const response = await axios.put(signedURL, file, {
        headers: {
          'Content-Type': contentType,
        },
        maxBodyLength: Infinity,
        maxContentLength: Infinity,
      });
      if (response.status === 200) { // Sensay's signed URL usually returns 200 on success
        console.log('✅ File uploaded to Sensay signed URL successfully.');
        return { success: true };
      }
    } catch (error) {
      console.error('❌ Failed to upload file to signed URL:', error.response?.data || error.message);
      throw new Error(error.response?.data?.error || 'Failed to upload file');
    }
  }

  async getAllKnowledgeBaseEntries() {
    try {
      const response = await api.get('/sensay-files/admin/knowledge-files/all');
      if (response.data.success) {
        return response.data.data;
      }
    } catch (error) {
      console.error('❌ Failed to fetch all knowledge base entries:', error.response?.data || error.message);
      throw new Error(error.response?.data?.error || 'Failed to fetch knowledge entries');
    }
  }

  async getKnowledgeBaseEntryStatus(knowledgeBaseID) {
    try {
      const response = await api.get(`/sensay-files/admin/knowledge-files/${knowledgeBaseID}/status`);
      if (response.data.success) {
        return response.data.data;
      }
    } catch (error) {
      console.error(`❌ Failed to fetch status for knowledge base entry ${knowledgeBaseID}:`, error.response?.data || error.message);
      throw new Error(error.response?.data?.error || 'Failed to fetch entry status');
    }
  }

  async deleteKnowledgeBaseEntry(knowledgeBaseID) {
    try {
      const response = await api.delete(`/sensay-files/admin/knowledge-files/${knowledgeBaseID}`);
      if (response.data.success) {
        console.log('✅ Knowledge base entry deleted:', knowledgeBaseID);
        return response.data.data;
      }
    } catch (error) {
      console.error(`❌ Failed to delete knowledge base entry ${knowledgeBaseID}:`, error.response?.data || error.message);
      throw new Error(error.response?.data?.error || 'Failed to delete entry');
    }
  }

  async updateKnowledgeBaseEntry(knowledgeBaseID, content, title = null) {
    try {
      const response = await api.patch(`/sensay-files/admin/knowledge-files/${knowledgeBaseID}`, {
        content,
        title,
      });
      if (response.data.success) {
        console.log('✅ Knowledge base entry updated:', knowledgeBaseID);
        return response.data.data;
      }
    } catch (error) {
      console.error(`❌ Failed to update knowledge base entry ${knowledgeBaseID}:`, error.response?.data || error.message);
      throw new Error(error.response?.data?.error || 'Failed to update entry');
    }
  }
}

export default new SensayFileService();
