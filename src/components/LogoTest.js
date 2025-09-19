import React from 'react';
import LogoImage from './LogoImage';

const LogoTest = () => {
  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-8">Logo Test Page</h1>
      
      <div className="space-y-12">
        {/* Traditional Rulers Logo */}
        <div>
          <h2 className="text-2xl font-bold mb-6 text-blue-900">Traditional Rulers Logo</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Small</h3>
              <div className="bg-white p-4 rounded shadow flex items-center justify-center">
                <LogoImage type="traditional-rulers" size="small" />
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Medium</h3>
              <div className="bg-white p-4 rounded shadow flex items-center justify-center">
                <LogoImage type="traditional-rulers" size="medium" />
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Large</h3>
              <div className="bg-white p-4 rounded shadow flex items-center justify-center">
                <LogoImage type="traditional-rulers" size="large" />
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">XLarge</h3>
              <div className="bg-white p-4 rounded shadow flex items-center justify-center">
                <LogoImage type="traditional-rulers" size="xlarge" />
              </div>
            </div>
          </div>
        </div>
        
        {/* Leadership Institute Logo */}
        <div>
          <h2 className="text-2xl font-bold mb-6 text-blue-900">Leadership Institute Logo</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Small</h3>
              <div className="bg-white p-4 rounded shadow flex items-center justify-center">
                <LogoImage type="leadership-institute" size="small" />
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Medium</h3>
              <div className="bg-white p-4 rounded shadow flex items-center justify-center">
                <LogoImage type="leadership-institute" size="medium" />
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Large</h3>
              <div className="bg-white p-4 rounded shadow flex items-center justify-center">
                <LogoImage type="leadership-institute" size="large" />
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">XLarge</h3>
              <div className="bg-white p-4 rounded shadow flex items-center justify-center">
                <LogoImage type="leadership-institute" size="xlarge" />
              </div>
            </div>
          </div>
        </div>
        
        {/* Both Logos Together */}
        <div>
          <h2 className="text-2xl font-bold mb-6 text-blue-900">Both Logos Together</h2>
          <div className="bg-white p-8 rounded shadow">
            <div className="flex items-center justify-center space-x-8">
              <div className="text-center">
                <LogoImage type="traditional-rulers" size="large" />
                <p className="mt-2 text-sm font-medium">Traditional Rulers</p>
              </div>
              <div className="text-center">
                <LogoImage type="leadership-institute" size="large" />
                <p className="mt-2 text-sm font-medium">Leadership Institute</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogoTest;
