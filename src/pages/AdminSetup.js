import React, { useState } from 'react';
import { createDefaultAdmin, checkDefaultAdmin } from '../utils/createDefaultAdmin';

const AdminSetup = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [checked, setChecked] = useState(false);
  const [adminExists, setAdminExists] = useState(false);

  const handleCheckAdmin = async () => {
    setLoading(true);
    try {
      const exists = await checkDefaultAdmin();
      setAdminExists(exists);
      setChecked(true);
    } catch (error) {
      console.error('Error checking admin:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAdmin = async () => {
    setLoading(true);
    try {
      const result = await createDefaultAdmin();
      setResult(result);
    } catch (error) {
      console.error('Error creating admin:', error);
      setResult({
        success: false,
        message: 'Failed to create admin user',
        error: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-primary-100">
            <span className="text-2xl">👑</span>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            ATRC Admin Setup
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Set up the default administrator account for the Africa Traditional Rulers for Christ platform
          </p>
        </div>

        <div className="bg-white py-8 px-6 shadow rounded-lg">
          {!checked && (
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Check Admin Status
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                First, let's check if a default admin user already exists.
              </p>
              <button
                onClick={handleCheckAdmin}
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
              >
                {loading ? 'Checking...' : 'Check Admin Status'}
              </button>
            </div>
          )}

          {checked && !adminExists && (
            <div className="text-center">
              <div className="mb-4">
                <div className="mx-auto h-8 w-8 flex items-center justify-center rounded-full bg-yellow-100">
                  <span className="text-yellow-600">⚠️</span>
                </div>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Admin Found
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                No default admin user exists. Click below to create one.
              </p>
              <button
                onClick={handleCreateAdmin}
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
              >
                {loading ? 'Creating Admin...' : 'Create Default Admin'}
              </button>
            </div>
          )}

          {checked && adminExists && (
            <div className="text-center">
              <div className="mb-4">
                <div className="mx-auto h-8 w-8 flex items-center justify-center rounded-full bg-green-100">
                  <span className="text-green-600">✅</span>
                </div>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Admin Already Exists
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                A default admin user already exists in the system.
              </p>
              <div className="bg-gray-50 rounded-md p-4 text-left">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Default Admin Credentials:</h4>
                <p className="text-sm text-gray-600">
                  <strong>Email:</strong> admin@atrc.org<br />
                  <strong>Password:</strong> AdminATRC2024!
                </p>
              </div>
            </div>
          )}

          {result && (
            <div className={`mt-6 p-4 rounded-md ${
              result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
            }`}>
              <div className="flex">
                <div className="flex-shrink-0">
                  <span className={`text-lg ${
                    result.success ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {result.success ? '✅' : '❌'}
                  </span>
                </div>
                <div className="ml-3">
                  <h3 className={`text-sm font-medium ${
                    result.success ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {result.success ? 'Success!' : 'Error'}
                  </h3>
                  <div className={`mt-2 text-sm ${
                    result.success ? 'text-green-700' : 'text-red-700'
                  }`}>
                    <p>{result.message}</p>
                    {result.credentials && (
                      <div className="mt-3 bg-white p-3 rounded border">
                        <h4 className="font-medium">Admin Credentials:</h4>
                        <p><strong>Email:</strong> {result.credentials.email}</p>
                        <p><strong>Password:</strong> {result.credentials.password}</p>
                      </div>
                    )}
                    {result.error && (
                      <p className="mt-2 text-xs">Error: {result.error}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="mt-6 text-center">
            <a
              href="/login"
              className="text-sm text-primary-600 hover:text-primary-500"
            >
              Go to Login Page
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSetup;
