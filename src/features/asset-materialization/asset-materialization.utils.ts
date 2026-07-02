import { createHash } from "node:crypto";

import type {
  AssetMaterializationPreferredResolution,
  AssetMaterializationRequest,
} from "./asset-materialization.types";

export const MATERIALIZATION_PLATFORM_VERSION = "3.8F-2" as const;

export const DEFAULT_MATERIALIZATION_TIMEOUT_MS = 15_000;
export const DEFAULT_MATERIALIZATION_MAX_BYTES = 10 * 1024 * 1024;
export const DEFAULT_MATERIALIZATION_CACHE_TTL_MS = 60 * 60 * 1000;

export const SUPPORTED_IMAGE_MIME_TYPES = Object.freeze([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const MIME_EXTENSION_MAP: Record<string, string> = {
  "image/jpeg": "jpeg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

/** Builds a deterministic cache key from provider, source URL, and resolution. */
export function buildAssetMaterializationCacheKey(input: {
  providerId: string;
  fullResolutionUrl: string;
  preferredResolution: AssetMaterializationPreferredResolution;
}): string {
  const payload = JSON.stringify({
    providerId: input.providerId.trim(),
    fullResolutionUrl: input.fullResolutionUrl.trim(),
    preferredResolution: input.preferredResolution,
    version: MATERIALIZATION_PLATFORM_VERSION,
  });

  return createHash("sha256").update(payload).digest("hex");
}

/** Resolves which remote URL to fetch for the requested resolution. */
export function resolveMaterializationSourceUrl(
  request: Pick<
    AssetMaterializationRequest,
    "previewUrl" | "fullResolutionUrl" | "preferredResolution"
  >,
): string {
  const previewUrl = request.previewUrl.trim();
  const fullResolutionUrl = request.fullResolutionUrl.trim();
  const preferFull = request.preferredResolution === "full";

  if (preferFull) {
    return fullResolutionUrl || previewUrl;
  }

  return previewUrl || fullResolutionUrl;
}

export function normalizeMimeType(value: string | null | undefined): string | null {
  if (!value?.trim()) {
    return null;
  }

  const normalized = value.split(";")[0]?.trim().toLowerCase();
  return normalized || null;
}

export function isSupportedImageMimeType(mimeType: string): boolean {
  return SUPPORTED_IMAGE_MIME_TYPES.includes(mimeType);
}

/** Sniffs image mime type from magic bytes. */
export function sniffImageMimeType(buffer: Uint8Array): string | null {
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return "image/jpeg";
  }

  if (
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  ) {
    return "image/png";
  }

  if (
    buffer.length >= 6 &&
    buffer[0] === 0x47 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x38
  ) {
    return "image/gif";
  }

  if (
    buffer.length >= 12 &&
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50
  ) {
    return "image/webp";
  }

  return null;
}

export function resolveValidatedImageMimeType(input: {
  headerMimeType: string | null;
  sniffedMimeType: string | null;
  hintedMimeType?: string;
}): string | null {
  const hinted = normalizeMimeType(input.hintedMimeType);
  const header = normalizeMimeType(input.headerMimeType);
  const sniffed = normalizeMimeType(input.sniffedMimeType);

  const candidate = sniffed ?? header ?? hinted;
  if (!candidate || !isSupportedImageMimeType(candidate)) {
    return null;
  }

  if (sniffed && header && sniffed !== header) {
    return null;
  }

  if (hinted && sniffed && hinted !== sniffed) {
    return null;
  }

  return candidate;
}

/** Parses width/height from supported raster formats when possible. */
export function parseImageDimensions(
  buffer: Uint8Array,
  mimeType: string,
): { width?: number; height?: number } {
  if (mimeType === "image/png" && buffer.length >= 24) {
    const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
    return {
      width: view.getUint32(16, false),
      height: view.getUint32(20, false),
    };
  }

  if (mimeType === "image/gif" && buffer.length >= 10) {
    const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
    return {
      width: view.getUint16(6, true),
      height: view.getUint16(8, true),
    };
  }

  if (mimeType === "image/jpeg") {
    return parseJpegDimensions(buffer);
  }

  if (mimeType === "image/webp") {
    return parseWebpDimensions(buffer);
  }

  return {};
}

function parseJpegDimensions(buffer: Uint8Array): { width?: number; height?: number } {
  let offset = 2;

  while (offset + 9 < buffer.length) {
    if (buffer[offset] !== 0xff) {
      offset += 1;
      continue;
    }

    const marker = buffer[offset + 1];
    if (marker === 0xc0 || marker === 0xc2) {
      const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
      return {
        height: view.getUint16(offset + 5, false),
        width: view.getUint16(offset + 7, false),
      };
    }

    const segmentLength = (buffer[offset + 2] ?? 0) * 256 + (buffer[offset + 3] ?? 0);
    if (segmentLength < 2) {
      break;
    }

    offset += segmentLength + 2;
  }

  return {};
}

function parseWebpDimensions(buffer: Uint8Array): { width?: number; height?: number } {
  if (buffer.length < 30) {
    return {};
  }

  const chunkType = String.fromCharCode(buffer[12] ?? 0, buffer[13] ?? 0, buffer[14] ?? 0, buffer[15] ?? 0);
  const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);

  if (chunkType === "VP8 ") {
    return {
      width: view.getUint16(26, true) & 0x3fff,
      height: view.getUint16(28, true) & 0x3fff,
    };
  }

  if (chunkType === "VP8L" && buffer.length >= 25) {
    const bits = view.getUint32(21, true);
    return {
      width: (bits & 0x3fff) + 1,
      height: ((bits >> 14) & 0x3fff) + 1,
    };
  }

  if (chunkType === "VP8X" && buffer.length >= 30) {
    return {
      width: 1 + (buffer[24]! | (buffer[25]! << 8) | (buffer[26]! << 16)),
      height: 1 + (buffer[27]! | (buffer[28]! << 8) | (buffer[29]! << 16)),
    };
  }

  return {};
}

export function buildDataUrlPlayableUrl(mimeType: string, buffer: Uint8Array): string {
  const extension = MIME_EXTENSION_MAP[mimeType];
  if (!extension) {
    throw new Error(`unsupported mime type for data url: ${mimeType}`);
  }

  const base64 = Buffer.from(buffer).toString("base64");
  return `data:${mimeType};base64,${base64}`;
}

export function isHttpUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export function isDataUrl(url: string): boolean {
  return url.startsWith("data:");
}

export async function readResponseBytesWithLimit(
  response: Response,
  maxBytes: number,
): Promise<Uint8Array> {
  const contentLengthHeader = response.headers.get("content-length");
  if (contentLengthHeader) {
    const contentLength = Number.parseInt(contentLengthHeader, 10);
    if (Number.isFinite(contentLength) && contentLength > maxBytes) {
      throw new Error(`image exceeds maximum size of ${maxBytes} bytes`);
    }
  }

  if (!response.body) {
    const arrayBuffer = await response.arrayBuffer();
    if (arrayBuffer.byteLength > maxBytes) {
      throw new Error(`image exceeds maximum size of ${maxBytes} bytes`);
    }

    return new Uint8Array(arrayBuffer);
  }

  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }

    if (!value) {
      continue;
    }

    totalBytes += value.byteLength;
    if (totalBytes > maxBytes) {
      await reader.cancel();
      throw new Error(`image exceeds maximum size of ${maxBytes} bytes`);
    }

    chunks.push(value);
  }

  const merged = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    merged.set(chunk, offset);
    offset += chunk.byteLength;
  }

  return merged;
}
