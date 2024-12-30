import { AgentMessage, Priority, AgentIdentifier } from '../../types/agent';
import { ToastConfig } from '../../types/toast';

export const getToastConfigFromAgentMessage = (
  message: AgentMessage
): { message: string; source: AgentIdentifier; priority: Priority; config: ToastConfig } => {
  switch (message.type) {
    case 'agent_error':
      return {
        message: message.error,
        source: message.source || { type: 'assessment', id: 'unknown' },
        priority: 'high',
        config: {
          variant: 'error',
          duration: 10000, // Errors stay longer
        }
      };

    case 'insight_generated':
      return {
        message: message.payload.message,
        source: message.source || { type: 'analysis', id: 'unknown' },
        priority: message.payload.priority,
        config: {
          variant: message.payload.priority === 'high' ? 'warning' : 'info',
          duration: message.payload.priority === 'high' ? 8000 : 5000,
        }
      };

    case 'metric_update':
      return {
        message: `${message.metric}: ${message.data.value}${message.data.trend ? ` (${message.data.trend > 0 ? '+' : ''}${message.data.trend}%)` : ''}`,
        source: message.source || { type: 'analysis', id: 'unknown' },
        priority: 'low',
        config: {
          variant: 'info',
          duration: 3000,
        }
      };

    case 'session_started':
    case 'session_ended':
      return {
        message: `Session ${message.type === 'session_started' ? 'started' : 'ended'}: ${message.session_id}`,
        source: message.source || { type: 'assessment', id: 'unknown' },
        priority: 'medium',
        config: {
          variant: 'success',
          duration: 4000,
        }
      };

    default:
      return {
        message: 'Unknown agent message type',
        source: { type: 'assessment', id: 'unknown' },
        priority: 'low',
        config: {
          variant: 'info',
          duration: 3000,
        }
      };
  }
};

export const useAgentToasts = (addAgentToast: (
  message: string,
  source: AgentIdentifier,
  priority: Priority,
  config?: ToastConfig
) => void) => {
  return {
    handleAgentMessage: (message: AgentMessage) => {
      const { message: toastMessage, source, priority, config } = getToastConfigFromAgentMessage(message);
      addAgentToast(toastMessage, source, priority, config);
    }
  };
};