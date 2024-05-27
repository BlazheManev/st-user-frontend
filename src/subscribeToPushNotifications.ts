import axios from 'axios';
import authHeader from './services/auth-header';

const subscribeToPushNotifications = async () => {
  const publicVapidKey = 'BOmZXhFpI-ghh6CfxnT6SHraz5fQCULI69ZVTHNkl5D7tTl910gUl_ftDvu9b6fj0KDfap-rqe0VnOOqzq_HQ7M';
  const API_URL = process.env.REACT_APP_API_URL;

  if ('serviceWorker' in navigator) {
    try {
        
      const registration = await navigator.serviceWorker.register(`./service-worker.ts`);  // Changed to a relative path
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicVapidKey),
      });

      await axios.post(`${API_URL}/subscription/new`, { subscription }, { headers: authHeader() });
      console.log('Push notification subscription successful.');
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
    }
  }
};

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default subscribeToPushNotifications;
