import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { api } from '../api/axios'
import { 
  getCountries, 
  getUniversities, 
  getPrograms, 
  getDepartments, 
  getTerms, 
  getDegreeTypes,
  getAllUniversities,
  getAllPrograms,
  getAllDepartments,
  getAllTerms,
  getAllDegreeTypes
} from '../constants/guideData'

export default function Guides() {
  const { user } = useAuth()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingPost, setEditingPost] = useState(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    body: '',
    type: 'SOP',
    country: '',
    university: '',
    program: '',
    department: '',
    term: '',
    degreeType: '',
    tags: ''
  })
  const [filters, setFilters] = useState({
    type: '',
    country: '',
    university: '',
    program: '',
    department: '',
    term: '',
    degreeType: '',
    q: ''
  })
  const [msg, setMsg] = useState('')
  const [bookmarks, setBookmarks] = useState([])

  const isAdmin = user?.role === 'admin'

  useEffect(() => {
    // Check for URL parameters and set filters
    const urlParams = new URLSearchParams(window.location.search)
    const initialFilters = {
      type: '',
      country: '',
      university: '',
      program: '',
      department: '',
      term: '',
      degreeType: '',
      q: ''
    }
    
    let hasUrlParams = false
    if (urlParams.get('q')) {
      initialFilters.q = urlParams.get('q')
      hasUrlParams = true
    }
    if (urlParams.get('country')) {
      initialFilters.country = urlParams.get('country')
      hasUrlParams = true
    }
    if (urlParams.get('program')) {
      initialFilters.program = urlParams.get('program')
      hasUrlParams = true
    }
    if (urlParams.get('type')) {
      initialFilters.type = urlParams.get('type')
      hasUrlParams = true
    }
    
    if (hasUrlParams) {
      setFilters(initialFilters)
      // Immediately fetch posts with URL params
      fetchPosts(initialFilters)
    } else {
      // If no URL params, fetch posts immediately
      fetchPosts()
    }
    
    if (user) {
      fetchBookmarks()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    fetchPosts()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters])

  const fetchBookmarks = async () => {
    try {
      const { data } = await api.get('/bookmarks')
      setBookmarks(data)
    } catch (error) {
      console.error('Error fetching bookmarks:', error)
    }
  }

  const toggleBookmark = async (postId) => {
    try {
      const isBookmarked = bookmarks.some(b => b.itemType === 'POST' && b.itemId === postId)
      
      if (isBookmarked) {
        const bookmark = bookmarks.find(b => b.itemType === 'POST' && b.itemId === postId)
        await api.delete(`/bookmarks/${bookmark._id}`)
        setMsg('Bookmark removed')
      } else {
        await api.post('/bookmarks', { itemType: 'POST', itemId: postId })
        setMsg('Guide bookmarked')
      }
      
      fetchBookmarks()
      setTimeout(() => setMsg(''), 2000)
    } catch (error) {
      setMsg('Error updating bookmark: ' + (error.response?.data?.error || error.message))
      setTimeout(() => setMsg(''), 3000)
    }
  }

  const isBookmarked = (postId) => {
    return bookmarks.some(b => b.itemType === 'POST' && b.itemId === postId)
  }

  const fetchPosts = async (currentFilters = filters) => {
    try {
      const queryParams = new URLSearchParams()
      Object.entries(currentFilters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value)
      })
      
      const { data } = await api.get(`/posts?${queryParams.toString()}`)
      setPosts(data)
    } catch (error) {
      console.error('Error fetching posts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const postData = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      }

      // Remove SOP-specific fields if type is VISA
      if (formData.type === 'VISA') {
        delete postData.university
        delete postData.program
        delete postData.department
        delete postData.term
        delete postData.degreeType
      }

      if (editingPost) {
        await api.put(`/posts/${editingPost._id}`, postData)
        setMsg('Post updated successfully')
      } else {
        await api.post('/posts', postData)
        setMsg('Post created successfully')
      }

      resetForm()
      fetchPosts()
      setTimeout(() => setMsg(''), 3000)
    } catch (error) {
      setMsg('Error saving post: ' + (error.response?.data?.error || error.message))
      setTimeout(() => setMsg(''), 3000)
    }
  }

  const handleEdit = (post) => {
    setEditingPost(post)
    setFormData({
      title: post.title,
      body: post.body,
      type: post.type,
      country: post.country,
      university: post.university || '',
      program: post.program || '',
      department: post.department || '',
      term: post.term || '',
      degreeType: post.degreeType || '',
      tags: post.tags.join(', ')
    })
    setShowCreateForm(true)
  }

  const handleDelete = async (postId) => {
    if (!confirm('Are you sure you want to delete this post?')) return
    
    try {
      await api.delete(`/posts/${postId}`)
      setMsg('Post deleted successfully')
      fetchPosts()
      setTimeout(() => setMsg(''), 3000)
    } catch (error) {
      setMsg('Error deleting post: ' + (error.response?.data?.error || error.message))
      setTimeout(() => setMsg(''), 3000)
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      body: '',
      type: 'SOP',
      country: '',
      university: '',
      program: '',
      department: '',
      term: '',
      degreeType: '',
      tags: ''
    })
    setEditingPost(null)
    setShowCreateForm(false)
  }

  // Handlers for cascading dropdowns in form
  const handleCountryChange = (country) => {
    setFormData({
      ...formData,
      country,
      university: '',
      program: '',
      department: '',
      term: '',
      degreeType: ''
    })
  }

  const handleUniversityChange = (university) => {
    setFormData({
      ...formData,
      university,
      program: '',
      department: '',
      term: '',
      degreeType: ''
    })
  }

  // Handlers for cascading dropdowns in filters
  const handleFilterCountryChange = (country) => {
    setFilters({
      ...filters,
      country,
      university: '',
      program: '',
      department: '',
      term: '',
      degreeType: ''
    })
  }

  const handleFilterUniversityChange = (university) => {
    setFilters({
      ...filters,
      university,
      program: '',
      department: '',
      term: '',
      degreeType: ''
    })
  }

  if (loading) {
    return <div className="text-center py-8">Loading guides...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-full px-6 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-blue-800">Study Guides</h1>
            {isAdmin && (
              <button
                onClick={() => setShowCreateForm(true)}
                className="btn bg-green-600 hover:bg-green-700 shadow-lg"
              >
                + Create New Guide
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex max-w-full">
        {/* Left Sidebar - Filters */}
        <div className="w-80 bg-white shadow-lg min-h-screen border-r flex flex-col">
          {/* Fixed Header */}
          <div className="p-6 border-b bg-white">
            <h2 className="text-xl font-bold text-gray-800 mb-4">🔍 Filter Guides</h2>
            
            {/* Clear Filters Button */}
            <button
              onClick={() => setFilters({
                type: '', country: '', university: '', program: '', department: '', term: '', degreeType: '', q: ''
              })}
              className="btn bg-red-500 hover:bg-red-600 w-full mb-2"
            >
              Clear All Filters
            </button>
          </div>

          {/* Scrollable Filters Area */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-4">
              {/* Guide Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Guide Type</label>
                <select
                  className="input w-full"
                  value={filters.type}
                  onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                >
                  <option value="">All Types</option>
                  <option value="SOP">SOP Guides</option>
                  <option value="VISA">VISA Guides</option>
                </select>
              </div>

              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                <input
                  className="input w-full"
                  placeholder="Search by title..."
                  value={filters.q}
                  onChange={(e) => setFilters({ ...filters, q: e.target.value })}
                />
              </div>

              {/* Country */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                <select
                  className="input w-full"
                  value={filters.country}
                  onChange={(e) => handleFilterCountryChange(e.target.value)}
                >
                  <option value="">All Countries</option>
                  {getCountries().map(country => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>
              </div>

              {/* SOP-specific filters */}
              {(!filters.type || filters.type === 'SOP') && (
                <>
                  {/* University */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">University</label>
                    <select
                      className="input w-full"
                      value={filters.university}
                      onChange={(e) => handleFilterUniversityChange(e.target.value)}
                    >
                      <option value="">All Universities</option>
                      {(filters.country ? getUniversities(filters.country) : getAllUniversities()).map(university => (
                        <option key={university} value={university}>{university}</option>
                      ))}
                    </select>
                  </div>

                  {/* Program */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Program</label>
                    <select
                      className="input w-full"
                      value={filters.program}
                      onChange={(e) => setFilters({ ...filters, program: e.target.value })}
                    >
                      <option value="">All Programs</option>
                      {(filters.country && filters.university ? 
                        getPrograms(filters.country, filters.university) : 
                        getAllPrograms()
                      ).map(program => (
                        <option key={program} value={program}>{program}</option>
                      ))}
                    </select>
                  </div>

                  {/* Department */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                    <select
                      className="input w-full"
                      value={filters.department}
                      onChange={(e) => setFilters({ ...filters, department: e.target.value })}
                    >
                      <option value="">All Departments</option>
                      {(filters.country && filters.university ? 
                        getDepartments(filters.country, filters.university) : 
                        getAllDepartments()
                      ).map(department => (
                        <option key={department} value={department}>{department}</option>
                      ))}
                    </select>
                  </div>

                  {/* Term */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Term</label>
                    <select
                      className="input w-full"
                      value={filters.term}
                      onChange={(e) => setFilters({ ...filters, term: e.target.value })}
                    >
                      <option value="">All Terms</option>
                      {(filters.country && filters.university ? 
                        getTerms(filters.country, filters.university) : 
                        getAllTerms()
                      ).map(term => (
                        <option key={term} value={term}>{term}</option>
                      ))}
                    </select>
                  </div>

                  {/* Degree Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Degree Type</label>
                    <select
                      className="input w-full"
                      value={filters.degreeType}
                      onChange={(e) => setFilters({ ...filters, degreeType: e.target.value })}
                    >
                      <option value="">All Degree Types</option>
                      {(filters.country && filters.university ? 
                        getDegreeTypes(filters.country, filters.university) : 
                        getAllDegreeTypes()
                      ).map(degree => (
                        <option key={degree} value={degree}>{degree}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              {/* Additional spacing at bottom for better scrolling */}
              <div className="h-4"></div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 p-6">
          {/* Success/Error Messages */}
          {msg && (
            <div className={`p-4 rounded-lg mb-6 ${msg.includes('Error') ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-green-100 text-green-700 border border-green-200'}`}>
              {msg}
            </div>
          )}

          {/* Create/Edit Form */}
          {isAdmin && showCreateForm && (
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6 border">
              <h2 className="text-2xl font-semibold mb-6 text-gray-800">
                {editingPost ? '✏️ Edit Guide' : '➕ Create New Guide'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Guide Type</label>
                    <select
                      className="input w-full"
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      required
                    >
                      <option value="SOP">SOP Guide</option>
                      <option value="VISA">VISA Guide</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                    <select
                      className="input w-full"
                      value={formData.country}
                      onChange={(e) => handleCountryChange(e.target.value)}
                      required
                    >
                      <option value="">Select Country</option>
                      {getCountries().map(country => (
                        <option key={country} value={country}>{country}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                  <input
                    className="input w-full"
                    placeholder="Enter guide title..."
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>

                {/* SOP-specific fields */}
                {formData.type === 'SOP' && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">University</label>
                      <select
                        className="input w-full"
                        value={formData.university}
                        onChange={(e) => handleUniversityChange(e.target.value)}
                        required
                        disabled={!formData.country}
                      >
                        <option value="">{formData.country ? 'Select University' : 'Select Country First'}</option>
                        {formData.country && getUniversities(formData.country).map(university => (
                          <option key={university} value={university}>{university}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Program</label>
                      <select
                        className="input w-full"
                        value={formData.program}
                        onChange={(e) => setFormData({ ...formData, program: e.target.value })}
                        required
                        disabled={!formData.country || !formData.university}
                      >
                        <option value="">{formData.country && formData.university ? 'Select Program' : 'Select University First'}</option>
                        {formData.country && formData.university && getPrograms(formData.country, formData.university).map(program => (
                          <option key={program} value={program}>{program}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                      <select
                        className="input w-full"
                        value={formData.department}
                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                        required
                        disabled={!formData.country || !formData.university}
                      >
                        <option value="">{formData.country && formData.university ? 'Select Department' : 'Select University First'}</option>
                        {formData.country && formData.university && getDepartments(formData.country, formData.university).map(department => (
                          <option key={department} value={department}>{department}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Term</label>
                      <select
                        className="input w-full"
                        value={formData.term}
                        onChange={(e) => setFormData({ ...formData, term: e.target.value })}
                        required
                        disabled={!formData.country || !formData.university}
                      >
                        <option value="">{formData.country && formData.university ? 'Select Term' : 'Select University First'}</option>
                        {formData.country && formData.university && getTerms(formData.country, formData.university).map(term => (
                          <option key={term} value={term}>{term}</option>
                        ))}
                      </select>
                    </div>
                    <div className="lg:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Degree Type</label>
                      <select
                        className="input w-full"
                        value={formData.degreeType}
                        onChange={(e) => setFormData({ ...formData, degreeType: e.target.value })}
                        required
                        disabled={!formData.country || !formData.university}
                      >
                        <option value="">{formData.country && formData.university ? 'Select Degree Type' : 'Select University First'}</option>
                        {formData.country && formData.university && getDegreeTypes(formData.country, formData.university).map(degree => (
                          <option key={degree} value={degree}>{degree}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                  <input
                    className="input w-full"
                    placeholder="Enter tags separated by commas..."
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Guide Content</label>
                  <textarea
                    className="input w-full"
                    placeholder="Write your comprehensive guide here..."
                    rows="12"
                    value={formData.body}
                    onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                    required
                  />
                </div>
                
                <div className="flex gap-4 pt-4">
                  <button type="submit" className="btn flex-1">
                    {editingPost ? 'Update Guide' : 'Create Guide'}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="btn bg-gray-500 hover:bg-gray-600 flex-1"
                  >
                    Cancel
                  </button>
                </div>
      </form>
            </div>
          )}

          {/* Posts List */}
          <div className="space-y-6">
            {posts.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-lg shadow-sm">
                <div className="text-gray-400 text-6xl mb-4">📚</div>
                <h3 className="text-xl font-medium text-gray-500">No guides available yet</h3>
                <p className="text-gray-400 mt-2">Try adjusting your filters or create a new guide</p>
              </div>
            ) : (
              posts.map((post) => (
                <div key={post._id} className="bg-white rounded-lg shadow-lg p-6 border hover:shadow-xl transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-blue-800">{post.title}</h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          post.type === 'SOP' ? 'bg-green-100 text-green-800' : 'bg-purple-100 text-purple-800'
                        }`}>
                          {post.type}
                        </span>
                      </div>
                      
                      <div className="space-y-2">
                        <div>
                          <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                            📍 {post.country}
                          </span>
                        </div>
                        
                        {post.type === 'SOP' && (
                          <div className="flex flex-wrap gap-2">
                            {post.university && (
                              <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                                🏫 {post.university}
                              </span>
                            )}
                            {post.program && (
                              <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                                📚 {post.program}
                              </span>
                            )}
                            {post.department && (
                              <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                                🏢 {post.department}
                              </span>
                            )}
                            {post.term && (
                              <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                                📅 {post.term}
                              </span>
                            )}
                            {post.degreeType && (
                              <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                                🎓 {post.degreeType}
                              </span>
                            )}
                          </div>
                        )}
                        
                        {post.tags && post.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {post.tags.map((tag, index) => (
                              <span key={index} className="inline-block bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm">
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-2 ml-4">
                      {user && (
                        <button
                          onClick={() => toggleBookmark(post._id)}
                          className={`text-sm font-medium px-3 py-1 rounded ${
                            isBookmarked(post._id)
                              ? 'text-yellow-600 hover:text-yellow-800 bg-yellow-50 hover:bg-yellow-100'
                              : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                          }`}
                        >
                          {isBookmarked(post._id) ? '⭐ Bookmarked' : '☆ Bookmark'}
                        </button>
                      )}
                      
                      {isAdmin && (
                        <>
                          <button
                            onClick={() => handleEdit(post)}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium px-3 py-1 rounded hover:bg-blue-50"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(post._id)}
                            className="text-red-600 hover:text-red-800 text-sm font-medium px-3 py-1 rounded hover:bg-red-50"
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-gray-700 whitespace-pre-wrap leading-relaxed bg-gray-50 p-4 rounded-lg">
                    {post.body}
                  </div>
                  
                  <div className="text-sm text-gray-500 mt-4 pt-4 border-t flex justify-between">
                    <span>Created: {new Date(post.createdAt).toLocaleDateString()}</span>
                    <span>Last updated: {new Date(post.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
