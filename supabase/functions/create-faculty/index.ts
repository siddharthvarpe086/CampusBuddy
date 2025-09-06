import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create admin client with service role key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const facultyEmail = 'keystone'
    const facultyPassword = 'keystone'

    console.log('Creating faculty account with credentials:', facultyEmail)

    // First check if user already exists
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers()
    const existingUser = existingUsers.users?.find(user => user.email === facultyEmail)

    if (existingUser) {
      console.log('Faculty user already exists:', existingUser.id)
      return new Response(
        JSON.stringify({ success: true, message: 'Faculty account already exists', userId: existingUser.id }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create user with admin API (bypasses email confirmation)
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: facultyEmail,
      password: facultyPassword,
      email_confirm: true, // This will bypass email confirmation
      user_metadata: {
        full_name: 'Faculty Admin',
        user_type: 'faculty'
      }
    })

    if (createError) {
      console.error('Error creating faculty user:', createError)
      return new Response(
        JSON.stringify({ success: false, error: createError.message }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    console.log('Faculty user created successfully:', newUser.user?.id)

    // Create profile entry
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        user_id: newUser.user!.id,
        full_name: 'Faculty Admin',
        email: facultyEmail,
        user_type: 'faculty'
      })

    if (profileError) {
      console.error('Error creating faculty profile:', profileError)
      // Don't fail the whole operation, profile might be created by trigger
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Faculty account created successfully',
        userId: newUser.user!.id 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in create-faculty function:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})