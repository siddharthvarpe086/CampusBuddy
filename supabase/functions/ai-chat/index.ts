import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CollegeData {
  id: string;
  title: string;
  category: string;
  content: string;
  tags: string[] | null;
  created_at: string;
  file_url?: string;
  file_name?: string;
  file_type?: string;
  parsed_content?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message } = await req.json();
    
    if (!message) {
      throw new Error('Message is required');
    }

    console.log('Received message:', message);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: collegeData, error: dbError } = await supabase
      .from('college_data')
      .select('*')
      .order('created_at', { ascending: false });

    if (dbError) {
      console.error('Database error:', dbError);
      throw new Error('Failed to fetch college data');
    }

    const { data: syncSpotData, error: syncSpotError } = await supabase
      .from('syncspot_questions')
      .select(`
        *,
        syncspot_answers (*)
      `)
      .order('created_at', { ascending: false });

    if (syncSpotError) {
      console.error('SyncSpot data error:', syncSpotError);
    }

    const context = collegeData?.map((item: CollegeData) => {
      const tags = item.tags ? item.tags.join(', ') : '';
      let contextStr = `Title: ${item.title}\nCategory: ${item.category}\nContent: ${item.content}\nTags: ${tags}`;
      
      if (item.parsed_content) {
        contextStr += `\nDocument Content: ${item.parsed_content}`;
      }
      
      if (item.file_name) {
        contextStr += `\nAttached File: ${item.file_name} (${item.file_type || 'unknown type'})`;
      }
      
      return contextStr + '\n---';
    }).join('\n\n') || '';

    const syncSpotContext = syncSpotData?.map((question: any) => {
      if (question.syncspot_answers && question.syncspot_answers.length > 0) {
        const answers = question.syncspot_answers.map((answer: any) => 
          `Answer: ${answer.answer}`
        ).join('\n');
        return `Community Q&A:\nQuestion: ${question.question}\n${answers}\n---`;
      }
      return '';
    }).filter(Boolean).join('\n\n') || '';

    const fullContext = [context, syncSpotContext].filter(Boolean).join('\n\n');

    // AI integration removed - awaiting new configuration
    return new Response(JSON.stringify({ 
      response: "AI chat is currently being reconfigured. Please check back soon!"
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-chat function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      response: "I'm sorry, I'm having trouble accessing my knowledge base right now. Please try again later or contact the college administration directly for assistance."
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
