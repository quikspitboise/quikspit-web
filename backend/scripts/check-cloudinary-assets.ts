import { v2 as cloudinary } from 'cloudinary';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from backend .env
dotenv.config({ path: path.join(__dirname, '../.env') });

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function checkAsset(publicId: string, resourceType: 'image' | 'video' = 'image') {
  try {
    const result = await cloudinary.api.resource(publicId, { resource_type: resourceType });
    console.log(`✅ Found: ${publicId}`);
    console.log(`   URL: ${result.secure_url}`);
    console.log(`   Format: ${result.format}`);
    return true;
  } catch (error: any) {
    console.log(`❌ Not found: ${publicId} (${resourceType})`);
    return false;
  }
}

async function listFolder(prefix: string, resourceType: 'image' | 'video' = 'image') {
  try {
    console.log(`\n📁 Listing ${resourceType}s in folder: ${prefix}`);
    const result = await cloudinary.api.resources({
      type: 'upload',
      prefix: prefix,
      resource_type: resourceType,
      max_results: 50
    });
    
    if (result.resources.length === 0) {
      console.log(`   (empty)`);
    } else {
      result.resources.forEach((resource: any) => {
        console.log(`   - ${resource.public_id}`);
      });
    }
    return result.resources;
  } catch (error: any) {
    console.log(`   Error: ${error.error?.message || error.message}`);
    return [];
  }
}

async function main() {
  console.log('Checking Cloudinary assets...\n');
  console.log(`Cloud Name: ${process.env.CLOUDINARY_CLOUD_NAME}\n`);

  // Check specific assets
  console.log('=== Checking Static Assets ===');
  await checkAsset('quikspit/static/hero-fallback', 'image');
  await checkAsset('quikspit/static/hero', 'video');
  await checkAsset('quikspit/static/hero', 'image');
  
  // List all videos
  console.log('\n=== All Videos ===');
  await listFolder('quikspit', 'video');
  
  console.log('\n=== Static Folder (images) ===');
  await listFolder('quikspit/static', 'image');
  
  console.log('\n=== Static Folder (videos) ===');
  await listFolder('quikspit/static', 'video');

  console.log('\n=== Gallery Folder (first 10) ===');
  await listFolder('quikspit/gallery', 'image');
  
  console.log('\n✨ Done!');
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
