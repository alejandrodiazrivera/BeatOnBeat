/**
 * Simple debugging component to test YouTube URL parsing
 * Add this to your app temporarily to test different URLs
 */

'use client';
import { useState } from 'react';
import { extractVideoId, getYouTubeVideoType, isYouTubeUrl } from '../utils/youtubeUtils';

export default function YouTubeUrlTester() {
  const [testUrl, setTestUrl] = useState('');
  
  const videoId = extractVideoId(testUrl);
  const videoType = getYouTubeVideoType(testUrl);
  const isYouTube = isYouTubeUrl(testUrl);
  
  const testUrls = [
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    'https://youtu.be/dQw4w9WgXcQ',
    'https://www.youtube.com/shorts/dQw4w9WgXcQ',
    'https://youtube.com/shorts/dQw4w9WgXcQ?si=abc123',
  ];
  
  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">YouTube URL Tester</h2>
      
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">
          Test URL:
        </label>
        <input
          type="text"
          value={testUrl}
          onChange={(e) => setTestUrl(e.target.value)}
          placeholder="Paste YouTube URL here..."
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      
      {testUrl && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-bold mb-2">Results:</h3>
          <div className="space-y-2">
            <div>
              <span className="font-medium">Video ID:</span> 
              <span className={`ml-2 ${videoId ? 'text-green-600' : 'text-red-600'}`}>
                {videoId || 'null'}
              </span>
            </div>
            <div>
              <span className="font-medium">Video Type:</span> 
              <span className="ml-2">{videoType}</span>
            </div>
            <div>
              <span className="font-medium">Is YouTube URL:</span> 
              <span className={`ml-2 ${isYouTube ? 'text-green-600' : 'text-red-600'}`}>
                {isYouTube ? 'Yes' : 'No'}
              </span>
            </div>
            <div>
              <span className="font-medium">Valid:</span> 
              <span className={`ml-2 ${videoId ? 'text-green-600' : 'text-red-600'}`}>
                {videoId ? '✅ Valid' : '❌ Invalid'}
              </span>
            </div>
          </div>
        </div>
      )}
      
      <div>
        <h3 className="font-bold mb-2">Quick Test URLs:</h3>
        <div className="space-y-2">
          {testUrls.map((url, index) => (
            <button
              key={index}
              onClick={() => setTestUrl(url)}
              className="block w-full text-left p-2 bg-blue-50 hover:bg-blue-100 rounded border border-blue-200 text-sm"
            >
              {url}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
