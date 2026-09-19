/**
 * Utility functions for YouTube URL parsing and video ID extraction
 */

/**
 * Extracts the video ID from various YouTube URL formats
 * Supports:
 * - Regular videos: https://www.youtube.com/watch?v=VIDEO_ID
 * - Short URLs: https://youtu.be/VIDEO_ID
 * - Reels/Shorts: https://www.youtube.com/shorts/VIDEO_ID
 * 
 * @param url - The YouTube URL to parse
 * @returns The video ID if valid, null otherwise
 */
export const extractVideoId = (url: string): string | null => {
  try {
    // Sanitize URL first
    const sanitizedUrl = url.trim();
    
    // Regular YouTube video URLs
    if (sanitizedUrl.includes('youtube.com/watch?v=')) {
      const videoId = sanitizedUrl.split('v=')[1]?.split('&')[0];
      return videoId && isValidVideoId(videoId) ? videoId : null;
    } 
    // YouTube short URLs
    else if (sanitizedUrl.includes('youtu.be/')) {
      const videoId = sanitizedUrl.split('youtu.be/')[1]?.split('?')[0];
      return videoId && isValidVideoId(videoId) ? videoId : null;
    } 
    // YouTube Reels/Shorts URLs
    else if (sanitizedUrl.includes('youtube.com/shorts/')) {
      const videoId = sanitizedUrl.split('/shorts/')[1]?.split('?')[0];
      return videoId && isValidVideoId(videoId) ? videoId : null;
    }
    
    return null;
  } catch (error) {
    console.error('Error extracting video ID:', error);
    return null;
  }
};

/**
 * Validates if a string is a valid YouTube video ID
 * YouTube video IDs are 11 characters long and contain alphanumeric characters, hyphens, and underscores
 * 
 * @param videoId - The video ID to validate
 * @returns True if valid, false otherwise
 */
export const isValidVideoId = (videoId: string): boolean => {
  return /^[a-zA-Z0-9_-]{11}$/.test(videoId);
};

/**
 * Checks if a URL is a YouTube URL (any format)
 * 
 * @param url - The URL to check
 * @returns True if it's a YouTube URL, false otherwise
 */
export const isYouTubeUrl = (url: string): boolean => {
  const sanitizedUrl = url.trim().toLowerCase();
  return sanitizedUrl.includes('youtube.com') || sanitizedUrl.includes('youtu.be');
};

/**
 * Gets the video type from a YouTube URL
 * 
 * @param url - The YouTube URL
 * @returns The type of YouTube content ('video', 'shorts', 'unknown')
 */
export const getYouTubeVideoType = (url: string): 'video' | 'shorts' | 'unknown' => {
  const sanitizedUrl = url.trim().toLowerCase();
  
  if (sanitizedUrl.includes('youtube.com/shorts/')) {
    return 'shorts';
  } else if (sanitizedUrl.includes('youtube.com/watch') || sanitizedUrl.includes('youtu.be/')) {
    return 'video';
  }
  
  return 'unknown';
};

/**
 * Generates a YouTube thumbnail URL for a given video ID
 * 
 * @param videoId - The YouTube video ID
 * @param quality - The thumbnail quality ('default', 'medium', 'high', 'standard', 'maxres')
 * @returns The thumbnail URL
 */
export const getYouTubeThumbnail = (
  videoId: string, 
  quality: 'default' | 'medium' | 'high' | 'standard' | 'maxres' = 'medium'
): string => {
  const qualityMap = {
    'default': 'default.jpg',
    'medium': 'mqdefault.jpg',
    'high': 'hqdefault.jpg',
    'standard': 'sddefault.jpg',
    'maxres': 'maxresdefault.jpg'
  };
  
  return `https://img.youtube.com/vi/${videoId}/${qualityMap[quality]}`;
};
