import React from 'react';
import { ArrowLeft, Bell, Calendar, AlertCircle, Info, CheckCircle } from 'lucide-react';

interface MusicStemsAnnouncementsProps {
  onBack: () => void;
}

export function MusicStemsAnnouncements({ onBack }: MusicStemsAnnouncementsProps) {
  const announcements = [
    {
      id: 1,
      type: 'update',
      title: 'Platform Update: New Features Released',
      message: 'We have added new analytics tools to help you track your stem performance across campaigns. Check out the updated dashboard to see detailed insights about your stems.',
      date: '2026-01-08',
      icon: CheckCircle,
      color: 'green',
    },
    {
      id: 2,
      type: 'info',
      title: 'New Drop Locations Added',
      message: '15 new drop locations have been added across major US cities including Miami, Seattle, and Austin. More opportunities for your stems to reach creators!',
      date: '2026-01-05',
      icon: Info,
      color: 'blue',
    },
    {
      id: 3,
      type: 'alert',
      title: 'Upcoming System Maintenance',
      message: 'Scheduled maintenance on January 15th from 2:00 AM to 4:00 AM EST. The platform will be temporarily unavailable during this time.',
      date: '2026-01-03',
      icon: AlertCircle,
      color: 'amber',
    },
    {
      id: 4,
      type: 'update',
      title: 'Remix Contest Announced',
      message: 'Enter your remixed stems into our Q1 2026 contest! Winners will receive featured placement and cash prizes. Submissions open February 1st.',
      date: '2026-01-01',
      icon: CheckCircle,
      color: 'green',
    },
    {
      id: 5,
      type: 'info',
      title: 'Welcome to Music Stems Platform',
      message: 'Thank you for joining our community of artists, creators, and sponsors. Explore the platform to upload your stems, track performance, and connect with the ecosystem.',
      date: '2025-12-28',
      icon: Info,
      color: 'blue',
    },
  ];

  const colorMap: { [key: string]: { bg: string; border: string; text: string; icon: string } } = {
    green: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-900',
      icon: 'text-green-600',
    },
    blue: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-900',
      icon: 'text-blue-600',
    },
    amber: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      text: 'text-amber-900',
      icon: 'text-amber-600',
    },
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-white rounded-lg transition-colors mb-6 border border-gray-200"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Artist Portal
        </button>

        <div className="bg-white rounded-lg shadow-lg">
          <div className="p-6 border-b">
            <div className="flex items-center gap-3">
              <Bell className="w-8 h-8 text-blue-600" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Music Stems Announcements</h2>
                <p className="text-sm text-gray-600 mt-1">Stay updated with platform news and updates</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="space-y-4">
              {announcements.map((announcement) => {
                const colors = colorMap[announcement.color];
                const Icon = announcement.icon;

                return (
                  <div
                    key={announcement.id}
                    className={`border rounded-lg p-5 ${colors.bg} ${colors.border}`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${colors.bg} border ${colors.border}`}>
                        <Icon className={`w-5 h-5 ${colors.icon}`} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className={`font-semibold ${colors.text}`}>{announcement.title}</h3>
                          <div className="flex items-center gap-1 text-xs text-gray-600 ml-4">
                            <Calendar className="w-3 h-3" />
                            {new Date(announcement.date).toLocaleDateString()}
                          </div>
                        </div>

                        <p className="text-sm text-gray-700 leading-relaxed">
                          {announcement.message}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
