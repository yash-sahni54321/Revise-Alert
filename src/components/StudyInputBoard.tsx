import { useState, useEffect } from 'react'
import {
  saveStudyItemToFirestore,
  getTodayStudyItems,
  updateStudyItemInFirestore,
  deleteStudyItemFromFirestore
} from '../lib/firestore'

export default function StudyInputBoard({ user }: { user: { name: string; email: string } }) {
  const [text, setText] = useState('')
  const [todayItems, setTodayItems] = useState<{ id: string; text: string }[]>([])
  const [editId, setEditId] = useState<string | null>(null)
  const [editText, setEditText] = useState('')

  const refreshToday = async () => {
    const items = await getTodayStudyItems(user.email)
    console.log('Today items:', items)
    setTodayItems(items)
  }

  useEffect(() => {
    refreshToday()
  }, [user.email])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (text.trim()) {
      await saveStudyItemToFirestore(text.trim(), user.email)
      setText('')
      await refreshToday()
    }
  }

  const handleEdit = (id: string, currentText: string) => {
    setEditId(id)
    setEditText(currentText)
  }

  const handleEditSave = async (id: string) => {
    if (editText.trim()) {
      await updateStudyItemInFirestore(id, editText.trim())
      setEditId(null)
      setEditText('')
      await refreshToday()
    }
  }

  const handleDelete = async (id: string) => {
    await deleteStudyItemFromFirestore(id)
    await refreshToday()
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">What did you study today?</h2>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          className="flex-1 border rounded px-2 py-1"
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Enter topic or notes..."
        />
        <button className="bg-blue-600 text-white px-4 py-1 rounded" type="submit">
          Add
        </button>
      </form>

      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-2 text-blue-700">Today's Entries</h3>
        {todayItems.length === 0 ? (
          <p className="text-gray-400 text-sm">No entries yet for today.</p>
        ) : (
          <ul className="space-y-1">
            {todayItems.map(item => (
              <li key={item.id} className="text-gray-700 bg-blue-50 rounded px-2 py-1 flex items-center gap-2">
                {editId === item.id ? (
                  <>
                    <input
                      className="flex-1 border rounded px-1 py-0.5 text-sm"
                      value={editText}
                      onChange={e => setEditText(e.target.value)}
                      autoFocus
                    />
                    <button
                      className="text-green-600 text-xs px-2 py-0.5 rounded border border-green-200 hover:bg-green-50"
                      onClick={() => handleEditSave(item.id)}
                      type="button"
                    >
                      Save
                    </button>
                    <button
                      className="text-gray-400 text-xs px-2 py-0.5 rounded border border-gray-200 hover:bg-gray-50"
                      onClick={() => setEditId(null)}
                      type="button"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <span className="flex-1">{item.text}</span>
                    <button
                      className="text-blue-600 text-xs"
                      onClick={() => handleEdit(item.id, item.text)}
                      type="button"
                    >
                      Edit
                    </button>
                    <button
                      className="text-red-500 text-xs"
                      onClick={() => handleDelete(item.id)}
                      type="button"
                    >
                      Delete
                    </button>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
