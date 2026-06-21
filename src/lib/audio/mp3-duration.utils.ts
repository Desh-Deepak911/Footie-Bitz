const MPEG1_LAYER3_BITRATES_KBPS = [
  0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320, 0,
] as const;

const MPEG2_LAYER3_BITRATES_KBPS = [
  0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160, 0,
] as const;

const MPEG1_SAMPLE_RATES_HZ = [44100, 48000, 32000] as const;
const MPEG2_SAMPLE_RATES_HZ = [22050, 24000, 16000] as const;
const MPEG25_SAMPLE_RATES_HZ = [11025, 12000, 8000] as const;

function skipId3Tag(bytes: Uint8Array): number {
  if (bytes.length < 10) {
    return 0;
  }

  if (bytes[0] !== 0x49 || bytes[1] !== 0x44 || bytes[2] !== 0x33) {
    return 0;
  }

  const size =
    ((bytes[6]! & 0x7f) << 21) |
    ((bytes[7]! & 0x7f) << 14) |
    ((bytes[8]! & 0x7f) << 7) |
    (bytes[9]! & 0x7f);

  return 10 + size;
}

function resolveSampleRate(versionBits: number, sampleRateIndex: number): number | null {
  if (sampleRateIndex < 0 || sampleRateIndex > 2) {
    return null;
  }

  if (versionBits === 0b11) {
    return MPEG1_SAMPLE_RATES_HZ[sampleRateIndex] ?? null;
  }

  if (versionBits === 0b10) {
    return MPEG2_SAMPLE_RATES_HZ[sampleRateIndex] ?? null;
  }

  if (versionBits === 0b00) {
    return MPEG25_SAMPLE_RATES_HZ[sampleRateIndex] ?? null;
  }

  return null;
}

function resolveBitrateKbps(versionBits: number, bitrateIndex: number): number | null {
  if (bitrateIndex <= 0 || bitrateIndex >= 15) {
    return null;
  }

  const table = versionBits === 0b11 ? MPEG1_LAYER3_BITRATES_KBPS : MPEG2_LAYER3_BITRATES_KBPS;
  return table[bitrateIndex] ?? null;
}

/**
 * Estimates MP3 duration by summing MPEG frame lengths.
 * Works for CBR/VBR files returned by OpenAI TTS without external dependencies.
 */
export function getMp3DurationSeconds(buffer: ArrayBuffer): number {
  const bytes = new Uint8Array(buffer);
  let offset = skipId3Tag(bytes);
  let durationSec = 0;

  while (offset + 4 < bytes.length) {
    if (bytes[offset] !== 0xff || (bytes[offset + 1]! & 0xe0) !== 0xe0) {
      offset += 1;
      continue;
    }

    const versionBits = (bytes[offset + 1]! >> 3) & 0x03;
    const layerBits = (bytes[offset + 1]! >> 1) & 0x03;
    const bitrateIndex = (bytes[offset + 2]! >> 4) & 0x0f;
    const sampleRateIndex = (bytes[offset + 2]! >> 2) & 0x03;
    const paddingBit = (bytes[offset + 2]! >> 1) & 0x01;

    if (layerBits !== 0b01) {
      offset += 1;
      continue;
    }

    const sampleRate = resolveSampleRate(versionBits, sampleRateIndex);
    const bitrateKbps = resolveBitrateKbps(versionBits, bitrateIndex);

    if (!sampleRate || !bitrateKbps) {
      offset += 1;
      continue;
    }

    const samplesPerFrame = versionBits === 0b11 ? 1152 : 576;
    durationSec += samplesPerFrame / sampleRate;

    const frameSize =
      Math.floor((samplesPerFrame / 8) * (bitrateKbps * 1000) / sampleRate) + paddingBit;

    if (frameSize <= 0) {
      offset += 1;
      continue;
    }

    offset += frameSize;
  }

  return durationSec;
}
