import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface SeparationRequest {
  action: 'start' | 'status';
  jobId: string;
  audioUrl?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { action, jobId, audioUrl }: SeparationRequest = await req.json();

    if (action === 'start') {
      const replicateToken = Deno.env.get('REPLICATE_API_TOKEN');
      
      if (!replicateToken) {
        await supabase
          .from('separation_jobs')
          .update({
            status: 'failed',
            error_message: 'Replicate API token not configured. Please add your Replicate API token to proceed.',
            completed_at: new Date().toISOString(),
          })
          .eq('id', jobId);

        return new Response(
          JSON.stringify({
            success: false,
            error: 'Replicate API token not configured. Please add your Replicate API token at: https://replicate.com/account/api-tokens',
          }),
          {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      const response = await fetch('https://api.replicate.com/v1/predictions', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${replicateToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          version: 'd60b06b7a12c0c0e8886a86da16f0b9afaead85c0c1c113e44c77f3177193c3a',
          input: {
            audio: audioUrl,
            stem: '4stems',
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        await supabase
          .from('separation_jobs')
          .update({
            status: 'failed',
            error_message: `Replicate API error: ${errorText}`,
            completed_at: new Date().toISOString(),
          })
          .eq('id', jobId);

        return new Response(
          JSON.stringify({ success: false, error: errorText }),
          {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      const prediction = await response.json();

      await supabase
        .from('separation_jobs')
        .update({
          status: 'processing',
          replicate_prediction_id: prediction.id,
        })
        .eq('id', jobId);

      return new Response(
        JSON.stringify({
          success: true,
          predictionId: prediction.id,
          status: prediction.status,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (action === 'status') {
      const { data: job, error: jobError } = await supabase
        .from('separation_jobs')
        .select('*')
        .eq('id', jobId)
        .maybeSingle();

      if (jobError || !job) {
        return new Response(
          JSON.stringify({ success: false, error: 'Job not found' }),
          {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      if (job.status === 'completed' || job.status === 'failed') {
        return new Response(
          JSON.stringify({
            success: true,
            status: job.status,
            stems: job.separated_stems_urls,
            error: job.error_message,
          }),
          {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      const replicateToken = Deno.env.get('REPLICATE_API_TOKEN');
      if (!replicateToken || !job.replicate_prediction_id) {
        return new Response(
          JSON.stringify({
            success: true,
            status: job.status,
          }),
          {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      const response = await fetch(
        `https://api.replicate.com/v1/predictions/${job.replicate_prediction_id}`,
        {
          headers: {
            'Authorization': `Token ${replicateToken}`,
          },
        }
      );

      if (!response.ok) {
        return new Response(
          JSON.stringify({
            success: true,
            status: job.status,
          }),
          {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      const prediction = await response.json();

      if (prediction.status === 'succeeded') {
        const stemsUrls = {
          vocals: prediction.output?.vocals || null,
          drums: prediction.output?.drums || null,
          bass: prediction.output?.bass || null,
          other: prediction.output?.other || null,
        };

        await supabase
          .from('separation_jobs')
          .update({
            status: 'completed',
            separated_stems_urls: stemsUrls,
            completed_at: new Date().toISOString(),
          })
          .eq('id', jobId);

        await supabase
          .from('songs')
          .update({
            has_separated_stems: true,
            separation_job_id: jobId,
          })
          .eq('id', job.song_id);

        return new Response(
          JSON.stringify({
            success: true,
            status: 'completed',
            stems: stemsUrls,
          }),
          {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      } else if (prediction.status === 'failed') {
        await supabase
          .from('separation_jobs')
          .update({
            status: 'failed',
            error_message: prediction.error || 'Unknown error',
            completed_at: new Date().toISOString(),
          })
          .eq('id', jobId);

        return new Response(
          JSON.stringify({
            success: true,
            status: 'failed',
            error: prediction.error,
          }),
          {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      return new Response(
        JSON.stringify({
          success: true,
          status: prediction.status,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});