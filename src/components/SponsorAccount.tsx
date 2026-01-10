import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Building2, ArrowLeft, Save, Mail, MapPin, Briefcase } from 'lucide-react';

interface SponsorAccountProps {
  onBack: () => void;
}

export function SponsorAccount({ onBack }: SponsorAccountProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sponsorData, setSponsorData] = useState({
    company_name: '',
    business_type: '',
    address: '',
    contact_email: '',
  });

  useEffect(() => {
    loadSponsorData();
  }, []);

  const loadSponsorData = async () => {
    setLoading(true);

    const { data: sponsor } = await supabase
      .from('sponsors')
      .select('*')
      .eq('user_id', user?.id)
      .single();

    if (sponsor) {
      setSponsorData({
        company_name: sponsor.company_name || '',
        business_type: sponsor.business_type || '',
        address: sponsor.address || '',
        contact_email: sponsor.contact_email || '',
      });
    }

    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);

    const { error } = await supabase
      .from('sponsors')
      .update({
        company_name: sponsorData.company_name,
        business_type: sponsorData.business_type,
        address: sponsorData.address,
        contact_email: sponsorData.contact_email,
      })
      .eq('user_id', user?.id);

    if (error) {
      console.error('Error updating sponsor data:', error);
      alert('Failed to update account information');
    } else {
      alert('Account information updated successfully!');
    }

    setSaving(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-lg">
          <div className="p-6 border-b">
            <div className="flex items-center gap-3">
              <Building2 className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Sponsor Account</h1>
                <p className="text-sm text-gray-600">Manage your company information</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username
                </label>
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-600">
                  <Mail className="w-5 h-5" />
                  {user?.username}
                </div>
                <p className="mt-1 text-xs text-gray-500">Username cannot be changed</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Name
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={sponsorData.company_name}
                    onChange={(e) => setSponsorData({ ...sponsorData, company_name: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter company name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Type
                </label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <select
                    value={sponsorData.business_type}
                    onChange={(e) => setSponsorData({ ...sponsorData, business_type: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select business type</option>
                    <option value="Restaurant">Restaurant</option>
                    <option value="Bar">Bar</option>
                    <option value="Cafe">Cafe</option>
                    <option value="Retail Store">Retail Store</option>
                    <option value="Gym">Gym</option>
                    <option value="Hotel">Hotel</option>
                    <option value="Entertainment Venue">Entertainment Venue</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Address
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <textarea
                    value={sponsorData.address}
                    onChange={(e) => setSponsorData({ ...sponsorData, address: e.target.value })}
                    rows={3}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="123 Main St, City, State ZIP"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={sponsorData.contact_email}
                    onChange={(e) => setSponsorData({ ...sponsorData, contact_email: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="contact@company.com"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
                >
                  <Save className="w-5 h-5" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  onClick={onBack}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
