import { describe, it, expect } from '@jest/globals';
import { sniffImageType } from '../../src/utils/imageSniff.js';

describe('sniffImageType', () => {
  it('identifies JPEG by magic bytes', () => {
    const buffer = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01]);
    expect(sniffImageType(buffer)).toBe('jpeg');
  });

  it('identifies PNG by magic bytes', () => {
    const buffer = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d]);
    expect(sniffImageType(buffer)).toBe('png');
  });

  it('identifies WebP by magic bytes', () => {
    const buffer = Buffer.concat([Buffer.from('RIFF'), Buffer.from([0, 0, 0, 0]), Buffer.from('WEBP')]);
    expect(sniffImageType(buffer)).toBe('webp');
  });

  it('rejects a file with a spoofed .jpg extension but no valid magic bytes', () => {
    const buffer = Buffer.from('this is just plain text, not an image at all');
    expect(sniffImageType(buffer)).toBeNull();
  });

  it('rejects an empty/too-short buffer', () => {
    expect(sniffImageType(Buffer.from([0xff, 0xd8]))).toBeNull();
    expect(sniffImageType(null)).toBeNull();
  });
});
