import { BaseException } from './base'

export class ChatCompletionError extends BaseException {
  constructor(message: string = 'Some error occurred during chat completion') {
    super(message)
  }
}

export class ChatCompletionTooManyRequestsError extends ChatCompletionError {
  constructor(message: string = 'Heavy usage. Please try again in a minute.') {
    super(message)
  }
}

// We can change message for server side error here
export class ChatCompletionServerError extends ChatCompletionError {
  constructor(
    message: string = 'The AI request failed. Please retry.',
  ) {
    super(message)
  }
}

// We can change message for client side error here
export class ChatCompletionClientError extends ChatCompletionError {
  constructor(message: string = 'The AI request could not be completed. Please retry.') {
    super(message)
  }
}

export class ModelNotConfiguredError extends ChatCompletionError {
  constructor() {
    super('Choose a model provider in Settings: sign in to Knapsack or add a provider API key, then retry.')
  }
}

export const CHAT_COMPLETION_ERROR_MESSAGES_MAPPING = {
  MODEL_NOT_CONFIGURED: ModelNotConfiguredError,
  TOO_MANY_REQUESTS: ChatCompletionTooManyRequestsError,
  CHAT_COMPLETION_FAILED: ChatCompletionServerError,
  CHAT_COMPLETION_CLIENT_FAILED: ChatCompletionClientError,
}

export const throwChatCompletionError = ({
  errorCode,
  customMessage,
}: {
  errorCode?: keyof typeof CHAT_COMPLETION_ERROR_MESSAGES_MAPPING
  customMessage?: string
}) => {
  let Exception = ChatCompletionError
  if (errorCode) {
    Exception = CHAT_COMPLETION_ERROR_MESSAGES_MAPPING[errorCode] ?? ChatCompletionError
  }
  throw new Exception(customMessage)
}
