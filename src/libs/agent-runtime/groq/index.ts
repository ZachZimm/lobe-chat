import { AgentRuntimeErrorType } from '../error';
import { ModelProvider } from '../types';
import { LobeOpenAICompatibleFactory } from '../utils/openaiCompatibleFactory';
import { GroqModelCard } from './type';

export const LobeGroq = LobeOpenAICompatibleFactory({
  baseURL: 'https://api.groq.com/openai/v1',
  chatCompletion: {
    handleError: (error) => {
      // 403 means the location is not supporteds
      if (error.status === 403)
        return { error, errorType: AgentRuntimeErrorType.LocationNotSupportError };
    },
    handlePayload: (payload) => {
      return {
        ...payload,
        // disable stream for tools due to groq dont support
        stream: !payload.tools,
      } as any;
    },
  },
  debug: {
    chatCompletion: () => process.env.DEBUG_GROQ_CHAT_COMPLETION === '1',
  },
  models: {
    transformModel: (m) => {
      const model = m as unknown as GroqModelCard;
      return {
        description: model.id,
        displayName: model.id,
        enabled: model.active,
        functionCall: model.id.toLowerCase().includes('tool-use'),
        id: model.id,
        tokens: model.context_window,
      };
    },
  },
  provider: ModelProvider.Groq,
});
