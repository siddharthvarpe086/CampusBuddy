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
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    const mistralApiKey = Deno.env.get('MISTRAL_API_KEY');

    if (!geminiApiKey) {
      throw new Error('GEMINI_API_KEY not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch all college data including parsed content from documents
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

    // Build comprehensive context from all college data
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

    // First, try Mistral with document context for document-based questions
    console.log('Attempting Mistral AI with document context...');
    
    const mistralSystemPrompt = `You are CampusBuddy, a professional campus assistant. Answer questions based on the college documents and data provided.

RULES:
1. Answer ONLY college-related questions (academics, events, faculty, campus, facilities, timetables, documents)
2. Use the document content and database to provide accurate answers
3. Format important information in **bold** (double asterisks only)
4. Keep answers clear, concise, and professional (2-4 sentences)
5. NEVER use single asterisks (*) in your output
6. If you cannot find the answer in the provided data, respond EXACTLY with: "SYNCSPOT_REDIRECT"

College Database:
${fullContext || 'No data available yet.'}`;

    try {
      // Primary: Try Mistral first for document-based answers
      const mistralResponse = await fetch(
        'https://api.mistral.ai/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${mistralApiKey}`
          },
          body: JSON.stringify({
            model: 'mistral-large-latest',
            messages: [
              { role: 'system', content: mistralSystemPrompt },
              { role: 'user', content: message }
            ],
            temperature: 0.7,
            max_tokens: 500
          })
        }
      );

      if (!mistralResponse.ok) {
        const errorText = await mistralResponse.text();
        console.error('Mistral API error:', mistralResponse.status, errorText);
        throw new Error('Mistral API failed');
      }

      const mistralData = await mistralResponse.json();
      console.log('Mistral response received');
      
      let responseText = mistralData.choices?.[0]?.message?.content || 'No response generated';
      
      // Remove single asterisks
      responseText = responseText.replace(/(?<!\*)\*(?!\*)/g, '');

      // Check if Mistral couldn't find the answer
      if (responseText.includes('SYNCSPOT_REDIRECT')) {
        // Post question to SyncSpot automatically
        const authHeader = req.headers.get('authorization');
        if (authHeader) {
          try {
            const token = authHeader.replace('Bearer ', '');
            const supabaseClient = createClient(supabaseUrl, supabaseKey, {
              global: { headers: { Authorization: authHeader } }
            });
            
            const { data: userData } = await supabaseClient.auth.getUser(token);
            
            if (userData?.user) {
              await supabaseClient
                .from('syncspot_questions')
                .insert({
                  question: message,
                  user_id: userData.user.id
                });
              
              console.log('Question posted to SyncSpot');
            }
          } catch (syncSpotError) {
            console.error('Error posting to SyncSpot:', syncSpotError);
          }
        }
        
        return new Response(JSON.stringify({ 
          response: "I don't have information about this in my database. I've posted your question to **SyncSpot** where the community can help answer it.",
          redirect: 'syncspot'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ 
        response: responseText,
        source: 'mistral'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } catch (mistralError) {
      console.error('Mistral failed, trying Gemini as fallback:', mistralError);
      
      // Fallback: Try Gemini if Mistral fails
      if (geminiApiKey) {
        try {
          const geminiSystemPrompt = `You are CampusBuddy. Answer college-related questions based on the database.

RULES:
1. ONLY answer college-related questions (academics, events, faculty, campus, facilities)
2. If NOT college-related, say: "I can only help with college-related questions."
3. Use **bold** for important info (double asterisks only)
4. Keep answers concise (2-4 sentences)
5. NEVER use single asterisks (*)
6. If no answer found, respond: "SYNCSPOT_REDIRECT"

Database:
${fullContext || 'No data available.'}`;

          const geminiResponse = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${geminiApiKey}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [{
                  parts: [{
                    text: `${geminiSystemPrompt}\n\nQuestion: ${message}`
                  }]
                }],
                generationConfig: {
                  temperature: 0.7,
                  maxOutputTokens: 500,
                }
              })
            }
          );

          if (!geminiResponse.ok) {
            throw new Error('Gemini API also failed');
          }

          const geminiData = await geminiResponse.json();
          let responseText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated';
          
          responseText = responseText.replace(/(?<!\*)\*(?!\*)/g, '');

          if (responseText.includes('SYNCSPOT_REDIRECT')) {
            const authHeader = req.headers.get('authorization');
            if (authHeader) {
              try {
                const token = authHeader.replace('Bearer ', '');
                const supabaseClient = createClient(supabaseUrl, supabaseKey, {
                  global: { headers: { Authorization: authHeader } }
                });
                
                const { data: userData } = await supabaseClient.auth.getUser(token);
                
                if (userData?.user) {
                  await supabaseClient
                    .from('syncspot_questions')
                    .insert({
                      question: message,
                      user_id: userData.user.id
                    });
                }
              } catch (syncSpotError) {
                console.error('Error posting to SyncSpot:', syncSpotError);
              }
            }
            
            return new Response(JSON.stringify({ 
              response: "I don't have information about this in my database. I've posted your question to **SyncSpot** where the community can help answer it.",
              redirect: 'syncspot'
            }), {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }

          return new Response(JSON.stringify({ 
            response: responseText,
            source: 'gemini'
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });

        } catch (geminiError) {
          console.error('Both Mistral and Gemini failed:', geminiError);
          throw new Error('All AI services are currently unavailable');
        }
      }

      throw mistralError;
    }

  } catch (error) {
    console.error('Error in ai-chat function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(JSON.stringify({ 
      error: errorMessage,
      response: "I'm having trouble accessing my knowledge base right now. Please try again later."
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
