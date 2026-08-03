"use client"

import { useState, useEffect } from "react"
import { Package, AlertCircle, MapPin, Send } from "lucide-react"

interface InventoryItem {
  _id: string;
  name: string;
  batchNumber?: string;
  quantity: number;
  location: string;
  expiryDate: string;
  daysUntilExpiry: number;
  status: string;
}

export default function AdminInventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null)
  
  // Distribution Form
  const [formData, setFormData] = useState({
    recipientType: "ngo",
    recipientName: "",
    quantity: 1,
    notes: ""
  })

  const fetchInventory = async () => {
    try {
      const res = await fetch("/api/inventory")
      const data = await res.json()
      if (data.items) {
        setItems(data.items)
      }
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    fetchInventory()
  }, [])

  const handleDistribute = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedItem) return

    try {
      await fetch("/api/distribution", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inventoryId: selectedItem._id,
          ...formData
        }),
      })
      
      setIsModalOpen(false)
      setSelectedItem(null)
      fetchInventory()
    } catch (e) {
      console.error(e)
    }
  }

  const getExpiryColor = (days: number) => {
    if (days < 30) return "bg-red-100 text-red-700 border-red-200"
    if (days < 90) return "bg-orange-100 text-orange-700 border-orange-200"
    return "bg-green-100 text-green-700 border-green-200"
  }

  const alerts = items.filter(i => i.daysUntilExpiry < 30)

  return (
    <div className="min-h-screen bg-[var(--bg-main)] noise-bg py-10 px-6">
      <div className="max-w-7xl mx-auto">
        
        <header className="mb-10">
          <h1 className="text-4xl font-serif text-[var(--text-primary)]">Inventory Management</h1>
          <p className="text-[var(--text-secondary)] font-sans mt-2">Manage verified stock and dispatch distributions.</p>
        </header>

        {alerts.length > 0 && (
          <div className="mb-8 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg flex items-start gap-3 shadow-sm">
            <AlertCircle className="text-red-500 w-5 h-5 mt-0.5" />
            <div>
              <h3 className="text-red-800 font-semibold text-sm">Critical Alert</h3>
              <p className="text-red-700 text-sm mt-1">You have {alerts.length} item(s) expiring in less than 30 days. Prioritize distribution immediately.</p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-[#ddd8cf] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F5F2EC]/50 font-sans text-[0.75rem] text-[var(--text-secondary)] uppercase tracking-widest">
                  <th className="p-4 border-b border-[#ddd8cf]">Medicine</th>
                  <th className="p-4 border-b border-[#ddd8cf]">Quantity</th>
                  <th className="p-4 border-b border-[#ddd8cf]">Location</th>
                  <th className="p-4 border-b border-[#ddd8cf]">Expiry</th>
                  <th className="p-4 border-b border-[#ddd8cf]">Status</th>
                  <th className="p-4 border-b border-[#ddd8cf]">Actions</th>
                </tr>
              </thead>
              <tbody className="font-sans text-sm">
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-[var(--text-muted)]">No inventory available.</td>
                  </tr>
                ) : items.map(item => (
                  <tr key={item._id} className="border-b border-[#ddd8cf] hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 font-medium text-[var(--text-primary)]">
                      {item.name}
                      <span className="block text-xs text-[var(--text-muted)] font-normal">{item.batchNumber}</span>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1 bg-[#F5F2EC] px-2 py-1 rounded text-[var(--text-primary)] font-semibold">
                        <Package className="w-3 h-3 text-[var(--accent-dark)]" /> {item.quantity}
                      </span>
                    </td>
                    <td className="p-4 text-[var(--text-secondary)] flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {item.location}
                    </td>
                    <td className="p-4">
                      <span className={`text-xs font-bold px-2 py-1 rounded-full border ${getExpiryColor(item.daysUntilExpiry)}`}>
                        {new Date(item.expiryDate).toLocaleDateString()} ({item.daysUntilExpiry} days)
                      </span>
                    </td>
                    <td className="p-4 text-[var(--text-secondary)] capitalize">{item.status}</td>
                    <td className="p-4">
                      <button 
                        onClick={() => {
                          setSelectedItem(item)
                          setFormData(prev => ({ ...prev, quantity: 1 }))
                          setIsModalOpen(true)
                        }}
                        disabled={item.status !== "available"}
                        className="bg-[var(--accent-dark)] hover:bg-[#2d361f] disabled:bg-[#ddd8cf] disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors flex items-center gap-2"
                      >
                        <Send className="w-3 h-3" /> Distribute
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Distribute Modal */}
        {isModalOpen && selectedItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-[#ddd8cf]">
              <div className="p-6 border-b border-[#ddd8cf] flex justify-between items-center bg-[#F5F2EC]">
                <h2 className="text-xl font-serif text-[var(--text-primary)]">Distribute: {selectedItem.name}</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-[var(--text-muted)] hover:text-red-500 transition-colors">✕</button>
              </div>
              <form onSubmit={handleDistribute} className="p-6 space-y-4">
                <div className="bg-gray-50 p-3 rounded-lg border border-[#ddd8cf] text-sm text-[var(--text-secondary)] flex justify-between">
                  <span>Available Stock:</span>
                  <span className="font-bold text-[var(--text-primary)]">{selectedItem.quantity} units</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1 uppercase tracking-wider">Recipient Type</label>
                  <select 
                    value={formData.recipientType}
                    onChange={e => setFormData({...formData, recipientType: e.target.value})}
                    className="w-full bg-[#F5F2EC] border border-[#ddd8cf] rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--accent-dark)]"
                  >
                    <option value="hospital">Hospital</option>
                    <option value="ngo">NGO</option>
                    <option value="community_center">Community Center</option>
                    <option value="beneficiary">Direct Beneficiary</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1 uppercase tracking-wider">Recipient Name</label>
                  <input 
                    type="text" 
                    required
                    value={formData.recipientName}
                    onChange={e => setFormData({...formData, recipientName: e.target.value})}
                    placeholder="e.g., General Hospital"
                    className="w-full bg-[#F5F2EC] border border-[#ddd8cf] rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--accent-dark)]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1 uppercase tracking-wider">Quantity</label>
                  <input 
                    type="number" 
                    min="1"
                    max={selectedItem.quantity}
                    required
                    value={formData.quantity}
                    onChange={e => setFormData({...formData, quantity: parseInt(e.target.value)})}
                    className="w-full bg-[#F5F2EC] border border-[#ddd8cf] rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--accent-dark)]"
                  />
                </div>

                <button 
                  type="submit" 
                  className="w-full bg-[var(--accent-dark)] hover:bg-[#2d361f] text-white py-3 mt-4 rounded-lg font-medium transition-colors"
                >
                  Confirm Distribution
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
