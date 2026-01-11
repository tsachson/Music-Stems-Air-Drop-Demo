import React, { useState, useEffect } from 'react';
import { Music2, Upload, Loader2, CheckCircle2, XCircle, Download, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface SeparationJob {
  id: string;
  song_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  original_audio_url: string;
  separated_stems_urls: {
    vocals: string | null;
    drums: string | null;
    bass: string | null;
    other: string | null;
  } | null;
  error_message: string | null;
  created_at: string;
}

export function StemSeparator() {
  const { user } = useAuth();
  const [audioUrl, setAudioUrl] = useState('');
  const [songTitle, setSongTitle] = useState('');
  const [genre, setGenre] = useState('Pop');
  const [isProcessing, setIsProcessing] = useState(false);
  const [jobs, setJobs] = useState<SeparationJob[]>([]);
  const [showApiKeyPrompt, setShowApiKeyPrompt] = useState(false);

  const genres = ['Rock', 'Pop', 'Hip-Hop', 'Electronic', 'Jazz', 'R&B', 'Gospel', 'Country', 'World', 'Other'];

  useEffect(() => {
    if (user) {
      loadJobs();
    }
  }, [user]);

  const loadJobs = async () => {
    if (!user) return;

    const { data: artist } = await supabase
      .from('artists')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!artist) return;

    const { data: jobsData } = await supabase
      .from('separation_jobs')
      .select('*')
      .eq('artist_id', artist.id)
      .order('created_at', { ascending: false });

    if (jobsData) {
      setJobs(jobsData);
    }
  };

  const startSeparation = async () => {
    if (!audioUrl || !songTitle || !user) return;

    setIsProcessing(true);

    try {
      const { data: artist } = await supabase
        .from('artists')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!artist) {
        alert('Artist profile not found');
        setIsProcessing(false);
        return;
      }

      const { data: song, error: songError } = await supabase
        .from('songs')
        .insert({
          artist_id: artist.id,
          title: songTitle,
          genre,
          audio_file_url: audioUrl,
        })
        .select()
        .single();

      if (songError || !song) {
        alert('Failed to create song');
        setIsProcessing(false);
        return;
      }

      const { data: job, error: jobError } = await supabase
        .from('separation_jobs')
        .insert({
          song_id: song.id,
          artist_id: artist.id,
          original_audio_url: audioUrl,
          status: 'pending',
        })
        .select()
        .single();

      if (jobError || !job) {
        alert('Failed to create separation job');
        setIsProcessing(false);
        return;
      }

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      const response = await fetch(`${supabaseUrl}/functions/v1/separate-stems/start`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobId: job.id,
          audioUrl,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        if (result.error?.includes('Replicate API token')) {
          setShowApiKeyPrompt(true);
        } else {
          alert(`Failed to start separation: ${result.error}`);
        }
        setIsProcessing(false);
        loadJobs();
        return;
      }

      setAudioUrl('');
      setSongTitle('');
      setIsProcessing(false);
      loadJobs();

      pollJobStatus(job.id);
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to start separation');
      setIsProcessing(false);
    }
  };

  const pollJobStatus = async (jobId: string) => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    const poll = async () => {
      const response = await fetch(`${supabaseUrl}/functions/v1/separate-stems/status`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ jobId }),
      });

      const result = await response.json();

      if (result.status === 'completed' || result.status === 'failed') {
        loadJobs();
        return;
      }

      setTimeout(poll, 5000);
    };

    poll();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'processing':
        return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
      default:
        return <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
        <div className="flex items-center gap-3 mb-6">
          <Music2 className="w-8 h-8 text-blue-600" />
          <h2 className="text-3xl font-bold text-gray-900">AI Stem Separator</h2>
        </div>

        {showApiKeyPrompt && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5 mr-3" />
              <div>
                <h3 className="text-sm font-medium text-yellow-800">Replicate API Token Required</h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p className="mb-2">To use the stem separator, you need a Replicate API token:</p>
                  <ol className="list-decimal list-inside space-y-1 ml-2">
                    <li>Go to <a href="https://replicate.com/account/api-tokens" target="_blank" rel="noopener noreferrer" className="underline font-medium">replicate.com/account/api-tokens</a></li>
                    <li>Create an account or sign in</li>
                    <li>Generate an API token</li>
                    <li>Add it as REPLICATE_API_TOKEN in your Supabase project secrets</li>
                  </ol>
                  <p className="mt-3 text-xs">
                    Note: Replicate charges approximately $0.05-0.10 per song separation.
                  </p>
                </div>
                <button
                  onClick={() => setShowApiKeyPrompt(false)}
                  className="mt-3 text-sm font-medium text-yellow-800 underline"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Song Title
            </label>
            <input
              type="text"
              value={songTitle}
              onChange={(e) => setSongTitle(e.target.value)}
              placeholder="Enter song title"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Genre
            </label>
            <select
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {genres.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Audio File URL
            </label>
            <input
              type="url"
              value={audioUrl}
              onChange={(e) => setAudioUrl(e.target.value)}
              placeholder="https://example.com/song.mp3"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="mt-2 text-sm text-gray-500">
              Provide a direct URL to your audio file (MP3, WAV, FLAC, etc.)
            </p>
          </div>

          <button
            onClick={startSeparation}
            disabled={!audioUrl || !songTitle || isProcessing}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                Separate Stems
              </>
            )}
          </button>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-medium text-blue-900 mb-2">How it works:</h3>
          <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
            <li>Uses Demucs AI model via Replicate API</li>
            <li>Separates into 4 stems: Vocals, Drums, Bass, Other</li>
            <li>Processing takes 2-5 minutes per song</li>
            <li>High-quality professional separation</li>
          </ul>
        </div>
      </div>

      {jobs.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Separation Jobs</h3>
          <div className="space-y-4">
            {jobs.map((job) => (
              <div key={job.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    {getStatusIcon(job.status)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">
                          {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                        </span>
                        <span className="text-sm text-gray-500">
                          {new Date(job.created_at).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1 break-all">
                        {job.original_audio_url}
                      </p>
                      {job.error_message && (
                        <p className="text-sm text-red-600 mt-2">
                          Error: {job.error_message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {job.status === 'completed' && job.separated_stems_urls && (
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                    {Object.entries(job.separated_stems_urls).map(([stem, url]) => (
                      url && (
                        <a
                          key={stem}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
                        >
                          <Download className="w-4 h-4" />
                          <span className="text-sm font-medium capitalize">{stem}</span>
                        </a>
                      )
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
