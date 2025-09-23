import { useState, useEffect, createContext, useContext } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  user_type: 'student' | 'faculty';
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string, userType?: string, skipConfirmation?: boolean) => Promise<{ error?: any }>;
  signIn: (email: string, password: string) => Promise<{ error?: any }>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const useAuthState = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchProfile = async (userId: string) => {
      try {
        const { data: profileData, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle();
        
        if (error) {
          console.error('Error fetching profile:', error);
          return;
        }
        
        if (mounted) {
          if (profileData) {
            setProfile({
              ...profileData,
              user_type: profileData.user_type as 'student' | 'faculty'
            });
          } else {
            // No profile found - user might need to create one
            setProfile(null);
          }
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        if (mounted) {
          setProfile(null);
        }
      }
    };

    // Set up auth state listener - CRITICAL: Must be synchronous to prevent deadlock
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) return;

        // Immediately update state synchronously
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        // Defer profile fetching to avoid deadlock
        if (session?.user) {
          setTimeout(() => {
            if (mounted) {
              fetchProfile(session.user.id);
            }
          }, 0);
        } else {
          setProfile(null);
        }
      }
    );

    // Check for existing session only once
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!mounted) return;

        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        if (session?.user) {
          await fetchProfile(session.user.id);
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    getInitialSession();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, fullName: string, userType: string = 'student', skipConfirmation: boolean = false) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const signUpOptions: any = {
      emailRedirectTo: redirectUrl,
      data: {
        full_name: fullName,
        user_type: userType
      }
    };
    
    // For demo accounts, skip email confirmation
    if (skipConfirmation) {
      signUpOptions.email_confirm = true;
    }
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: signUpOptions
    });
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    console.log('Attempting to sign in with:', email);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    console.log('Sign in result:', error ? 'Error: ' + error.message : 'Success');
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return {
    user,
    profile,
    session,
    loading,
    signUp,
    signIn,
    signOut
  };
};