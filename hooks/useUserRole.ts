// hooks/useUserRole.ts
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export const useUserRole = () => {
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getRole = async () => {
      const { data: { user } } = await supabase.auth.getUser();
 
      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        setRole(data?.role ?? null);
      }
      setLoading(false);
    };

    getRole();
  }, []);

  return { role, loading };
};
