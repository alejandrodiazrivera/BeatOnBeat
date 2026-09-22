/**
 * Quick test script to verify YouTube URL parsing works for Reels
 * Run this in the browser console to test
 */

import { extractVideoId, getYouTubeVideoType, isYouTubeUrl } from '../utils/youtubeUtils';

// Test URLs
const testUrls = [
  // Regular YouTube videos
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  'https://youtube.com/watch?v=dQw4w9WgXcQ',
  'https://youtu.be/dQw4w9WgXcQ',
  
  // YouTube Shorts/Reels
  'https://www.youtube.com/shorts/dQw4w9WgXcQ',
  'https://youtube.com/shorts/dQw4w9WgXcQ',
  'https://www.youtube.com/shorts/dQw4w9WgXcQ?feature=share',
  
  // Invalid URLs
  'https://vimeo.com/123456789',
  'https://not-youtube.com/watch?v=dQw4w9WgXcQ',
  'invalid-url'
];

console.log('YouTube URL Parsing Test Results:');
console.log('==================================');

testUrls.forEach((url, index) => {
  const videoId = extractVideoId(url);
  const videoType = getYouTubeVideoType(url);
  const isYouTube = isYouTubeUrl(url);
  
  console.log(`\nTest ${index + 1}: ${url}`);
  console.log(`  Video ID: ${videoId || 'null'}`);
  console.log(`  Video Type: ${videoType}`);
  console.log(`  Is YouTube URL: ${isYouTube}`);
  console.log(`  Expected ID: dQw4w9WgXcQ`);
  console.log(`  ✅ Correct: ${videoId === 'dQw4w9WgXcQ' ? 'YES' : 'NO'}`);
});

// Test edge cases
console.log('\n\nEdge Case Tests:');
console.log('================');

const edgeCases = [
  'https://www.youtube.com/shorts/dQw4w9WgXcQ?si=abc123',
  'https://www.youtube.com/shorts/dQw4w9WgXcQ#t=30s',
  'https://youtube.com/shorts/dQw4w9WgXcQ?utm_source=share',
];

edgeCases.forEach((url, index) => {
  const videoId = extractVideoId(url);
  console.log(`Edge Case ${index + 1}: ${url}`);
  console.log(`  Video ID: ${videoId}`);
  console.log(`  ✅ Correct: ${videoId === 'dQw4w9WgXcQ' ? 'YES' : 'NO'}`);
});

export { testUrls, edgeCases };
