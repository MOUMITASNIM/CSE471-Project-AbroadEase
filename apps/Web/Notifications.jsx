import { useEffect, useState } from 'react'
import { api } from '../api/axios'

export default function Notifications() {
  const [rows, setRows] = useState([])
  const load = async () => { const { data } = await api.get('/notifications'); setRows(data) }
  useEffect(()=>{ load() }, [])

  const markRead = async (id) => { await api.put(`/notifications/${id}/read`); load() }

  return (
    <div className="space-y-3">
      <h2 className="text-xl font-semibold text-blue-800">Notifications</h2>
      {rows.map(n=>(
        <div key={n._id} className={`card flex justify-between ${n.read ? 'opacity-70' : ''}`}>
          <div>
            <div className="text-blue-900">{n.message}</div>
            <div className="text-xs text-blue-600">{new Date(n.createdAt).toLocaleString()}</div>
          </div>
          {!n.read && <button className="btn" onClick={()=>markRead(n._id)}>Mark read</button>}
        </div>
      ))}
      {!rows.length && <div className="card">No notifications.</div>}
    </div>
  )
}
