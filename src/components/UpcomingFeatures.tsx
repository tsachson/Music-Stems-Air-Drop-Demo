import React from 'react';
import { Gift, Users, Building2, Music, Trophy, MessageCircle, Radio, Sparkles, Bot } from 'lucide-react';

interface UpcomingFeaturesProps {
  onBack: () => void;
}

export function UpcomingFeatures({ onBack }: UpcomingFeaturesProps) {
  const features = [
    {
      icon: Bot,
      title: 'Agentic AI Tools',
      description: 'Revolutionary AI-powered agents that assist with stem analysis, remix suggestions, and intelligent music production workflows.',
      category: 'AI Technology',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      icon: Gift,
      title: 'Stem Gifting',
      description: 'Send stems directly to other creators as gifts. Perfect for collaboration and building community.',
      category: 'Creator to Creator',
      color: 'text-pink-600',
      bgColor: 'bg-pink-50',
    },
    {
      icon: Users,
      title: 'Major Artist Collaborations',
      description: 'Connect with chart-topping artists for exclusive stem drops and collaborative remix opportunities.',
      category: 'Partnerships',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      icon: Building2,
      title: 'Major Label Partnerships',
      description: 'Access exclusive catalog stems from major record labels and music publishers.',
      category: 'Industry',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      icon: Music,
      title: 'Concert Stem Airdrops',
      description: 'Attend live concerts and receive rare, exclusive Additive stems dropped to fans in real-time at the venue.',
      category: 'Live Events',
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
    },
    {
      icon: Trophy,
      title: 'Remix Leaderboards',
      description: 'Compete on global leaderboards showcasing the most popular remixes and most downloaded stems.',
      category: 'Competition',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      icon: MessageCircle,
      title: 'Creator Social Feed & Q&A',
      description: 'Join the conversation! Ask questions, share tips, and connect with other creators in an interactive social feed.',
      category: 'Community',
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-50',
    },
    {
      icon: Radio,
      title: 'Artist Remix Channels',
      description: 'Follow dedicated artist channels with tutorials, tips, and guidance on creating amazing remixes.',
      category: 'Education',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    {
      icon: Sparkles,
      title: 'AI Stem Enhancement',
      description: 'Use AI-powered tools to enhance, clean, and optimize your stems for professional-quality remixes.',
      category: 'Technology',
      color: 'text-violet-600',
      bgColor: 'bg-violet-50',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <button
            onClick={onBack}
            className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-2 mb-4"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Upcoming Features</h1>
          <p className="text-lg text-gray-600">
            Exciting innovations coming soon to the Additive platform. Stay tuned!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-6 border-2 border-transparent hover:border-blue-200"
            >
              <div className="flex items-start gap-4">
                <div className={`${feature.bgColor} rounded-lg p-3 shrink-0`}>
                  <feature.icon className={`w-6 h-6 ${feature.color}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-xl font-bold text-gray-900">{feature.title}</h3>
                    <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                      {feature.category}
                    </span>
                  </div>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl shadow-lg p-8 text-white">
          <h2 className="text-2xl font-bold mb-3">Want to See a Feature Added?</h2>
          <p className="text-blue-50 mb-4">
            We're always listening to our community! Share your ideas and help shape the future of Additive.
          </p>
          <button className="bg-white text-blue-600 font-semibold px-6 py-3 rounded-lg hover:bg-blue-50 transition-colors">
            Submit Feature Request
          </button>
        </div>
      </main>
    </div>
  );
}
