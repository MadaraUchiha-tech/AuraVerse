import React, { useState, useEffect } from 'react';
import { Cpu, HardDrive, Zap, FileText, Image as ImageIcon, Activity } from 'lucide-react';
import { checkHealth, getUploadHistory } from '../services/api';

const RightPanel = () => {
  const [systemStatus, setSystemStatus] = useState({
    ai: { status: 'Checking...', color: 'text-gray-400' },
    storage: { status: 'Checking...', color: 'text-gray-400' },
    queue: { status: '0 pending', color: 'text-gray-400' },
  });

  const [recentActivity, setRecentActivity] = useState([]);
  const [backendOnline, setBackendOnline] = useState(false);

  // Check backend health
  const checkBackendStatus = async () => {
    try {
      const health = await checkHealth();
      console.log('Backend health:', health);
      
      setBackendOnline(true);
      setSystemStatus(prev => ({
        ...prev,
        ai: { 
          status: 'Ready', 
          color: 'text-green-400' 
        },
        storage: { 
          status: health.firebase ? 'Connected' : 'Mock Mode', 
          color: health.firebase ? 'text-green-400' : 'text-yellow-400' 
        },
      }));
    } catch (error) {
      console.error('Backend offline:', error);
      setBackendOnline(false);
      setSystemStatus({
        ai: { status: 'Offline', color: 'text-red-400' },
        storage: { status: 'Offline', color: 'text-red-400' },
        queue: { status: 'Offline', color: 'text-red-400' },
      });
    }
  };

  // Fetch recent activity
  const fetchActivity = async () => {
    try {
      const data = await getUploadHistory(5);
      console.log('Recent activity:', data);
      
      const activities = (data.logs || []).map(log => ({
        icon: log.type === 'media' ? ImageIcon : FileText,
        text: log.type === 'media' 
          ? `Uploaded "${log.filename}" with tags: ${log.tags?.slice(0, 2).join(', ') || 'none'}`
          : `Processed "${log.filename}" → ${log.db_type}`,
        time: formatTimeAgo(log.timestamp)
      }));
      
      setRecentActivity(activities);
    } catch (error) {
      console.error('Failed to fetch activity:', error);
    }
  };

  // Format time ago
  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return 'Unknown';
    const seconds = Math.floor((new Date() - new Date(timestamp)) / 1000);
    
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  useEffect(() => {
    // Initial check
    checkBackendStatus();
    fetchActivity();

    // Check health every 10 seconds
    const healthInterval = setInterval(checkBackendStatus, 10000);
    
    // Fetch activity every 5 seconds
    const activityInterval = setInterval(fetchActivity, 5000);

    return () => {
      clearInterval(healthInterval);
      clearInterval(activityInterval);
    };
  }, []);

  const statusItems = [
    { icon: Cpu, name: 'AI', ...systemStatus.ai },
    { icon: HardDrive, name: 'Storage', ...systemStatus.storage },
    { icon: Zap, name: 'Queue', ...systemStatus.queue },
  ];

  return (
    <aside className="w-[300px] bg-gray-900/70 backdrop-blur-lg border-l border-white/10 p-4 flex flex-col h-screen overflow-y-auto">
      {/* Backend Status Indicator */}
      <div className={`mb-6 p-3 rounded-lg border ${
        backendOnline 
          ? 'bg-green-500/10 border-green-500/30' 
          : 'bg-red-500/10 border-red-500/30'
      }`}>
        <div className="flex items-center gap-2">
          <Activity className={`w-4 h-4 ${backendOnline ? 'text-green-400' : 'text-red-400'}`} />
          <span className={`text-sm font-medium ${backendOnline ? 'text-green-400' : 'text-red-400'}`}>
            Backend {backendOnline ? 'Online' : 'Offline'}
          </span>
        </div>
        <p className="text-xs text-gray-400 mt-1">
          {backendOnline ? 'All systems operational' : 'Cannot connect to server'}
        </p>
      </div>

      {/* Processing Queue - Placeholder for now */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-white mb-4">Processing Queue</h3>
        <div className="space-y-4">
          <div className="text-center py-6">
            <p className="text-sm text-gray-400">No files in queue</p>
            <p className="text-xs text-gray-500 mt-1">Upload files to see processing status</p>
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-white mb-4">System Status</h3>
        <ul className="space-y-3">
          {statusItems.map((item, index) => (
            <li key={index} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-gray-300">
                <item.icon className={`w-4 h-4 ${item.color}`} />
                <span>{item.name}</span>
              </div>
              <span className={`font-medium ${item.color} text-xs`}>
                {item.status}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Live Activity */}
      <div className="flex-1">
        <h3 className="text-lg font-semibold text-white mb-4">Live Activity</h3>
        {recentActivity.length > 0 ? (
          <ul className="space-y-4">
            {recentActivity.map((activity, index) => (
              <li key={index} className="flex items-start gap-3 animate-fade-in">
                <div className="bg-white/10 p-1.5 rounded-full flex-shrink-0">
                  <activity.icon className="w-4 h-4 text-gray-300" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-200 leading-relaxed">{activity.text}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{activity.time}</p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-6">
            <p className="text-sm text-gray-400">No recent activity</p>
            <p className="text-xs text-gray-500 mt-1">Activity will appear here as files are processed</p>
          </div>
        )}
      </div>

      {/* Connection Info */}
      <div className="mt-auto pt-4 border-t border-white/10">
        <div className="text-xs text-gray-500">
          <div className="flex justify-between mb-1">
            <span>Backend:</span>
            <span className="text-gray-400 font-mono">:5000</span>
          </div>
          <div className="flex justify-between">
            <span>AI Service:</span>
            <span className="text-gray-400 font-mono">:5001</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default RightPanel;