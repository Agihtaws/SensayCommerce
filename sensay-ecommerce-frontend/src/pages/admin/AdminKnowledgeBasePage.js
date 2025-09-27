import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import sensayFileService from '../../services/sensayFileService';
import Loading from '../../components/common/Loading';
import {
  UploadCloud,
  FileText,
  File,
  RefreshCw,
  CheckCircle,
  XCircle,
  Activity,
  AlertCircle,
  Trash2,
  Edit,
  Info,
  Link,
} from 'lucide-react';
import toast from 'react-hot-toast';
import '../../styles/AdminKnowledgeBasePage.css';

const AdminKnowledgeBasePage = () => {
  const { user, updateUser } = useAuth();
  const [knowledgeEntries, setKnowledgeEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileTitle, setFileTitle] = useState('');
  const fileInputRef = useRef(null);
  const pollingIntervalsRef = useRef({}); // Stores interval IDs for each knowledge entry

  // Helper to clear a single polling interval
  const clearPollingForEntry = useCallback((knowledgeBaseID) => {
    if (pollingIntervalsRef.current[knowledgeBaseID]) {
      clearInterval(pollingIntervalsRef.current[knowledgeBaseID]);
      delete pollingIntervalsRef.current[knowledgeBaseID];
      console.log(`Polling cleared for entry: ${knowledgeBaseID}`);
    }
  }, []);

  // Function to fetch all knowledge entries
  const fetchKnowledgeEntries = useCallback(async () => {
    setLoading(true);
    try {
      const data = await sensayFileService.getAllKnowledgeBaseEntries();
      setKnowledgeEntries(data.items);
      
      // Start polling for items that are not yet READY/UNPROCESSABLE
      data.items.forEach(entry => {
        if (entry.status && entry.status !== 'READY' && entry.status !== 'UNPROCESSABLE' && entry.status !== 'VECTOR_CREATED') { // Only poll if truly still processing
          // We'll call startPolling here, but define it after this function
          if (window.startPollingRef) {
            window.startPollingRef(entry.id);
          }
        } else {
          clearPollingForEntry(entry.id); // Clear if it's already done
        }
      });
    } catch (error) {
      toast.error(error.message);
      console.error('Failed to fetch knowledge entries:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [clearPollingForEntry]); // Remove startPolling from dependencies

  // Polling function with exponential backoff and retry limit
  const startPolling = useCallback((knowledgeBaseID, initialDelay = 5000, maxRetries = 10) => {
    // If already polling, do nothing
    if (pollingIntervalsRef.current[knowledgeBaseID]) {
      return;
    }

    let retries = 0;
    let currentDelay = initialDelay;

    const poll = async () => {
      if (retries >= maxRetries) {
        clearPollingForEntry(knowledgeBaseID);
        toast.error(`Polling stopped for ${knowledgeBaseID} after max retries.`);
        fetchKnowledgeEntries(); // Refresh to show final status
        return;
      }

      try {
        const { status, entry } = await sensayFileService.getKnowledgeBaseEntryStatus(knowledgeBaseID);
        if (status === 'READY' || status === 'UNPROCESSABLE' || status === 'VECTOR_CREATED') {
          clearPollingForEntry(knowledgeBaseID);
          toast.success(`Knowledge entry ${knowledgeBaseID} is ${status}!`);
          fetchKnowledgeEntries(); // Re-fetch all to update UI
          await updateUser(); // Update balance as processing might deduct units
        } else {
          setKnowledgeEntries(prev => prev.map(item => item.id === knowledgeBaseID ? { ...item, status: status, ...entry } : item));
          retries++;
          currentDelay *= 1.5; // Exponential backoff
        }
      } catch (error) {
        if (error.message.includes('Too many requests')) {
          console.warn(`Rate limit hit for ${knowledgeBaseID}. Retrying with increased delay.`);
          retries++;
          currentDelay *= 2; // More aggressive backoff for rate limits
        } else {
          clearPollingForEntry(knowledgeBaseID);
          toast.error(`Polling error for ${knowledgeBaseID}: ${error.message}`);
          console.error('Polling error:', error);
          fetchKnowledgeEntries(); // Refresh to show error status
        }
      }

      // If polling is still active for this entry, schedule the next one
      if (pollingIntervalsRef.current[knowledgeBaseID]) {
        // Clear previous timeout/interval before setting a new one to prevent accumulation
        clearInterval(pollingIntervalsRef.current[knowledgeBaseID]); 
        pollingIntervalsRef.current[knowledgeBaseID] = setInterval(poll, currentDelay);
      }
    };

    // Set the initial interval and store its ID
    pollingIntervalsRef.current[knowledgeBaseID] = setInterval(poll, currentDelay);
    poll(); // Run immediately for first check
  }, [clearPollingForEntry, fetchKnowledgeEntries, updateUser]);

  // Store startPolling reference globally to break the circular dependency
  useEffect(() => {
    window.startPollingRef = startPolling;
    return () => {
      delete window.startPollingRef;
    };
  }, [startPolling]);

  // Effect to fetch entries on component mount and cleanup
  useEffect(() => {
    fetchKnowledgeEntries();
    return () => {
      Object.values(pollingIntervalsRef.current).forEach(clearInterval);
      pollingIntervalsRef.current = {};
    };
  }, [fetchKnowledgeEntries]);

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
    setFileTitle('');
  };

  const handleUploadFile = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.error('Please select a file to upload.');
      return;
    }

    setUploading(true);
    let knowledgeBaseID; // Declare it here so it's available in the catch block
    
    try {
      const filename = selectedFile.name;
      const filetype = selectedFile.type;
      const title = fileTitle || filename;

      const response = await sensayFileService.requestSignedUrlForUpload(
        filename,
        filetype,
        title
      );
      
      knowledgeBaseID = response.knowledgeBaseID; // Assign it here
      const signedURL = response.signedURL;

      // Add a temporary entry immediately to the list to show "uploading" status
      setKnowledgeEntries(prev => [
        {
          id: knowledgeBaseID,
          type: 'FILE',
          status: 'FILE_UPLOADED',
          title: title,
          fileName: filename,
          createdAt: new Date().toISOString(),
        },
        ...prev
      ]);
      
      await sensayFileService.uploadFileToSignedUrl(signedURL, selectedFile, filetype);

      toast.success(`File "${filename}" uploaded to Sensay! Processing will start shortly.`);
      setSelectedFile(null);
      setFileTitle('');
      if (fileInputRef.current) fileInputRef.current.value = '';

      startPolling(knowledgeBaseID); // Start polling for this new entry

      await updateUser(); 
    } catch (error) {
      toast.error(error.message || 'Failed to upload file to Sensay.');
      console.error('File upload error:', error);
      
      // Only remove temp entry if knowledgeBaseID was successfully created
      if (knowledgeBaseID) {
        setKnowledgeEntries(prev => prev.filter(entry => entry.id !== knowledgeBaseID));
      }
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteEntry = async (knowledgeBaseID, title) => {
    if (!window.confirm(`Are you sure you want to delete knowledge entry "${title}"? This cannot be undone.`)) {
      return;
    }
    setLoading(true);
    try {
      await sensayFileService.deleteKnowledgeBaseEntry(knowledgeBaseID);
      toast.success(`Knowledge entry "${title}" deleted successfully.`);
      clearPollingForEntry(knowledgeBaseID); // Stop polling if deleted
      fetchKnowledgeEntries();
      await updateUser();
    } catch (error) {
      toast.error(error.message || 'Failed to delete knowledge entry.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'READY':
      case 'VECTOR_CREATED':
        return <span className="knowledge-status-badge knowledge-status-ready"><CheckCircle className="knowledge-status-icon" />Ready</span>;
      case 'FILE_UPLOADED':
      case 'RAW_TEXT':
      case 'PROCESSED_TEXT':
        return <span className="knowledge-status-badge knowledge-status-processing"><Activity className="knowledge-status-icon spinner" />Processing</span>;
      case 'UNPROCESSABLE':
        return <span className="knowledge-status-badge knowledge-status-error"><XCircle className="knowledge-status-icon" />Unprocessable</span>;
      default:
        return <span className="knowledge-status-badge knowledge-status-pending"><Info className="knowledge-status-icon" />Pending</span>;
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'TEXT': return <FileText className="knowledge-type-icon knowledge-type-text" />;
      case 'FILE': return <File className="knowledge-type-icon knowledge-type-file" />;
      case 'WEBSITE': return <Link className="knowledge-type-icon knowledge-type-website" />;
      case 'YOUTUBE': return <Link className="knowledge-type-icon knowledge-type-youtube" />;
      default: return <File className="knowledge-type-icon knowledge-type-default" />;
    }
  };

  if (loading) {
    return <Loading text="Loading knowledge base..." />;
  }

  return (
    <div className="knowledge-base-page">
      <h1 className="knowledge-base-title">Sensay Knowledge Base</h1>

      {/* File Upload Section */}
      <div className="knowledge-upload-card">
        <h2 className="knowledge-upload-title">Upload New Knowledge File</h2>
        <form onSubmit={handleUploadFile} className="knowledge-upload-form">
          <div>
            <label htmlFor="file-upload" className="knowledge-upload-label">Select File (PDF, TXT, CSV)</label>
            <div className="knowledge-upload-area">
              <div className="knowledge-upload-content">
                <UploadCloud className="knowledge-upload-icon" />
                <div className="knowledge-upload-text">
                  <label
                    htmlFor="file-upload"
                    className="knowledge-upload-button"
                  >
                    <span>Upload a file</span>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      className="sr-only"
                      accept=".pdf,.txt,.csv"
                      onChange={handleFileChange}
                      ref={fileInputRef}
                    />
                  </label>
                  <p className="knowledge-upload-drag">or drag and drop</p>
                </div>
                <p className="knowledge-upload-hint">PDF, TXT, CSV up to 50MB</p>
                {selectedFile && <p className="knowledge-selected-file">Selected: {selectedFile.name}</p>}
              </div>
            </div>
          </div>
          <div>
            <label htmlFor="fileTitle" className="form-label">Title (optional, for display)</label>
            <input
              type="text"
              id="fileTitle"
              value={fileTitle}
              onChange={(e) => setFileTitle(e.target.value)}
              placeholder="e.g., Company Return Policy"
              className="form-input"
            />
          </div>
          <button
            type="submit"
            disabled={uploading || !selectedFile}
            className="btn btn-primary"
          >
            {uploading ? (
              <div className="loading-spinner loading-medium"></div>
            ) : (
              <>
                <UploadCloud className="btn-icon" />
                Upload to Sensay
              </>
            )}
          </button>
        </form>
      </div>

      {/* Existing Knowledge Base Entries */}
      <div className="knowledge-entries-card">
        <div className="knowledge-entries-header">
          <h2 className="knowledge-entries-title">Existing Knowledge Base Entries</h2>
          <button
            onClick={fetchKnowledgeEntries}
            disabled={refreshing}
            className="btn btn-secondary"
          >
            <RefreshCw className={`btn-icon \${refreshing ? 'spinner' : ''}`} />
            Refresh List
          </button>
        </div>

        {knowledgeEntries.length === 0 ? (
          <div className="knowledge-empty-state">No knowledge base entries found.</div>
        ) : (
          <div className="knowledge-entries-list">
            <ul className="knowledge-entries-ul">
              {knowledgeEntries.map((entry) => (
                <li key={entry.id} className="knowledge-entry-item">
                  <div className="knowledge-entry-content">
                    <div className="knowledge-entry-icon">
                      {getTypeIcon(entry.type)}
                    </div>
                    <div className="knowledge-entry-details">
                      <p className="knowledge-entry-title">
                        {entry.title || entry.fileName || `Entry ID: ${entry.id}`}
                      </p>
                      <p className="knowledge-entry-meta">
                        Type: {entry.type} • Status: {entry.status}
                      </p>
                      {entry.status === 'UNPROCESSABLE' && entry.error && (
                        <p className="knowledge-entry-error">Error: {entry.error}</p>
                      )}
                    </div>
                    <div className="knowledge-entry-actions">
                      {getStatusBadge(entry.status)}
                      <button
                        onClick={() => handleDeleteEntry(entry.id, entry.title || entry.fileName || `Entry ID: ${entry.id}`)}
                        className="knowledge-delete-btn"
                        title="Delete entry"
                      >
                        <Trash2 className="knowledge-delete-icon" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminKnowledgeBasePage;
