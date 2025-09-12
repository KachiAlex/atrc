import React, { useState, useEffect } from 'react';
import { 
  CheckCircleIcon, 
  ExclamationTriangleIcon, 
  WifiIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon
} from '@heroicons/react/24/outline';

const PWAStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isInstalled, setIsInstalled] = useState(false);
  const [swStatus, setSwStatus] = useState('checking');

  useEffect(() => {
    // Check if app is installed
    const checkIfInstalled = () => {
      if (window.matchMedia('(display-mode: standalone)').matches || 
          window.navigator.standalone === true) {
        setIsInstalled(true);
      } else {
        setIsInstalled(false);
      }
    };

    // Check service worker status
    const checkServiceWorker = async () => {
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.getRegistration();
          if (registration) {
            setSwStatus('active');
          } else {
            setSwStatus('inactive');
          }
        } catch (error) {
          setSwStatus('error');
        }
      } else {
        setSwStatus('unsupported');
      }
    };

    // Listen for online/offline events
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    checkIfInstalled();
    checkServiceWorker();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const getStatusIcon = () => {
    if (isInstalled && isOnline && swStatus === 'active') {
      return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
    }
    if (!isOnline) {
      return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
    }
    return <ExclamationTriangleIcon className="h-5 w-5 text-orange-500" />;
  };

  const getStatusText = () => {
    if (isInstalled && isOnline && swStatus === 'active') {
      return 'App Ready';
    }
    if (!isOnline) {
      return 'Offline Mode';
    }
    if (swStatus === 'active') {
      return 'Web App';
    }
    return 'Loading...';
  };

  const getStatusColor = () => {
    if (isInstalled && isOnline && swStatus === 'active') {
      return 'text-green-600 dark:text-green-400';
    }
    if (!isOnline) {
      return 'text-yellow-600 dark:text-yellow-400';
    }
    return 'text-orange-600 dark:text-orange-400';
  };

  return (
    <div className="flex items-center space-x-2 text-sm">
      {getStatusIcon()}
      <span className={getStatusColor()}>
        {getStatusText()}
      </span>
      {isInstalled && (
        <DevicePhoneMobileIcon className="h-4 w-4 text-blue-500" />
      )}
      {!isInstalled && (
        <ComputerDesktopIcon className="h-4 w-4 text-gray-500" />
      )}
      <WifiIcon className={`h-4 w-4 ${isOnline ? 'text-green-500' : 'text-red-500'}`} />
    </div>
  );
};

export default PWAStatus;