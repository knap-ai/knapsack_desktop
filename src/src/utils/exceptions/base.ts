export class BaseException extends Error {
  constructor(message = 'An error occurred') {
    super(message)
  }
}

export const getResponseErrorCodeAndMessage = async (response: Response) => {
  try {
    const errorResponse = await response.json()
    return {
      error_code: errorResponse.error_code,
      message: errorResponse.message,
    }
  } catch {
    return {}
  }
}
