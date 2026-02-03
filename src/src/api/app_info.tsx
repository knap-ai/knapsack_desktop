import { KN_API_FEATURE_STATUS } from '../utils/constants'

export async function getReleaseType() {
  const response = await fetch(KN_API_FEATURE_STATUS, {
    method: 'GET',
  })
  const data = await response.json()
  if (!data) {
    console.log(`getAutomations data error`)
    throw new Error(`getAutomations data error`)
  }
  return data.release_type
}
