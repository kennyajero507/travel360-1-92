
import { useEffect } from 'react';
import { QueryClient } from '@tanstack/react-query';
import { supabase } from '../integrations/supabase/client';

interface UseRealtimeSyncOptions {
  table: string;
  orgId?: string | null; // If passed, filter by org_id
  queryKeysInvalidate: string[]; // react-query keys to invalidate
  filterColumn?: string; // Optionally filter by a column (e.g., org_id)
  filterValue?: string | number; // Optionally filter by a value
  queryClient: QueryClient;
}

export function useRealtimeSync({
  table,
  queryKeysInvalidate,
  queryClient,
  orgId,
  filterColumn,
  filterValue,
}: UseRealtimeSyncOptions) {
  useEffect(() => {
    // Setup filters dynamically
    let filterStr = '';
    if (filterColumn && filterValue) {
      filterStr = `${filterColumn}=eq.${filterValue}`;
    } else if (orgId) {
      filterStr = `org_id=eq.${orgId}`;
    }

    const channelName = `${table}-sync${filterStr ? `-${filterStr}` : ''}`;

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table,
          ...(filterStr ? { filter: filterStr } : {}),
        },
        (payload) => {
          // Invalidate all associated query keys for the table
          queryKeysInvalidate.forEach((key) =>
            queryClient.invalidateQueries({ queryKey: [key] })
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // Only rerun if orgId/filter changes
  }, [table, filterColumn, filterValue, orgId, JSON.stringify(queryKeysInvalidate), queryClient]);
}
