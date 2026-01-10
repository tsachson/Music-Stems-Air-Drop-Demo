import React from 'react';
import { Share2 } from 'lucide-react';

interface SocialShareButtonsProps {
  title: string;
  contentType: 'remix' | 'song' | 'campaign';
  contentName?: string;
}

export function SocialShareButtons({ title, contentType, contentName }: SocialShareButtonsProps) {
  const getMessage = () => {
    if (contentType === 'song' && contentName) {
      return `Check out my latest remixing stems for my song "${contentName}"`;
    }
    if (contentName) {
      return `Check out my latest ${contentType}: "${contentName}" on Additive!`;
    }
    return `Check out my latest ${contentType} on Additive!`;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <Share2 className="w-5 h-5 text-blue-600" />
        <h3 className="font-semibold text-gray-900">{title}</h3>
      </div>
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          className="flex items-center gap-2 px-3 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors text-xs font-medium"
          title="Share on X (Twitter)"
        >
          <div className="w-3 h-3 bg-white rounded"></div>
          X
        </button>

        <button
          className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs font-medium"
          title="Share on Facebook"
        >
          <div className="w-3 h-3 bg-white rounded"></div>
          Facebook
        </button>

        <button
          className="flex items-center gap-2 px-3 py-2 bg-yellow-400 text-gray-900 rounded-lg hover:bg-yellow-500 transition-colors text-xs font-medium"
          title="Share on Snapchat"
        >
          <div className="w-3 h-3 bg-gray-900 rounded"></div>
          Snap
        </button>

        <button
          className="flex items-center gap-2 px-3 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-xs font-medium"
          title="Share on TikTok"
        >
          <div className="w-3 h-3 bg-white rounded"></div>
          TikTok
        </button>

        <button
          className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 text-white rounded-lg hover:opacity-90 transition-opacity text-xs font-medium"
          title="Share on Instagram"
        >
          <div className="w-3 h-3 bg-white rounded"></div>
          Instagram
        </button>
      </div>
      <p className="text-xs text-gray-600 mt-auto">{getMessage()}</p>
    </div>
  );
}
