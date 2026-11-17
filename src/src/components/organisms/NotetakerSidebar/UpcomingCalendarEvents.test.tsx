// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, it } from 'vitest'

import UpcomingCalendarEvents from './UpcomingCalendarEvents'

afterEach(cleanup)
it('reveals later events instead of silently dropping everything after four', () => {
  render(
    <UpcomingCalendarEvents
      dateLabel="Tomorrow"
      items={['A', 'B', 'C', 'D', 'Personal event']}
      renderItem={item => <div key={item}>{item}</div>}
    />,
  )
  expect(screen.queryByText('Personal event')).toBeNull()
  fireEvent.click(screen.getByRole('button', { name: 'Show 1 more events for Tomorrow' }))
  expect(screen.getByText('Personal event')).toBeTruthy()
  fireEvent.click(screen.getByRole('button', { name: 'Show fewer events for Tomorrow' }))
  expect(screen.queryByText('Personal event')).toBeNull()
})
it('shows every search result without a hidden preview limit', () => {
  render(
    <UpcomingCalendarEvents
      dateLabel="Tomorrow"
      showAll
      items={['A', 'B', 'C', 'D', 'Personal event']}
      renderItem={item => <div key={item}>{item}</div>}
    />,
  )
  expect(screen.getByText('Personal event')).toBeTruthy()
  expect(screen.queryByRole('button')).toBeNull()
})
