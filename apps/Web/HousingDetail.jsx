import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { api } from '../api/axios'

export default function HousingDetail() {
  const { id } = useParams()
  const [prop, setProp] = useState(null)
  const [edit, setEdit] = useState(false)
  const [form, setForm] = useState({})

  useEffect(()=> {
    api.get(`/properties/${id}`).then(({data})=>{
      setProp(data)
      // Initialize the form state with all fields from the property data
      setForm({
        title: data.title || '', 
        location: data.location || '', 
        price: data.price || '',
        type: data.type || 'Apartment', 
        description: data.description || '', 
        amenities: (data.amenities || []).join(', '),
        terms: data.terms || '', 
        isRented: data.isRented || false,
        address: data.address || '',
        bedrooms: data.bedrooms || '',
        bathrooms: data.bathrooms || '',
        area: data.area || '',
        furnished: data.furnished || false,
        petFriendly: data.petFriendly || false,
        parking: data.parking || false,
        utilities: data.utilities || { electricity: false, water: false, internet: false, heating: false },
        contactInfo: data.contactInfo || { name: '', phone: '', email: '' },
        availableFrom: data.availableFrom ? new Date(data.availableFrom).toISOString().split('T')[0] : '',
        leaseDuration: data.leaseDuration || '',
        securityDeposit: data.securityDeposit || '',
        nearbyUniversities: (data.nearbyUniversities || []).join(', '),
        transportLinks: (data.transportLinks || []).join(', '),
        rules: (data.rules || []).join(', ')
      })
    }).catch(err => console.error("Error fetching property details:", err))
  }, [id])

  const save = async () => {
    // Construct the payload with correct data types
    const payload = { 
      ...form, 
      price: Number(form.price) || 0, 
      amenities: form.amenities ? form.amenities.split(',').map(s=>s.trim()) : [],
      bedrooms: form.bedrooms ? Number(form.bedrooms) : undefined,
      bathrooms: form.bathrooms ? Number(form.bathrooms) : undefined,
      area: form.area ? Number(form.area) : undefined,
      securityDeposit: form.securityDeposit ? Number(form.securityDeposit) : undefined,
      availableFrom: form.availableFrom ? new Date(form.availableFrom) : undefined,
      nearbyUniversities: form.nearbyUniversities ? form.nearbyUniversities.split(',').map(s=>s.trim()) : [],
      transportLinks: form.transportLinks ? form.transportLinks.split(',').map(s=>s.trim()) : [],
      rules: form.rules ? form.rules.split(',').map(s=>s.trim()) : [],
      utilities: form.utilities || { electricity: false, water: false, internet: false, heating: false },
      contactInfo: form.contactInfo || { name: '', phone: '', email: '' }
    }

    try {
      await api.put(`/properties/${id}`, payload)
      const { data } = await api.get(`/properties/${id}`)
      setProp(data) 
      setEdit(false)
      alert("Property updated successfully!")
    } catch (error) {
      console.error("Error saving property:", error.response ? error.response.data : error.message)
      alert("Failed to update property. Please check the console for more details.")
    }
  }

  if (!prop) return <div>Loading...</div>

  return (
    <div className="card max-w-4xl mx-auto">
      {!edit ? (
        <>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div>
              <h2 className="text-3xl font-bold text-blue-800 mb-2">{prop.title}</h2>
              <div className="text-lg text-blue-600 mb-2">{prop.location}</div>
              {prop.address && <div className="text-sm text-gray-600 mb-2">📍 {prop.address}</div>}
              <div className="flex items-center gap-4 mb-4">
                <span className="text-2xl font-bold text-green-600">${prop.price}/month</span>
                <span className="badge">{prop.type}</span>
                {prop.isRented && <span className="badge bg-red-100 text-red-800">Rented</span>}
              </div>
            </div>

            {/* Property Details */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-lg mb-3">Property Details</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {prop.bedrooms && <div>🛏️ {prop.bedrooms} Bedrooms</div>}
                {prop.bathrooms && <div>🚿 {prop.bathrooms} Bathrooms</div>}
                {prop.area && <div>📐 {prop.area} sq ft</div>}
                <div>🪑 {prop.furnished ? 'Furnished' : 'Unfurnished'}</div>
                <div>🐕 {prop.petFriendly ? 'Pet Friendly' : 'No Pets'}</div>
                <div>🚗 {prop.parking ? 'Parking Available' : 'No Parking'}</div>
              </div>
            </div>
          </div>

          {/* Description */}
          {prop.description && (
            <div className="mt-6">
              <h3 className="font-semibold text-lg mb-2">Description</h3>
              <p className="whitespace-pre-line text-gray-700">{prop.description}</p>
            </div>
          )}

          {/* Amenities */}
          {!!prop.amenities?.length && (
            <div className="mt-6">
              <h3 className="font-semibold text-lg mb-2">Amenities</h3>
              <div className="flex flex-wrap gap-2">
                {prop.amenities.map((amenity, idx) => (
                  <span key={idx} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                    {amenity}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Utilities */}
          {prop.utilities && Object.values(prop.utilities).some(Boolean) && (
            <div className="mt-6">
              <h3 className="font-semibold text-lg mb-2">Utilities Included</h3>
              <div className="flex flex-wrap gap-2">
                {prop.utilities.electricity && <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm">⚡ Electricity</span>}
                {prop.utilities.water && <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">💧 Water</span>}
                {prop.utilities.internet && <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">🌐 Internet</span>}
                {prop.utilities.heating && <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm">🔥 Heating</span>}
              </div>
            </div>
          )}

          {/* Lease Information */}
          <div className="mt-6 grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-lg mb-2">Lease Information</h3>
              <div className="space-y-2 text-sm">
                {prop.availableFrom && <div>📅 Available from: {new Date(prop.availableFrom).toLocaleDateString()}</div>}
                {prop.leaseDuration && <div>⏰ Lease Duration: {prop.leaseDuration}</div>}
                {prop.securityDeposit && <div>💰 Security Deposit: ${prop.securityDeposit}</div>}
              </div>
            </div>

            {/* Contact Information */}
            {prop.contactInfo && (prop.contactInfo.name || prop.contactInfo.phone || prop.contactInfo.email) && (
              <div>
                <h3 className="font-semibold text-lg mb-2">Contact Information</h3>
                <div className="space-y-2 text-sm">
                  {prop.contactInfo.name && <div>👤 {prop.contactInfo.name}</div>}
                  {prop.contactInfo.phone && <div>📞 {prop.contactInfo.phone}</div>}
                  {prop.contactInfo.email && <div>📧 {prop.contactInfo.email}</div>}
                </div>
              </div>
            )}
          </div>

          {/* Nearby Universities */}
          {!!prop.nearbyUniversities?.length && (
            <div className="mt-6">
              <h3 className="font-semibold text-lg mb-2">Nearby Universities</h3>
              <div className="flex flex-wrap gap-2">
                {prop.nearbyUniversities.map((uni, idx) => (
                  <span key={idx} className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
                    🎓 {uni}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Transport Links */}
          {!!prop.transportLinks?.length && (
            <div className="mt-6">
              <h3 className="font-semibold text-lg mb-2">Transport Links</h3>
              <div className="flex flex-wrap gap-2">
                {prop.transportLinks.map((transport, idx) => (
                  <span key={idx} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                    🚌 {transport}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Rules */}
          {!!prop.rules?.length && (
            <div className="mt-6">
              <h3 className="font-semibold text-lg mb-2">House Rules</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                {prop.rules.map((rule, idx) => (
                  <li key={idx}>{rule}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Terms */}
          {prop.terms && (
            <div className="mt-6">
              <h3 className="font-semibold text-lg mb-2">Terms & Conditions</h3>
              <p className="text-sm text-gray-700 whitespace-pre-line">{prop.terms}</p>
            </div>
          )}

          <button className="btn mt-6" onClick={()=>setEdit(true)}>Edit Property</button>
        </>
      ) : (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold mb-4">Edit Property</h2>
          
          {/* Basic Information */}
          <div className="grid md:grid-cols-2 gap-4">
            <input className="input" placeholder="Title" value={form.title} onChange={e=>setForm(p=>({...p,title:e.target.value}))}/>
            <input className="input" placeholder="Location" value={form.location} onChange={e=>setForm(p=>({...p,location:e.target.value}))}/>
            <input className="input" placeholder="Address" value={form.address} onChange={e=>setForm(p=>({...p,address:e.target.value}))}/>
            <input className="input" placeholder="Price" type="number" value={form.price} onChange={e=>setForm(p=>({...p,price:e.target.value}))}/>
          </div>

          <select className="input" value={form.type} onChange={e=>setForm(p=>({...p,type:e.target.value}))}>
            <option>Apartment</option><option>Room</option><option>Studio</option>
          </select>

          {/* Property Details */}
          <div className="grid md:grid-cols-3 gap-4">
            <input className="input" placeholder="Bedrooms" type="number" value={form.bedrooms} onChange={e=>setForm(p=>({...p,bedrooms:e.target.value}))}/>
            <input className="input" placeholder="Bathrooms" type="number" value={form.bathrooms} onChange={e=>setForm(p=>({...p,bathrooms:e.target.value}))}/>
            <input className="input" placeholder="Area (sq ft)" type="number" value={form.area} onChange={e=>setForm(p=>({...p,area:e.target.value}))}/>
          </div>

          {/* Checkboxes */}
          <div className="grid md:grid-cols-3 gap-4">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={!!form.furnished} onChange={e=>setForm(p=>({...p,furnished:e.target.checked}))}/>
              <span>Furnished</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={!!form.petFriendly} onChange={e=>setForm(p=>({...p,petFriendly:e.target.checked}))}/>
              <span>Pet Friendly</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={!!form.parking} onChange={e=>setForm(p=>({...p,parking:e.target.checked}))}/>
              <span>Parking Available</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={!!form.isRented} onChange={e=>setForm(p=>({...p,isRented:e.target.checked}))}/>
              <span>Mark as Rented</span>
            </label>
          </div>

          {/* Utilities */}
          <div>
            <h4 className="font-semibold mb-2">Utilities Included</h4>
            <div className="grid md:grid-cols-4 gap-4">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={!!form.utilities.electricity} onChange={e=>setForm(p=>({...p,utilities:{...p.utilities,electricity:e.target.checked}}))}/>
                <span>Electricity</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={!!form.utilities.water} onChange={e=>setForm(p=>({...p,utilities:{...p.utilities,water:e.target.checked}}))}/>
                <span>Water</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={!!form.utilities.internet} onChange={e=>setForm(p=>({...p,utilities:{...p.utilities,internet:e.target.checked}}))}/>
                <span>Internet</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={!!form.utilities.heating} onChange={e=>setForm(p=>({...p,utilities:{...p.utilities,heating:e.target.checked}}))}/>
                <span>Heating</span>
              </label>
            </div>
          </div>

          {/* Contact Information */}
          <div>
            <h4 className="font-semibold mb-2">Contact Information</h4>
            <div className="grid md:grid-cols-3 gap-4">
              <input className="input" placeholder="Contact Name" value={form.contactInfo.name} onChange={e=>setForm(p=>({...p,contactInfo:{...p.contactInfo,name:e.target.value}}))}/>
              <input className="input" placeholder="Phone" value={form.contactInfo.phone} onChange={e=>setForm(p=>({...p,contactInfo:{...p.contactInfo,phone:e.target.value}}))}/>
              <input className="input" placeholder="Email" value={form.contactInfo.email} onChange={e=>setForm(p=>({...p,contactInfo:{...p.contactInfo,email:e.target.value}}))}/>
            </div>
          </div>

          {/* Lease Information */}
          <div className="grid md:grid-cols-3 gap-4">
            <input className="input" placeholder="Available From" type="date" value={form.availableFrom} onChange={e=>setForm(p=>({...p,availableFrom:e.target.value}))}/>
            <input className="input" placeholder="Lease Duration" value={form.leaseDuration} onChange={e=>setForm(p=>({...p,leaseDuration:e.target.value}))}/>
            <input className="input" placeholder="Security Deposit" type="number" value={form.securityDeposit} onChange={e=>setForm(p=>({...p,securityDeposit:e.target.value}))}/>
          </div>

          <input className="input" value={form.amenities} onChange={e=>setForm(p=>({...p,amenities:e.target.value}))} placeholder="Amenities (comma separated)" />
          <input className="input" value={form.nearbyUniversities} onChange={e=>setForm(p=>({...p,nearbyUniversities:e.target.value}))} placeholder="Nearby Universities (comma separated)" />
          <input className="input" value={form.transportLinks} onChange={e=>setForm(p=>({...p,transportLinks:e.target.value}))} placeholder="Transport Links (comma separated)" />
          <input className="input" value={form.rules} onChange={e=>setForm(p=>({...p,rules:e.target.value}))} placeholder="House Rules (comma separated)" />
          
          <textarea className="input" rows={3} value={form.description} onChange={e=>setForm(p=>({...p,description:e.target.value}))} placeholder="Description"/>
          <textarea className="input" rows={3} value={form.terms} onChange={e=>setForm(p=>({...p,terms:e.target.value}))} placeholder="Terms & Conditions"/>
          
          <div className="flex gap-2">
            <button className="btn" onClick={save}>Save Changes</button>
            <button className="btn bg-gray-500" onClick={()=>setEdit(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  )
}

