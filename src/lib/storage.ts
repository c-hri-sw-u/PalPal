import { supabase } from './supabase';
import { STORAGE_BUCKETS } from '../constants';

type BucketType = keyof typeof STORAGE_BUCKETS;

export async function uploadImage(
  bucket: BucketType,
  filePath: string,
  file: Blob | ArrayBuffer
): Promise<string | null> {
  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKETS[bucket])
    .upload(filePath, file, {
      upsert: true,
      contentType: 'image/jpeg',
    });

  if (error) {
    console.error('Upload error:', error);
    return null;
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from(STORAGE_BUCKETS[bucket])
    .getPublicUrl(data.path);

  return publicUrl;
}

export async function deleteImage(
  bucket: BucketType,
  filePath: string
): Promise<boolean> {
  const { error } = await supabase.storage
    .from(STORAGE_BUCKETS[bucket])
    .remove([filePath]);

  return !error;
}

// Generate unique file path
export function generateFilePath(
  bucket: BucketType,
  userId: string,
  fileName: string
): string {
  const timestamp = Date.now();
  return `${userId}/${bucket}_${timestamp}_${fileName}`;
}
