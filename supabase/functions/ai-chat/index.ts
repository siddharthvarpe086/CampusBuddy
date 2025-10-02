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

    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY not configured');
    }

    const systemPrompt = `You are a helpful college information assistant with real-time access to comprehensive college data including faculty information, contact details, departments, events, timings, uploaded documents, and community-generated answers from students.

IMPORTANT INSTRUCTIONS:
1. Search through the provided data in REAL-TIME to find relevant information
2. SYNTHESIZE the information in your own words - DO NOT copy-paste from the database
3. Keep responses SHORT, SPECIFIC, and CONVERSATIONAL
4. Extract key facts and present them naturally as if you're explaining to a friend
5. If you cannot find information, respond with: "NO_INFO_AVAILABLE: [restate the question]"
6. Do NOT make up information - only use what's in the provided context

RESPONSE STYLE:
- Be concise and to the point (2-3 sentences maximum unless more detail is needed)
- Use natural, conversational language
- Summarize multiple data points into clear, digestible answers
- Focus on the most relevant information for the specific question

College Data, Documents, and Community Answers:
${fullContext}

Student Question: ${message}`;

    console.log('Calling Gemini API...');

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: systemPrompt }]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          }
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', response.status, errorText);
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Gemini response received:', JSON.stringify(data));
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      console.error('Invalid Gemini response structure:', data);
      throw new Error('Invalid response from Gemini API');
    }

    const aiResponse = data.candidates[0].content.parts[0].text;

    if (aiResponse.startsWith('NO_INFO_AVAILABLE:')) {
      const question = aiResponse.replace('NO_INFO_AVAILABLE:', '').trim();
      return new Response(JSON.stringify({ noAnswer: true, question: question || message }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ response: aiResponse }), {
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
