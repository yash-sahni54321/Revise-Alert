import { useEffect, useState } from 'react'
import { getRevisionItems } from '../lib/firestore'

function getDaysAgo(date: Date): number {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}

function shouldShowForRevision(item: { id: string; date: Date }, completedMap: Record<string, string>) {
  const studiedDate = item.date
  const daysSinceStudy = getDaysAgo(studiedDate)

  const isScheduledDay = [2, 4, 7].includes(daysSinceStudy)
  if (!isScheduledDay) return false

  const lastDone = completedMap[item.id]
  if (!lastDone) return true // Never revised before

  const lastDoneDate = new Date(lastDone)
  const lastDoneDaysAgo = getDaysAgo(lastDoneDate)

  // Avoid repeating on same scheduled day
  return lastDoneDaysAgo !== daysSinceStudy
}

export default function RevisionList({ user }: { user: { name: string; email: string } }) {
  const STORAGE_KEY = `revision_completed_ids_${user.email}`

  const [items, setItems] = useState<{ id: string; text: string; date: Date; daysAgo: number }[]>([])
  const [completedMap, setCompletedMap] = useState<Record<string, string>>({})

  useEffect(() => {
    async function load() {
      const allItems = await getRevisionItems(user.email)
      const completed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')

      const filtered = allItems
        .filter(item => shouldShowForRevision(item, completed))
        .map(item => ({
          ...item,
          daysAgo: getDaysAgo(item.date),
        }))

      setItems(filtered)
      setCompletedMap(completed)
    }

    load()
  }, [user.email])

  const toggleCompletion = (id: string) => {
    const updated = { ...completedMap }

    if (updated[id]) {
      delete updated[id]
    } else {
      updated[id] = new Date().toISOString()
    }

    setCompletedMap(updated)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">📚 Revise Today</h2>
      {items.length === 0 ? (
        <p className="text-gray-500 text-sm">No scheduled revisions today. You’re all caught up!</p>
      ) : (
        <ul className="space-y-2">
          {items.map(item => {
            const completed = !!completedMap[item.id]
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
                  onChange={() => toggleCompletion(item.id)}
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
