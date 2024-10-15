// Import next-pwa using the default export
import withPWA from 'next-pwa';

// Define PWA configuration
const pwaConfig = {
  dest: 'public',
  register: true,
  skipWaiting: true,
};

// Create the Next.js configuration
const nextConfig = {
};

// Export the merged configuration
export default withPWA(pwaConfig)(nextConfig);
