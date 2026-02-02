import { v2 as cloudinary } from 'cloudinary';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function testVideo() {
  const videoId = 'copy_84B200F5-6F45-4C16-B685-5944D3E2B2CC_fgxfbu';
  
  try {
    console.log(`Checking video: ${videoId}\n`);
    const result = await cloudinary.api.resource(videoId, { resource_type: 'video' });
    
    console.log('✅ Video found!');
    console.log(`   Public ID: ${result.public_id}`);
    console.log(`   URL: ${result.secure_url}`);
    console.log(`   Format: ${result.format}`);
    console.log(`   Version: ${result.version}`);
    console.log(`   Width: ${result.width}`);
    console.log(`   Height: ${result.height}`);
    console.log(`   Duration: ${result.duration}s`);
    
    // Test URL construction
    const testUrl = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/video/upload/v${result.version}/${videoId}.${result.format}`;
    console.log(`\n   Constructed URL: ${testUrl}`);
    
  } catch (error: any) {
    console.error('❌ Video not found or error:', error.error?.message || error.message);
  }
}

testVideo();
