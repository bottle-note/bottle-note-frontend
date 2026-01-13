import { TAGS_LIMIT, TAG_MAX_LENGTH, validateTagText } from './review';

describe('review constants', () => {
  describe('TAGS_LIMIT', () => {
    it('should be 15', () => {
      expect(TAGS_LIMIT).toBe(15);
    });
  });

  describe('TAG_MAX_LENGTH', () => {
    it('should be 12', () => {
      expect(TAG_MAX_LENGTH).toBe(12);
    });
  });
});

describe('validateTagText', () => {
  describe('valid tags', () => {
    it('should return true for Korean text', () => {
      expect(validateTagText('스모키')).toBe(true);
      expect(validateTagText('바닐라향')).toBe(true);
    });

    it('should return true for English text', () => {
      expect(validateTagText('smoky')).toBe(true);
      expect(validateTagText('Vanilla')).toBe(true);
    });

    it('should return true for mixed Korean and English', () => {
      expect(validateTagText('스모키 flavor')).toBe(true);
    });

    it('should return true for text with spaces', () => {
      expect(validateTagText('반건조 된 건자두')).toBe(true);
    });
  });

  describe('invalid tags', () => {
    it('should return false for text with numbers', () => {
      expect(validateTagText('스모키123')).toBe(false);
      expect(validateTagText('flavor2')).toBe(false);
    });

    it('should return false for text with special characters', () => {
      expect(validateTagText('스모키!')).toBe(false);
      expect(validateTagText('flavor@')).toBe(false);
      expect(validateTagText('바닐라#향')).toBe(false);
    });

    it('should return false for empty string', () => {
      expect(validateTagText('')).toBe(false);
    });
  });
});
