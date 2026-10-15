import { Storage, File } from '@google-cloud/storage';
import path from 'path';

// Initialize storage and bucket lazily to avoid build-time errors
let storage: Storage | null = null;
let bucket: any = null;

function initializeGCS() {
  if (storage && bucket) return { storage, bucket };
  
  const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;
  const keyFile = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  const bucketName = process.env.GCS_BUCKET_NAME;

  if (!bucketName) {
    throw new Error('GCS_BUCKET_NAME environment variable is required');
  }

  storage = new Storage({ projectId, keyFilename: keyFile });
  bucket = storage.bucket(bucketName);
  
  return { storage, bucket };
}

export async function uploadBuffer(buffer: Buffer, destination: string, contentType?: string) {
  const { bucket } = initializeGCS();
  const file = bucket.file(destination);
  const stream = file.createWriteStream({ metadata: { contentType } });

  return new Promise<string>((resolve, reject) => {
    stream.on('error', (err: Error) => reject(err));
    stream.on('finish', async () => {
      try {
        // Prefer returning a signed URL so objects can remain private by default.
        // Signed URL expires in 24 hours by default.
        const expiresMs = Date.now() + 24 * 60 * 60 * 1000;
        // getSignedUrl returns an array of URLs
        // @ts-ignore - SDK types for getSignedUrl result can vary by version
        const [signedUrl] = await file.getSignedUrl({ action: 'read', expires: expiresMs, version: 'v4' });
        resolve(signedUrl);
      } catch (err) {
        // Fallback: try to make the object public and return the public URL
        try {
          await file.makePublic();
          const publicUrl = `https://storage.googleapis.com/${bucket.name}/${destination}`;
          resolve(publicUrl);
        } catch (e) {
          // As a last resort return the storage.googleapis.com URL even if it may 403.
          const publicUrl = `https://storage.googleapis.com/${bucket.name}/${destination}`;
          resolve(publicUrl);
        }
      }
    });
    stream.end(buffer);
  });
}

export async function deleteFile(filePath: string) {
  const { bucket } = initializeGCS();
  const file = bucket.file(filePath);
  await file.delete({ ignoreNotFound: true });
}

export async function listFiles(prefix: string = '') {
  const { bucket } = initializeGCS();
  const [files] = await bucket.getFiles({ prefix });
  return files.map((f: File) => ({ name: f.name, url: `https://storage.googleapis.com/${bucket.name}/${f.name}` }));
}

export default function getDefaultBucket() {
  const { bucket } = initializeGCS();
  return bucket;
}
