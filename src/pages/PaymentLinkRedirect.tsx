import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const PaymentLinkRedirect = () => {
  const { linkId } = useParams<{ linkId: string }>();
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    if (!linkId) return;

    // Detect platform
    const userAgent = navigator.userAgent || navigator.vendor;
    const isAndroid = /android/i.test(userAgent);
    const isIOS = /iPad|iPhone|iPod/.test(userAgent);

    // App store URLs
    const androidStoreUrl = 'https://play.google.com/store/apps/details?id=com.devarch.tennis2';
    const iosStoreUrl = 'https://apps.apple.com/app/seed-%D8%B3%D9%8A%D9%8A%D8%AF/id6754299638';

    // Deep link URL
    const deepLinkUrl = `seedco://payment/${linkId}`;

    // Try to open the app with deep link
    const attemptDeepLink = () => {
      window.location.href = deepLinkUrl;
    };

    // Redirect to app store after a delay
    const redirectToStore = () => {
      if (isAndroid) {
        window.location.href = androidStoreUrl;
      } else if (isIOS) {
        window.location.href = iosStoreUrl;
      } else {
        // Desktop or unknown - show message
        return;
      }
    };

    // Start countdown
    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Attempt to open app immediately
    attemptDeepLink();

    // If app doesn't open within 2.5 seconds, redirect to store
    const redirectTimer = setTimeout(() => {
      redirectToStore();
    }, 2500);

    return () => {
      clearInterval(countdownInterval);
      clearTimeout(redirectTimer);
    };
  }, [linkId]);

  const userAgent = navigator.userAgent || navigator.vendor;
  const isAndroid = /android/i.test(userAgent);
  const isIOS = /iPad|iPhone|iPod/.test(userAgent);
  const isMobile = isAndroid || isIOS;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        {/* Logo or Icon */}
        <div className="mb-6">
          <div className="w-20 h-20 bg-purple-600 rounded-full mx-auto flex items-center justify-center">
            <svg
              className="w-10 h-10 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Opening SEED Tennis
        </h1>

        {isMobile ? (
          <>
            <p className="text-gray-600 mb-6">
              Redirecting you to the app...
            </p>

            {/* Loading spinner */}
            <div className="mb-6">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            </div>

            {countdown > 0 && (
              <p className="text-sm text-gray-500 mb-4">
                If the app doesn't open, you'll be redirected to the app store in {countdown}s
              </p>
            )}

            {/* Manual buttons */}
            <div className="space-y-3 mt-6">
              {isAndroid && (
                <a
                  href="https://play.google.com/store/apps/details?id=com.devarch.tennis2"
                  className="block w-full bg-gray-900 text-white py-3 px-6 rounded-lg font-medium hover:bg-gray-800 transition-colors"
                >
                  Open in Google Play
                </a>
              )}
              {isIOS && (
                <a
                  href="https://apps.apple.com/app/seed-%D8%B3%D9%8A%D9%8A%D8%AF/id6754299638"
                  className="block w-full bg-gray-900 text-white py-3 px-6 rounded-lg font-medium hover:bg-gray-800 transition-colors"
                >
                  Open in App Store
                </a>
              )}
            </div>
          </>
        ) : (
          <>
            <p className="text-gray-600 mb-6">
              This payment link is designed for the SEED Tennis mobile app.
            </p>

            <div className="space-y-3">
              <p className="text-sm text-gray-500 mb-4">
                Download the app to complete your payment:
              </p>
              
              <a
                href="https://play.google.com/store/apps/details?id=com.devarch.tennis2"
                className="block w-full bg-gray-900 text-white py-3 px-6 rounded-lg font-medium hover:bg-gray-800 transition-colors"
              >
                Download for Android
              </a>
              
              <a
                href="https://apps.apple.com/app/seed-%D8%B3%D9%8A%D9%8A%D8%AF/id6754299638"
                className="block w-full bg-gray-900 text-white py-3 px-6 rounded-lg font-medium hover:bg-gray-800 transition-colors"
              >
                Download for iOS
              </a>
            </div>
          </>
        )}

        {/* Help text */}
        <p className="text-xs text-gray-400 mt-6">
          Payment Link ID: {linkId}
        </p>
      </div>
    </div>
  );
};

export default PaymentLinkRedirect;
