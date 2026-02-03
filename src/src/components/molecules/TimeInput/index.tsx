import { useState } from 'react'

import styles from './styles.module.scss'

interface TimeInputProps {
  onTimeChange: (hour: string, minute: string, meridiem: string) => void
}

const TimeInput = ({ onTimeChange }: TimeInputProps) => {
  const [hour, setHour] = useState<string>('')
  const [minute, setMinute] = useState<string>('')
  const [meridiem, setMeridiem] = useState<string>('')

  const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target

    if (name === 'hour') {
      await setHour(value)
      onTimeChange(value, minute, meridiem)
    } else if (name === 'minute') {
      await setMinute(value)
      onTimeChange(hour, value, meridiem)
    } else if (name === 'meridiem') {
      await setMeridiem(value)
      onTimeChange(hour, minute, value)
    }
  }
  return (
    <div className={styles.timeInput}>
      <input
        className={styles.time}
        placeholder="08"
        name="hour"
        value={hour}
        onChange={handleChange}
      />
      <span className={styles.separator}>:</span>
      <input
        className={styles.time}
        placeholder="00"
        name="minute"
        value={minute}
        onChange={handleChange}
      />
      <input
        className={styles.time}
        placeholder="AM"
        name="meridiem"
        value={meridiem}
        onChange={handleChange}
      />
    </div>
  )
}

export default TimeInput
