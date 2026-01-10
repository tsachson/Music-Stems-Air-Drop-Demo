import React, { useState, useEffect } from 'react';
import { ArrowLeft, User, Save } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface CreatorAccountProps {
  onBack: () => void;
}

export function CreatorAccount({ onBack }: CreatorAccountProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [creatorData, setCreatorData] = useState({
    creator_name: '',
    bio: '',
  });

  useEffect(() => {
    loadCreatorData();
  }, []);

  const loadCreatorData = async () => {
    setLoading(true);
    const { data: creator } = await supabase
      .from('creators')
      .select('*')
      .eq('user_id', user?.id)
      .maybeSingle();

    if (creator) {
      setCreatorData({
        creator_name: creator.creator_name || '',
        bio: creator.bio || '',
      });
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);

    try {
      const { data: existingCreator, error: fetchError } = await supabase
        .from('creators')
        .select('id')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (fetchError) {
        console.error('Error fetching creator:', fetchError);
        alert(`Error fetching profile: ${fetchError.message}`);
        setSaving(false);
        return;
      }

      if (existingCreator) {
        const { error } = await supabase
          .from('creators')
          .update({
            creator_name: creatorData.creator_name,
            bio: creatorData.bio,
          })
          .eq('user_id', user?.id);

        if (error) {
          console.error('Error updating profile:', error);
          alert(`Error updating profile: ${error.message}`);
        } else {
          alert('Profile updated successfully!');
        }
      } else {
        const { error } = await supabase
          .from('creators')
          .insert({
            user_id: user?.id,
            creator_name: creatorData.creator_name,
            bio: creatorData.bio,
          });

        if (error) {
          console.error('Error creating profile:', error);
          alert(`Error creating profile: ${error.message}`);
        } else {
          alert('Profile created successfully!');
        }
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      alert(`Unexpected error: ${err}`);
    }

    setSaving(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-4xl mx-auto px-4 py-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>

        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <div className="flex items-center gap-3">
              <User className="w-8 h-8 text-blue-600" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Creator Account</h2>
                <p className="text-sm text-gray-600">Manage your creator profile</p>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading...</div>
          ) : (
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={user?.username || ''}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                />
                <p className="text-xs text-gray-500 mt-1">Username cannot be changed</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                />
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Creator Name *
                </label>
                <input
                  type="text"
                  value={creatorData.creator_name}
                  onChange={(e) => setCreatorData({ ...creatorData, creator_name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Your creator name or alias"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bio
                </label>
                <textarea
                  value={creatorData.bio}
                  onChange={(e) => setCreatorData({ ...creatorData, bio: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Tell us about yourself..."
                />
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleSave}
                  disabled={saving || !creatorData.creator_name}
                  className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  <Save className="w-4 h-4" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
