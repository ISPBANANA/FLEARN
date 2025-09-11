import { useState, useEffect } from 'react';

export default function FriendsManager() {
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [newFriendEmail, setNewFriendEmail] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    fetchFriends();
  }, []);

  const fetchFriends = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/flearn-proxy/friends');
      const data = await response.json();
      
      if (response.ok) {
        setFriends(data.friends || []);
      } else {
        setMessage(`Error: ${data.message || 'Failed to fetch friends'}`);
      }
    } catch (error) {
      console.error('Error fetching friends:', error);
      setMessage('Error connecting to server');
    } finally {
      setLoading(false);
    }
  };

  const addFriend = async (e) => {
    e.preventDefault();
    if (!newFriendEmail.trim()) return;

    try {
      setLoading(true);
      setMessage('');

      const response = await fetch('/api/flearn-proxy/friends', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ friend_email: newFriendEmail.trim() }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setMessage('Friend added successfully! ✅');
        setNewFriendEmail('');
        setShowAddForm(false);
        fetchFriends(); // Refresh the list
      } else {
        setMessage(`Error: ${data.message || 'Failed to add friend'}`);
      }
    } catch (error) {
      console.error('Error adding friend:', error);
      setMessage('Error connecting to server');
    } finally {
      setLoading(false);
    }
  };

  const removeFriend = async (friendId) => {
    if (!confirm('Are you sure you want to remove this friend?')) return;

    try {
      setLoading(true);
      setMessage('');

      const response = await fetch(`/api/flearn-proxy/friends/${friendId}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      
      if (response.ok) {
        setMessage('Friend removed successfully! ✅');
        fetchFriends(); // Refresh the list
      } else {
        setMessage(`Error: ${data.message || 'Failed to remove friend'}`);
      }
    } catch (error) {
      console.error('Error removing friend:', error);
      setMessage('Error connecting to server');
    } finally {
      setLoading(false);
    }
  };

  const getFriendshipStatus = (status) => {
    const statusMap = {
      'pending': { emoji: '⏳', text: 'Pending', class: 'pending' },
      'accepted': { emoji: '✅', text: 'Friends', class: 'accepted' },
      'blocked': { emoji: '🚫', text: 'Blocked', class: 'blocked' },
      'rejected': { emoji: '❌', text: 'Rejected', class: 'rejected' }
    };
    
    return statusMap[status] || { emoji: '❓', text: status, class: 'unknown' };
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
    <div className="friends-manager">
      <div className="manager-header">
        <h2>👥 Friends Manager</h2>
        <div className="header-actions">
          <button 
            onClick={() => setShowAddForm(!showAddForm)}
            className="add-friend-btn"
            disabled={loading}
          >
            {showAddForm ? '❌ Cancel' : '➕ Add Friend'}
          </button>
          <button 
            onClick={fetchFriends}
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

      {showAddForm && (
        <div className="add-friend-form">
          <form onSubmit={addFriend}>
            <div className="form-group">
              <label htmlFor="friendEmail">Friend's Email:</label>
              <input
                type="email"
                id="friendEmail"
                value={newFriendEmail}
                onChange={(e) => setNewFriendEmail(e.target.value)}
                placeholder="Enter friend's email address"
                required
              />
            </div>
            <div className="form-actions">
              <button type="submit" disabled={loading}>
                {loading ? '⏳ Adding...' : '➕ Add Friend'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="friends-content">
        {loading && friends.length === 0 ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading friends...</p>
          </div>
        ) : friends.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">👫</div>
            <h3>No Friends Yet</h3>
            <p>Start building your learning network by adding friends!</p>
            <button 
              onClick={() => setShowAddForm(true)}
              className="cta-btn"
            >
              ➕ Add Your First Friend
            </button>
          </div>
        ) : (
          <div className="friends-grid">
            {friends.map((friend) => {
              const status = getFriendshipStatus(friend.status);
              return (
                <div key={friend.id} className="friend-card">
                  <div className="friend-avatar">
                    {friend.friend_name ? friend.friend_name.charAt(0).toUpperCase() : '👤'}
                  </div>
                  
                  <div className="friend-info">
                    <h3 className="friend-name">
                      {friend.friend_name || 'Unknown User'}
                    </h3>
                    <p className="friend-email">{friend.friend_email}</p>
                    
                    <div className="friend-status">
                      <span className={`status-badge ${status.class}`}>
                        {status.emoji} {status.text}
                      </span>
                    </div>

                    <div className="friend-meta">
                      <p className="added-date">
                        Added: {formatDate(friend.created_at)}
                      </p>
                      {friend.accepted_at && (
                        <p className="accepted-date">
                          Friends since: {formatDate(friend.accepted_at)}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="friend-actions">
                    {friend.status === 'pending' && (
                      <div className="pending-actions">
                        <button className="accept-btn">✅ Accept</button>
                        <button className="reject-btn">❌ Reject</button>
                      </div>
                    )}
                    
                    <button 
                      onClick={() => removeFriend(friend.id)}
                      className="remove-btn"
                      disabled={loading}
                    >
                      🗑️ Remove
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="friends-stats">
        <div className="stat-card">
          <div className="stat-number">{friends.length}</div>
          <div className="stat-label">Total Friends</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">
            {friends.filter(f => f.status === 'accepted').length}
          </div>
          <div className="stat-label">Active Friends</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">
            {friends.filter(f => f.status === 'pending').length}
          </div>
          <div className="stat-label">Pending Requests</div>
        </div>
      </div>

      <div className="friends-help">
        <h3>💡 Tips</h3>
        <ul>
          <li>Add friends using their email address to connect and learn together</li>
          <li>Friends can see your progress and compete in learning challenges</li>
          <li>Pending requests need to be accepted by your friend</li>
          <li>You can remove friends at any time if needed</li>
        </ul>
      </div>
    </div>
  );
}
