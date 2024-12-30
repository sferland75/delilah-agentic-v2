// hooks/useAgent.ts

import { useState, useEffect, useCallback } from 'react';
import { agentService, MessageType, Priority, AgentMessage } from '../services/AgentService';

interface UseAgentOptions {
  onError?: (error: Error) => void;
  timeout?: number;
  priority?: Priority;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

interface AgentState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  lastUpdated: Date | null;
}

export function useAgent<T = any>(
  agentId: string,
  defaultValue: T | null = null,
  options: UseAgentOptions = {}
) {
  const [state, setState] = useState<AgentState<T>>({
    data: defaultValue,
    loading: false,
    error: null,
    lastUpdated: null
  });

  const queryAgent = useCallback(async (
    action: string,
    data: any,
    queryOptions: Partial<UseAgentOptions> = {}
  ) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const result = await agentService.queryAgent(
        agentId,
        action,
        data,
        queryOptions.priority || options.priority || Priority.NORMAL
      );

      setState(prev => ({
        ...prev,
        data: result,
        loading: false,
        lastUpdated: new Date(),
        error: null
      }));

      return result;
    } catch (error) {
      const errorObj = error as Error;
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorObj
      }));

      if (options.onError) {
        options.onError(errorObj);
      }

      throw error;
    }
  }, [agentId, options]);

  const subscribe = useCallback((
    eventType: string,
    callback: (data: any) => void
  ) => {
    return agentService.subscribeToAgent(agentId, eventType, callback);
  }, [agentId]);

  const refresh = useCallback(async () => {
    if (state.data) {
      await queryAgent('REFRESH', { previousData: state.data });
    }
  }, [queryAgent, state.data]);

  // Set up auto-refresh if enabled
  useEffect(() => {
    if (options.autoRefresh && options.refreshInterval) {
      const intervalId = setInterval(refresh, options.refreshInterval);
      return () => clearInterval(intervalId);
    }
  }, [options.autoRefresh, options.refreshInterval, refresh]);

  // Clear state on unmount
  useEffect(() => {
    return () => {
      setState({
        data: null,
        loading: false,
        error: null,
        lastUpdated: null
      });
    };
  }, []);

  return {
    ...state,
    queryAgent,
    subscribe,
    refresh
  };
}

// Example usage:
/*
function AssessmentComponent() {
  const {
    data: assessment,
    loading,
    error,
    queryAgent
  } = useAgent('assessment-agent', null, {
    onError: (error) => console.error('Assessment error:', error),
    autoRefresh: true,
    refreshInterval: 30000
  });

  useEffect(() => {
    queryAgent('GET_ASSESSMENT', { id: '123' });
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!assessment) return <div>No assessment data</div>;

  return (
    <div>
      <h2>{assessment.title}</h2>
      <pre>{JSON.stringify(assessment, null, 2)}</pre>
    </div>
  );
}
*/