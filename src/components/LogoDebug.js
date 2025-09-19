import React, { useState } from 'react';

const LogoDebug = () => {
  const [traditionalStatus, setTraditionalStatus] = useState('loading');
  const [leadershipStatus, setLeadershipStatus] = useState('loading');

  return (
    <div className="p-8 bg-gray-100">
      <h2 className="text-2xl font-bold mb-6">Logo Debug Page</h2>
      
      <div className="space-y-8">
        <div>
          <h3 className="text-lg font-semibold mb-4">Traditional Rulers Logo Test</h3>
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 border-2 border-gray-300">
              <img
                src="/images/traditional-rulers-logo.jpg"
                alt="Traditional Rulers Logo"
                className="w-full h-full object-contain"
                onLoad={() => {
                  setTraditionalStatus('loaded');
                  console.log('Traditional logo loaded successfully');
                }}
                onError={(e) => {
                  setTraditionalStatus('error');
                  console.error('Traditional logo failed to load:', e);
                }}
              />
            </div>
            <div>
              <p>Status: <span className={traditionalStatus === 'loaded' ? 'text-green-600' : traditionalStatus === 'error' ? 'text-red-600' : 'text-yellow-600'}>{traditionalStatus}</span></p>
              <p>Path: /images/traditional-rulers-logo.jpg</p>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Leadership Institute Logo Test</h3>
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 border-2 border-gray-300">
              <img
                src="/images/leadership-institute-logo.jpg"
                alt="Leadership Institute Logo"
                className="w-full h-full object-contain"
                onLoad={() => {
                  setLeadershipStatus('loaded');
                  console.log('Leadership logo loaded successfully');
                }}
                onError={(e) => {
                  setLeadershipStatus('error');
                  console.error('Leadership logo failed to load:', e);
                }}
              />
            </div>
            <div>
              <p>Status: <span className={leadershipStatus === 'loaded' ? 'text-green-600' : leadershipStatus === 'error' ? 'text-red-600' : 'text-yellow-600'}>{leadershipStatus}</span></p>
              <p>Path: /images/leadership-institute-logo.jpg</p>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Direct URL Test</h3>
          <div className="space-y-2">
            <p>
              <a 
                href="/images/traditional-rulers-logo.jpg" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Open Traditional Rulers Logo Directly
              </a>
            </p>
            <p>
              <a 
                href="/images/leadership-institute-logo.jpg" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Open Leadership Institute Logo Directly
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogoDebug;
