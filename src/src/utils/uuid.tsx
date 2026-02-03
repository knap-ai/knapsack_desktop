import { v5 as uuidv5 } from 'uuid'

const AUTOMATION_UUID_NAMESPACE = 'e4eaaaf2-d142-11e1-b3e4-080027620cdd'

export function genAutomationUUID(name: string): string {
  const uuid = uuidv5(name, AUTOMATION_UUID_NAMESPACE)
  return uuid
}
