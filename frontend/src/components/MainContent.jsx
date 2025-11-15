import React, { useState } from 'react';
import UploadZone from './UploadZone';
import Tabs from './Tabs';
import FileGrid from './FileGrid';
import { Search } from 'lucide-react';

const TABS = [
  { name: 'Upload' },
  { name: 'Browse Files' },
  { name: 'Logs' },
];

const MainContent = () => {
  const [activeTab, setActiveTab] = useState('Upload');

  return (
    <main className="flex-1 p-8 overflow-y-auto">
      <h1 className="text-3xl font-bold text-white">Intelligent Storage</h1>
      <Tabs tabs={TABS} activeTab={activeTab} setActiveTab={setActiveTab} />
      <div>
        {activeTab === 'Upload' && <UploadZone />}
        {activeTab === 'Browse Files' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <div className="relative w-full max-w-xs">
                <input type="text" placeholder="Search by filename or tags..." className="bg-white/10 border border-white/20 rounded-md py-2 pl-10 pr-4 w-full text-sm placeholder-gray-400" />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
              {/* Add filter buttons here */}
            </div>
            <FileGrid />
          </div>
        )}
        {activeTab === 'Logs' && <div>Logs Content</div>}
      </div>
    </main>
  );
};

export default MainContent;
