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
    message: string = 'Some error occurred during chat completion, please edit and save the notes again',
  ) {
    super(message)
  }
}

// We can change message for client side error here
export class ChatCompletionClientError extends ChatCompletionError {
  constructor(message: string = 'Internal error, please edit and save the notes again.') {
    super(message)
  }
}

export const CHAT_COMPLETION_ERROR_MESSAGES_MAPPING = {
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
