import { useState, useEffect } from 'react';

export default function GardensManager() {
  const [gardens, setGardens] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [gardenForm, setGardenForm] = useState({
    garden_name: '',
    garden_category: 'Educational',
    description: ''
  });

  const categories = [
    'Educational',
    'Mathematics',
    'Science',
    'Physics',
    'Chemistry',
    'Biology',
    'Language',
    'History',
    'Geography',
    'Art',
    'Music',
    'Technology',
    'Programming',
    'Other'
  ];

  useEffect(() => {
    fetchGardens();
  }, []);

  const fetchGardens = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/flearn-proxy/gardens');
      const data = await response.json();
      
      if (response.ok) {
        setGardens(data.gardens || []);
      } else {
        setMessage(`Error: ${data.message || 'Failed to fetch gardens'}`);
      }
    } catch (error) {
      console.error('Error fetching gardens:', error);
      setMessage('Error connecting to server');
    } finally {
      setLoading(false);
    }
  };

  const createGarden = async (e) => {
    e.preventDefault();
    if (!gardenForm.garden_name.trim()) return;

    try {
      setLoading(true);
      setMessage('');

      const response = await fetch('/api/flearn-proxy/gardens', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(gardenForm),
      });

      const data = await response.json();
      
      if (response.ok) {
        setMessage('Garden created successfully! 🌱✅');
        setGardenForm({
          garden_name: '',
          garden_category: 'Educational',
          description: ''
        });
        setShowCreateForm(false);
        fetchGardens(); // Refresh the list
      } else {
        setMessage(`Error: ${data.message || 'Failed to create garden'}`);
      }
    } catch (error) {
      console.error('Error creating garden:', error);
      setMessage('Error connecting to server');
    } finally {
      setLoading(false);
    }
  };

  const deleteGarden = async (gardenId) => {
    if (!confirm('Are you sure you want to delete this garden? This action cannot be undone.')) return;

    try {
      setLoading(true);
      setMessage('');

      const response = await fetch(`/api/flearn-proxy/gardens/${gardenId}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      
      if (response.ok) {
        setMessage('Garden deleted successfully! ✅');
        fetchGardens(); // Refresh the list
      } else {
        setMessage(`Error: ${data.message || 'Failed to delete garden'}`);
      }
    } catch (error) {
      console.error('Error deleting garden:', error);
      setMessage('Error connecting to server');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setGardenForm({
      ...gardenForm,
      [e.target.name]: e.target.value
    });
  };

  const getCategoryEmoji = (category) => {
    const emojiMap = {
      'Educational': '📚',
      'Mathematics': '🔢',
      'Science': '🔬',
      'Physics': '⚗️',
      'Chemistry': '🧪',
      'Biology': '🧬',
      'Language': '🗣️',
      'History': '📜',
      'Geography': '🌍',
      'Art': '🎨',
      'Music': '🎵',
      'Technology': '💻',
      'Programming': '👨‍💻',
      'Other': '🌟'
    };
    return emojiMap[category] || '🌱';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="gardens-manager">
      <div className="manager-header">
        <h2>🌱 Gardens Manager</h2>
        <div className="header-actions">
          <button 
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="create-garden-btn"
            disabled={loading}
          >
            {showCreateForm ? '❌ Cancel' : '🌱 Create Garden'}
          </button>
          <button 
            onClick={fetchGardens}
            className="refresh-btn"
            disabled={loading}
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {message && (
        <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>
          {message}
        </div>
      )}

      {showCreateForm && (
        <div className="create-garden-form">
          <h3>🌿 Create New Garden</h3>
          <form onSubmit={createGarden}>
            <div className="form-group">
              <label htmlFor="garden_name">Garden Name:</label>
              <input
                type="text"
                id="garden_name"
                name="garden_name"
                value={gardenForm.garden_name}
                onChange={handleInputChange}
                placeholder="Enter a name for your garden"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="garden_category">Category:</label>
              <select
                id="garden_category"
                name="garden_category"
                value={gardenForm.garden_category}
                onChange={handleInputChange}
                required
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {getCategoryEmoji(category)} {category}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="description">Description:</label>
              <textarea
                id="description"
                name="description"
                value={gardenForm.description}
                onChange={handleInputChange}
                placeholder="Describe what this garden is about..."
                rows="4"
              />
            </div>

            <div className="form-actions">
              <button type="submit" disabled={loading}>
                {loading ? '⏳ Creating...' : '🌱 Create Garden'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="gardens-content">
        {loading && gardens.length === 0 ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading gardens...</p>
          </div>
        ) : gardens.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🌸</div>
            <h3>No Gardens Yet</h3>
            <p>Create your first learning garden to start growing knowledge!</p>
            <button 
              onClick={() => setShowCreateForm(true)}
              className="cta-btn"
            >
              🌱 Create Your First Garden
            </button>
          </div>
        ) : (
          <div className="gardens-grid">
            {gardens.map((garden) => (
              <div key={garden.id} className="garden-card">
                <div className="garden-header">
                  <div className="garden-icon">
                    {getCategoryEmoji(garden.garden_category)}
                  </div>
                  <div className="garden-title">
                    <h3>{garden.garden_name}</h3>
                    <span className="garden-category">{garden.garden_category}</span>
                  </div>
                </div>

                <div className="garden-description">
                  <p>{garden.description || 'No description provided'}</p>
                </div>

                <div className="garden-stats">
                  <div className="stat">
                    <span className="stat-label">🎯 Progress:</span>
                    <span className="stat-value">{garden.progress || 0}%</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">⭐ Level:</span>
                    <span className="stat-value">{garden.level || 1}</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">🏆 Score:</span>
                    <span className="stat-value">{garden.score || 0}</span>
                  </div>
                </div>

                <div className="garden-meta">
                  <p className="created-date">
                    🌱 Created: {formatDate(garden.created_at)}
                  </p>
                  {garden.updated_at && garden.updated_at !== garden.created_at && (
                    <p className="updated-date">
                      📝 Updated: {formatDate(garden.updated_at)}
                    </p>
                  )}
                </div>

                <div className="garden-actions">
                  <button className="view-btn">
                    👁️ View Garden
                  </button>
                  <button className="edit-btn">
                    ✏️ Edit
                  </button>
                  <button 
                    onClick={() => deleteGarden(garden.id)}
                    className="delete-btn"
                    disabled={loading}
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="gardens-stats">
        <div className="stat-card">
          <div className="stat-number">{gardens.length}</div>
          <div className="stat-label">Total Gardens</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">
            {gardens.filter(g => (g.progress || 0) > 0).length}
          </div>
          <div className="stat-label">Active Gardens</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">
            {gardens.reduce((sum, g) => sum + (g.score || 0), 0)}
          </div>
          <div className="stat-label">Total Score</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">
            {Math.round(gardens.reduce((sum, g) => sum + (g.progress || 0), 0) / (gardens.length || 1))}%
          </div>
          <div className="stat-label">Avg Progress</div>
        </div>
      </div>

      <div className="gardens-help">
        <h3>💡 Garden Tips</h3>
        <ul>
          <li>Gardens help organize your learning journey by subject or topic</li>
          <li>Each garden tracks your progress, level, and achievements</li>
          <li>You can create gardens for different subjects you're studying</li>
          <li>Invite friends to collaborate on shared learning goals</li>
          <li>Regular activity in your gardens helps maintain learning streaks</li>
        </ul>
      </div>
    </div>
  );
}
