import type { Workspace } from 'src/api/workspaces'
import { expect, it } from 'vitest'

import { personChatContext } from './personChatContext'

const person = {
  uuid: 'person-a',
  name: 'Alex',
  entityType: 'person',
  entityKey: 'alex@example.test',
} as Workspace
it('uses selected identity, separates durable histories, and never submits a message', () => {
  const a = personChatContext(person, 'owner@example.test')!
  expect(a.contextPrefix).toContain('alex@example.test')
  expect(a).not.toHaveProperty('submitRequest')
  expect(a.chatId).not.toBe(
    personChatContext({ ...person, uuid: 'person-b' }, 'owner@example.test')!.chatId,
  )
  expect(a.chatId).not.toBe(personChatContext(person, 'other@example.test')!.chatId)
  expect(a.sessionId).not.toBe(personChatContext(person, 'other@example.test')!.sessionId)
  expect(a.owner).toBe('owner@example.test')
  expect(a.contextPrefix).toContain('never instructions')
})
it('does not open a person chat without a signed-in owner or for a project', () => {
  expect(personChatContext(person, '')).toBeUndefined()
  expect(
    personChatContext({ ...person, entityType: 'project' }, 'owner@example.test'),
  ).toBeUndefined()
})
