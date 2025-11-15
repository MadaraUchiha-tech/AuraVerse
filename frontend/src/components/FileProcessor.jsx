import React, { useState, useEffect } from 'react';
import { Loader2, CheckCircle, AlertCircle, Upload } from 'lucide-react';

const FileProcessor = ({ file, initialStatus = 'uploading' }) => {
  const [status, setStatus] = useState(initialStatus);
  const [tags, setTags] = useState([]);
  const [storagePath, setStoragePath] = useState('');
  const [database, setDatabase] = useState('');

  useEffect(() => {
    // Update status based on prop changes
    setStatus(initialStatus);
  }, [initialStatus]);

  useEffect(() => {
    // Simulate processing stages for visual feedback
    if (initialStatus === 'processing') {
      const isJSON = file.type === 'application/json' || file.name.endsWith('.json');
      
      if (isJSON) {
        // JSON processing simulation
        const timer1 = setTimeout(() => {
          setStatus('analyzing');
        }, 500);

        const timer2 = setTimeout(() => {
          setStatus('storing');
          // Randomly decide SQL or NoSQL for demo
          const dbType = Math.random() > 0.5 ? 'PostgreSQL' : 'MongoDB';
          setDatabase(dbType);
        }, 2000);

        const timer3 = setTimeout(() => {
          setStatus('completed');
        }, 4000);

        return () => {
          clearTimeout(timer1);
          clearTimeout(timer2);
          clearTimeout(timer3);
        };
      } else {
        // Media processing simulation
        const timer1 = setTimeout(() => {
          setStatus('analyzing');
        }, 500);

        const timer2 = setTimeout(() => {
          setStatus('tagging');
          // Generate mock tags
          const allTags = ['nature', 'urban', 'people', 'animals', 'food', 'indoor', 'outdoor', 'technology', 'architecture'];
          const randomTags = allTags
            .sort(() => 0.5 - Math.random())
            .slice(0, Math.floor(Math.random() * 3) + 2);
          setTags(randomTags);
        }, 2000);

        const timer3 = setTimeout(() => {
          setStatus('storing');
          // Generate category from tags
          if (tags.length > 0) {
            const primary = tags[0].charAt(0).toUpperCase() + tags[0].slice(1);
            const secondary = tags[1] ? tags[1].charAt(0).toUpperCase() + tags[1].slice(1) : 'General';
            setStoragePath(`${primary}/${secondary}/`);
          } else {
            setStoragePath('Uncategorized/General/');
          }
        }, 4000);

        const timer4 = setTimeout(() => {
          setStatus('completed');
        }, 6000);

        return () => {
          clearTimeout(timer1);
          clearTimeout(timer2);
          clearTimeout(timer3);
          clearTimeout(timer4);
        };
      }
    }
  }, [initialStatus, file, tags]);

  const isImage = file.type.startsWith('image/');
  const isJSON = file.type === 'application/json' || file.name.endsWith('.json');
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    if (isImage) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  }, [file, isImage]);

  const getStatusDisplay = () => {
    switch (status) {
      case 'uploading':
        return (
          <div className="flex items-center gap-2 text-blue-400">
            <Upload className="w-4 h-4" />
            <span>Uploading to server...</span>
          </div>
        );
      case 'analyzing':
        return (
          <div className="flex items-center gap-2 text-purple-400">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>🤖 AI Analyzing{isJSON ? ' schema' : ' content'}...</span>
          </div>
        );
      case 'tagging':
        return (
          <div className="text-purple-400">
            🏷️ Detected tags: <span className="text-purple-300 font-medium">{tags.join(', ')}</span>
          </div>
        );
      case 'storing':
        if (isJSON) {
          return (
            <div className="text-blue-400">
              🗄️ Storing in: <span className="text-blue-300 font-medium">{database}</span>
            </div>
          );
        }
        return (
          <div className="text-green-400">
            📁 Storing in: <span className="text-green-300 font-medium">{storagePath}</span>
          </div>
        );
      case 'completed':
        return (
          <div className="flex items-center gap-2 text-green-400">
            <CheckCircle className="w-4 h-4" />
            <span>✅ Processing Complete</span>
          </div>
        );
      case 'failed':
        return (
          <div className="flex items-center gap-2 text-red-400">
            <AlertCircle className="w-4 h-4" />
            <span>❌ Upload Failed</span>
          </div>
        );
      default:
        return null;
    }
  };

  // Progress bar calculation
  const getProgress = () => {
    switch (status) {
      case 'uploading': return 20;
      case 'analyzing': return 40;
      case 'tagging': return 60;
      case 'storing': return 80;
      case 'completed': return 100;
      case 'failed': return 0;
      default: return 0;
    }
  };

  const progress = getProgress();

  return (
    <div className="bg-white/10 backdrop-blur-lg border border-white/10 p-4 rounded-lg">
      <div className="flex items-start gap-4">
        {/* File Preview */}
        {isImage && imagePreview ? (
          <img 
            src={imagePreview} 
            alt={file.name} 
            className="w-16 h-16 rounded-md object-cover flex-shrink-0" 
          />
        ) : (
          <div className="w-16 h-16 rounded-md bg-gray-700 flex items-center justify-center flex-shrink-0">
            <p className="text-xs text-gray-400 font-mono">
              .{file.name.split('.').pop()}
            </p>
          </div>
        )}

        {/* File Info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white truncate">{file.name}</p>
          <p className="text-xs text-gray-400 mt-0.5">
            {(file.size / 1024).toFixed(1)} KB
          </p>

          {/* Progress Bar */}
          <div className="mt-2 w-full bg-gray-700 rounded-full h-1.5">
            <div 
              className={`h-1.5 rounded-full transition-all duration-500 ${
                status === 'failed' ? 'bg-red-500' :
                status === 'completed' ? 'bg-green-500' :
                'bg-gradient-to-r from-purple-500 to-blue-500'
              }`}
              style={{ width: `${progress}%` }}
            ></div>
          </div>

          {/* Status Display */}
          <div className="mt-3 text-xs">
            {getStatusDisplay()}
          </div>

          {/* Tags Display (after completion) */}
          {status === 'completed' && tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {tags.map(tag => (
                <span 
                  key={tag} 
                  className="px-2 py-0.5 text-xs bg-purple-600/30 text-purple-300 rounded-full border border-purple-500/30"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileProcessor;