// Revised RevisionList.tsx
import { useEffect, useState } from 'react'
import { getRevisionItems } from '../lib/firestore'

function getDaysAgo(date: Date): number {
  const now = new Date()
  now.setHours(0, 0, 0, 0) // Normalize to start of day
  const studiedDate = new Date(date)
  studiedDate.setHours(0, 0, 0, 0)
  const diff = now.getTime() - studiedDate.getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}

function shouldShowForRevision(
  item: { id: string; date: Date },
  completedMap: Record<string, Record<string, string>>
) {
  const daysSinceStudy = getDaysAgo(item.date)
  const isScheduledDay = [2, 4, 7].includes(daysSinceStudy)
  if (!isScheduledDay) return false

  const lastDone = completedMap[item.id]?.[daysSinceStudy.toString()]
  const todayStr = new Date().toISOString().slice(0, 10) // YYYY-MM-DD

  // If not done today, show it
  return !lastDone || !lastDone.startsWith(todayStr)
}

export default function RevisionList({ user }: { user: { name: string; email: string } }) {
  const STORAGE_KEY = `revision_completed_ids_${user.email}`

  const [items, setItems] = useState<
    { id: string; text: string; date: Date; daysAgo: number }[]
  >([])
  const [completedMap, setCompletedMap] = useState<
    Record<string, Record<string, string>>
  >({})

  useEffect(() => {
    async function load() {
      const allItems = await getRevisionItems(user.email)
      const completed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')

      const filtered = allItems
        .map(item => ({
          ...item,
          daysAgo: getDaysAgo(item.date),
        }))
        .filter(item => shouldShowForRevision(item, completed))

      setItems(filtered)
      setCompletedMap(completed)
    }

    load()
  }, [user.email])

  const toggleCompletion = (id: string, daysAgo: number) => {
    const updated = { ...completedMap }
    if (!updated[id]) updated[id] = {}

    const dayKey = daysAgo.toString()
    const today = new Date().toISOString()

    if (updated[id][dayKey]?.startsWith(today.slice(0, 10))) {
      delete updated[id][dayKey]
    } else {
      updated[id][dayKey] = today
    }

    setCompletedMap(updated)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">📚 Revise Today</h2>
      {items.length === 0 ? (
        <p className="text-gray-500 text-sm">
          No scheduled revisions today. You’re all caught up!
        </p>
      ) : (
        <ul className="space-y-2">
          {items.map(item => {
            const dayKey = item.daysAgo.toString()
            const completed = !!completedMap[item.id]?.[dayKey]?.startsWith(
              new Date().toISOString().slice(0, 10)
            )
            return (
              <li
                key={item.id}
                className={`flex items-center gap-2 p-2 border rounded shadow bg-white ${
                  completed ? 'opacity-50 line-through' : ''
                }`}
              >
                <input
                  type="checkbox"
                  checked={completed}
                  onChange={() => toggleCompletion(item.id, item.daysAgo)}
                  className="accent-blue-600"
                />
                <div className="flex-1">
                  <div className="font-medium">{item.text}</div>
                  <div className="text-xs text-gray-400">
                    Studied {item.daysAgo} day{item.daysAgo !== 1 ? 's' : ''} ago
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
