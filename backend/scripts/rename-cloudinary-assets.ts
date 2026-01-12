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

// Assets to rename from quickspit to quikspit
const ASSETS_TO_RENAME = [
  // Gallery images
  { old: 'quickspit/gallery/vehicle1-before', new: 'quikspit/gallery/vehicle1-before' },
  { old: 'quickspit/gallery/vehicle1-after', new: 'quikspit/gallery/vehicle1-after' },
  { old: 'quickspit/gallery/vehicle2-before', new: 'quikspit/gallery/vehicle2-before' },
  { old: 'quickspit/gallery/vehicle2-after', new: 'quikspit/gallery/vehicle2-after' },
  { old: 'quickspit/gallery/ex_1', new: 'quikspit/gallery/ex_1' },
  { old: 'quickspit/gallery/ex_2', new: 'quikspit/gallery/ex_2' },
  { old: 'quickspit/gallery/ex_3', new: 'quikspit/gallery/ex_3' },
  { old: 'quickspit/gallery/ex_4', new: 'quikspit/gallery/ex_4' },
  { old: 'quickspit/gallery/ex_5', new: 'quikspit/gallery/ex_5' },
  { old: 'quickspit/gallery/ex_6', new: 'quikspit/gallery/ex_6' },
  { old: 'quickspit/gallery/ex_7', new: 'quikspit/gallery/ex_7' },
  { old: 'quickspit/gallery/ex_8', new: 'quikspit/gallery/ex_8' },
  { old: 'quickspit/gallery/ex_9', new: 'quikspit/gallery/ex_9' },
  // Static assets
  { old: 'quickspit/static/hero-fallback', new: 'quikspit/static/hero-fallback' },
  { old: 'quickspit/static/owner', new: 'quikspit/static/owner' },
  // Video (if it exists at this path)
  { old: 'quickspit/static/hero', new: 'quikspit/static/hero' },
];

async function renameAsset(oldPath: string, newPath: string) {
  try {
    console.log(`Renaming: ${oldPath} -> ${newPath}`);
    const result = await cloudinary.uploader.rename(oldPath, newPath, { 
      invalidate: true,
      overwrite: false // Don't overwrite if target already exists
    });
    console.log(`✅ Success: ${result.public_id}`);
    return result;
  } catch (error: any) {
    if (error.error?.message?.includes('not found')) {
      console.log(`⚠️  Skipped (not found): ${oldPath}`);
    } else if (error.error?.message?.includes('already exists')) {
      console.log(`⚠️  Skipped (already exists): ${newPath}`);
    } else {
      console.error(`❌ Error renaming ${oldPath}:`, error.error?.message || error.message);
    }
  }
}

async function main() {
  console.log('Starting Cloudinary asset renaming...\n');
  console.log(`Cloud Name: ${process.env.CLOUDINARY_CLOUD_NAME}\n`);

  let successCount = 0;
  let errorCount = 0;
  let skippedCount = 0;

  for (const asset of ASSETS_TO_RENAME) {
    const result = await renameAsset(asset.old, asset.new);
    if (result) {
      successCount++;
    } else {
      skippedCount++;
    }
    // Add small delay to avoid rate limits
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('\n' + '='.repeat(60));
  console.log('Rename Summary:');
  console.log(`✅ Successfully renamed: ${successCount}`);
  console.log(`⚠️  Skipped: ${skippedCount}`);
  console.log(`❌ Errors: ${errorCount}`);
  console.log('='.repeat(60));
  console.log('\n✨ Done! Cache has been invalidated for all renamed assets.');
}

// Run the script
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
