import assert from 'assert';
import { sanitizeDescription } from './sanitizer';


describe('Tests for sanitizeDescription', async () => {
  it('should sanitize description', async () => {
    const description = '<script>alert("hello");</script>ここが集合場所です。13時までに集合してください。';
    assert.strictEqual(
      'ここが集合場所です。13時までに集合してください。',
      await sanitizeDescription(description),
    );
  });

  it('should not sanitize img tag, but should sanitize attributes other than "src", "srcset", "alt", "title", "width", "height", "loading"', async () => {
    // Ref. https://www.npmjs.com/package/sanitize-html
    const description = '<img decoding="auto" src="hibiya-park.jpeg" /><br />ここが集合場所です。13時までに集合してください。';
    assert.strictEqual(
      '<img src="hibiya-park.jpeg" /><br />ここが集合場所です。13時までに集合してください。',
      await sanitizeDescription(description),
    );
  });

  it('should not sanitize "class" attribute', async () => {
    const description = '<span class="red">ここが集合場所です。13時までに集合してください。</span>';
    assert.strictEqual(
      '<span class="red">ここが集合場所です。13時までに集合してください。</span>',
      await sanitizeDescription(description),
    );
  });
});
