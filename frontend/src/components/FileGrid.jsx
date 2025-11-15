import React, { useState, useEffect } from 'react';
import { getUploadedFiles } from '../services/api';
import { FileJson, Image as ImageIcon, Video, MoreVertical, Download, Trash2, RefreshCw } from 'lucide-react';

// Helper function to optimize Cloudinary URLs
const getOptimizedImageUrl = (url, width = 48, height = 48) => {
  if (!url || !url.includes('cloudinary')) {
    return url;
  }
  
  // Insert transformation parameters into Cloudinary URL
  return url.replace('/upload/', `/upload/w_${width},h_${height},c_fill,q_auto/`);
};

const FileCard = ({ file, onDelete }) => {
  const isMedia = file.type === 'media';
  const isJSON = file.type === 'json';
  const [imageError, setImageError] = useState(false);
  
  // Format file size
  const formatSize = (bytes) => {
    if (!bytes) return 'Unknown';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // Format date
  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown';
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-lg p-4 group relative hover:bg-white/10 transition-all">
      <div className="flex items-start gap-4">
        {/* File Icon */}
        <div className="flex-shrink-0">
          {isMedia && file.mime_type?.startsWith('image/') && file.url && !imageError ? (
            <img 
              src={getOptimizedImageUrl(file.url, 48, 48)}
              alt={file.filename}
              className="w-12 h-12 rounded-lg object-cover"
              onError={() => setImageError(true)}
            />
          ) : null}
          
          {(imageError || (isMedia && !file.url)) && file.mime_type?.startsWith('image/') && (
            <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <ImageIcon className="w-6 h-6 text-purple-400" />
            </div>
          )}
          
          {isMedia && file.mime_type?.startsWith('video/') && (
            <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <Video className="w-6 h-6 text-purple-400" />
            </div>
          )}
          
          {isJSON && (
            <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <FileJson className="w-6 h-6 text-blue-400" />
            </div>
          )}
        </div>

        {/* File Info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white truncate" title={file.filename}>
            {file.filename}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            {formatSize(file.size)} • {formatDate(file.timestamp)}
          </p>

          {/* Tags */}
          {file.tags && file.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {file.tags.slice(0, 3).map((tag, idx) => (
                <span 
                  key={idx} 
                  className="px-2 py-0.5 text-xs bg-purple-600/30 text-purple-300 rounded-full border border-purple-500/30"
                >
                  {tag}
                </span>
              ))}
              {file.tags.length > 3 && (
                <span className="px-2 py-0.5 text-xs text-gray-400">
                  +{file.tags.length - 3}
                </span>
              )}
            </div>
          )}

          {/* Category */}
          {file.category && (
            <div className="mt-1 text-xs text-gray-400">
              📁 {file.category}
            </div>
          )}

          {/* Database info for JSON */}
          {isJSON && file.db_type && (
            <div className="mt-1 text-xs text-blue-400">
              🗄️ {file.db_type} • {file.record_count || 0} records
            </div>
          )}
          
          {/* Storage Provider Badge */}
          {file.storage_provider === 'cloudinary' && isMedia && (
            <div className="mt-1 text-xs text-green-400 flex items-center gap-1">
              ☁️ Cloudinary
            </div>
          )}
        </div>
      </div>

      {/* Actions (hover) */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-full">
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>
      
      <div className="absolute bottom-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        {file.url && (
          <a 
            href={file.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-full"
            title="Open in new tab"
          >
            <Download className="w-4 h-4" />
          </a>
        )}
        <button 
          onClick={() => onDelete && onDelete(file.id)}
          className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-white/10 rounded-full"
          title="Delete file"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

const FileGrid = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchFiles = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getUploadedFiles({ limit: 50 });
      console.log('Files fetched:', data);
      setFiles(data.files || []);
    } catch (error) {
      console.error('Failed to fetch files:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (fileId) => {
    if (!confirm('Are you sure you want to delete this file?')) {
      return;
    }

    try {
      // TODO: Call delete API
      // await deleteFile(fileId);
      
      // Optimistically remove from UI
      setFiles(prev => prev.filter(f => f.id !== fileId));
      
      console.log('File deleted:', fileId);
    } catch (error) {
      console.error('Failed to delete file:', error);
      alert('Failed to delete file: ' + error.message);
    }
  };

  useEffect(() => {
    fetchFiles();
    
    // Auto-refresh every 10 seconds
    const interval = setInterval(fetchFiles, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading && files.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading files...</p>
        </div>
      </div>
    );
  }

  if (error && files.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-400 mb-4">Failed to load files: {error}</p>
          <button
            onClick={fetchFiles}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white text-sm flex items-center gap-2 mx-auto"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-gray-400 mb-2">No files uploaded yet</p>
          <p className="text-gray-500 text-sm">Upload some files to see them here!</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-gray-400">
          {files.length} file{files.length !== 1 ? 's' : ''} total
        </p>
        <button
          onClick={fetchFiles}
          className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          title="Refresh"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {files.map(file => (
          <FileCard key={file.id} file={file} onDelete={handleDelete} />
        ))}
      </div>
    </div>
  );
};

export default FileGrid;