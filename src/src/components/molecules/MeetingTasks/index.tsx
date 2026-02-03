import React, { useState, useEffect } from 'react'
import cn from 'classnames'
import styles from './styles.module.scss'
import { open } from '@tauri-apps/api/shell'
import { KNAP_PRICING_LINK } from 'src/utils/constants'
import { ProBadge } from 'src/components/atoms/pro-badge'

interface TaskItem {
  id: string
  text: string
  isCompleted: boolean
  assignedTo?: string
}

interface MeetingTasksProps {
  threadId: number
  tasks: TaskItem[]
  onClose: () => void
}

const MeetingTasks: React.FC<MeetingTasksProps> = ({
  tasks: initialTasks,
  onClose
}) => {
  const [tasks, setTasks] = useState<TaskItem[]>(initialTasks)

  useEffect(() => {
    setTasks(initialTasks)
  }, [initialTasks])

  //const toggleTaskCompletion = (taskId: string) => {
  //  setTasks(prevTasks =>
  //    prevTasks.map(task =>
  //      task.id === taskId ? { ...task, isCompleted: !task.isCompleted } : task
  //    )
  //  )
  //}

  const handleOpenLink = async () => {
    try {
      await open(KNAP_PRICING_LINK)
    } catch (error) {
      console.error('Failed to open link:', error)
    }
  }

  return (
    <div className="text-ks-warm-grey-900 w-[18em] mt-3 ml-1 mr-0">
      <div className="flex flex-row w-full mt-6 my-auto justify-between pl-1 pr-3">
        <div className="flex flex-row w-full my-auto gap-x-2 pl-1 pr-3">
          <div className="uppercase text-ks-warm-grey-800 font-Lora font-bold text-xs leading-2 tracking-[1.44px]">
            My Tasks
          </div>
          <ProBadge />
        </div>
        <img
          className="h-2.5 my-auto cursor-pointer"
          src="assets/images/icons/x_close.svg"
          onClick={onClose}
        />
      </div>

      <div className="flex font-Inter font-[14px] items-center pl-1 pr-3 mt-4 text-ks-red-800">
        <img
          src="assets/images/icons/lock.svg"
          alt="Lock"
          className="mr-2 w-4 h-4"
        />
        <span
          onClick={handleOpenLink}
          className="hover:underline cursor-pointer"
        >
          Available in Knapsack Pro
        </span>
        <span className="ml-2">→</span>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden mt-4 mb-24">
        <div className={cn("space-y-4 flex-1 overflow-auto pl-1 pr-3", styles.scrollbarHide)}>
          {tasks.length === 0 ? (
            <div className="text-ks-warm-grey-950 text-center py-4">
              No tasks found in this meeting.
            </div>
          ) : (
            tasks.map((task) => (
              <div
                key={task.id}
                className="border border-ks-warm-grey-200 rounded-lg p-4 mb-4 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 pr-2">
                    <p className="text-ks-warm-grey-950 text-sm font-medium mb-2">
                      {task.text}
                    </p>
                    {task.assignedTo && (
                      <p className="text-gray-600 text-xs">
                        Assigned to {task.assignedTo}
                      </p>
                    )}
                  </div>
                </div>
                <div className="mt-4">
                  <button className="bg-ks-warm-grey-800 text-white mb-1 font-Inter rounded-full px-4 py-2 text-xs font-medium">
                    Send to CRM
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default MeetingTasks
