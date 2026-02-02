/**
 * Environment configuration for the frontend
 * 
 * All environment variables should be accessed through this module
 * to ensure type safety and provide defaults.
 */

export const env = {
  // Backend API URL
  backendUrl: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001',
  
  // Cloudinary configuration
  cloudinaryCloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || '',
  
  // Environment
  nodeEnv: process.env.NEXT_PUBLIC_ENV || 'development',
  isDevelopment: process.env.NEXT_PUBLIC_ENV !== 'production',
  isProduction: process.env.NEXT_PUBLIC_ENV === 'production',
} as const;

// Validate required environment variables
export function validateEnv() {
  const required = [
    'NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME',
  ];
  
  const missing = required.filter(
    (key) => !process.env[key]
  );
  
  if (missing.length > 0 && env.isProduction) {
    console.warn(
      `Warning: Missing required environment variables: ${missing.join(', ')}`
    );
  }
}
