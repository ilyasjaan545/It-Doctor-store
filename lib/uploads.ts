import 'server-only';

/** Allow-listed image types + a hard size cap — checked before anything touches storage. */
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

export class UploadValidationError extends Error {}

/**
 * Validates a File coming from an admin upload form. This runs on the
 * server (inside a server action), never trusting the browser's reported
 * mime type alone — we also sniff the first bytes (magic numbers) so a
 * renamed .php or .svg-with-script can't slip through as "image/png".
 */
export async function validateImageUpload(file: File): Promise<void> {
  if (!ALLOWED_TYPES.has(file.type)) {
    throw new UploadValidationError('Only JPEG, PNG or WebP images are allowed.');
  }
  if (file.size <= 0 || file.size > MAX_BYTES) {
    throw new UploadValidationError('Image must be under 5 MB.');
  }

  const bytes = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  const isPng = bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47;
  const isJpg = bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  const isWebp =
    bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
    bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50;

  if (!isPng && !isJpg && !isWebp) {
    throw new UploadValidationError('File content does not match an allowed image type.');
  }
}

/** Builds a safe, unpredictable storage path so filenames can't collide or be guessed. */
export function buildStoragePath(originalName: string, prefix: string): string {
  const ext = (originalName.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '');
  const safeExt = ['jpg', 'jpeg', 'png', 'webp'].includes(ext) ? ext : 'jpg';
  const random = crypto.randomUUID();
  return `${prefix}/${random}.${safeExt}`;
}
