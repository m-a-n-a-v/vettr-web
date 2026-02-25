/**
 * AI Agent Types
 *
 * TypeScript interfaces for the VETTR AI Agent feature
 */

/**
 * AI Agent Question
 * Represents a question that can be asked to the AI agent
 */
export interface AiAgentQuestion {
  id: string;
  label: string;
  category: string;
  parent_id: string | null;
  icon: string;
}

/**
 * AI Agent Detail
 * Data point with status indicator in response details grid
 */
export interface AiAgentDetail {
  label: string;
  value: string;
  status: 'safe' | 'warning' | 'danger' | 'neutral';
}

/**
 * AI Agent Response Data
 * The formatted response content with summary, details, and verdict
 */
export interface AiAgentResponseData {
  summary: string;
  details: AiAgentDetail[];
  verdict: string;
  verdict_color: 'green' | 'yellow' | 'red';
}

/**
 * AI Agent Response
 * Complete response from asking a question, including follow-ups and usage
 */
export interface AiAgentResponse {
  question_id: string;
  ticker: string;
  response: AiAgentResponseData;
  follow_up_questions: AiAgentQuestion[];
  usage: AiAgentUsage;
}

/**
 * AI Agent Usage
 * Daily question usage tracking with tier limits
 */
export interface AiAgentUsage {
  used: number;
  limit: number;
  remaining: number;
  resets_at: string;
}

/**
 * AI Agent Conversation Entry
 * A single Q&A pair in the conversation history
 */
export interface AiAgentConversationEntry {
  question: AiAgentQuestion;
  response: AiAgentResponse;
  timestamp: number;
}
