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
    let initialLoadComplete = false;

    const fetchProfile = async (userId: string) => {
      try {
        const { data: profileData, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle();
        
        if (error) {
          console.error('Error fetching profile:', error);
          return null;
        }
        
        return profileData ? {
          ...profileData,
          user_type: profileData.user_type as 'student' | 'faculty'
        } : null;
      } catch (error) {
        console.error('Error fetching profile:', error);
        return null;
      }
    };

    const handleAuthState = async (event: string, session: Session | null) => {
      if (!mounted) return;

      console.log('Auth state changed:', event, !!session);
      
      setSession(session);
      setUser(session?.user ?? null);
      
      try {
        if (session?.user) {
          const profileData = await fetchProfile(session.user.id);
          if (mounted) {
            setProfile(profileData);
          }
        } else {
          if (mounted) {
            setProfile(null);
          }
        }
      } catch (error) {
        console.error('Error handling auth state:', error);
        if (mounted) {
          setProfile(null);
        }
      }
      
      if (mounted && (!initialLoadComplete || event === 'SIGNED_OUT' || event === 'SIGNED_IN')) {
        setLoading(false);
        initialLoadComplete = true;
      }
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthState);

    // Get initial session with timeout fallback
    const getInitialSession = async () => {
      try {
        // Add a timeout to prevent indefinite loading
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Session fetch timeout')), 5000)
        );

        const sessionPromise = supabase.auth.getSession();
        
        const { data: { session } } = await Promise.race([sessionPromise, timeoutPromise]) as any;
        
        await handleAuthState('INITIAL_SESSION', session);
      } catch (error) {
        console.error('Error getting initial session:', error);
        if (mounted) {
          setLoading(false);
          initialLoadComplete = true;
        }
      }
    };

    getInitialSession();

    // Fallback timeout to ensure loading never persists indefinitely
    const fallbackTimeout = setTimeout(() => {
      if (mounted && !initialLoadComplete) {
        console.warn('Auth loading timeout - forcing loading to false');
        setLoading(false);
        initialLoadComplete = true;
      }
    }, 8000);

    return () => {
      mounted = false;
      clearTimeout(fallbackTimeout);
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