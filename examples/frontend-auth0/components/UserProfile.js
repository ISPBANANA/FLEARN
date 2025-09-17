import { useUser } from '@auth0/nextjs-auth0/client';
import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function UserProfile() {
  const { user, error, isLoading } = useUser();
  const [profile, setProfile] = useState(null);
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    birthdate: '',
    edu_level: 'High School'
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user) {
      fetchProfile();
      setProfileForm({
        name: user.name || '',
        email: user.email || '',
        birthdate: '',
        edu_level: 'High School'
      });
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/flearn-proxy/users/profile');
      if (response.ok) {
        const data = await response.json();
        setProfile(data.user);
        setProfileForm({
          name: data.user.name || '',
          email: data.user.email || '',
          birthdate: data.user.birthdate || '',
          edu_level: data.user.edu_level || 'High School'
        });
      } else if (response.status === 404) {
        // User profile doesn't exist yet, show form to create
        setIsEditing(true);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setMessage('Error fetching profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setMessage('');
      
      const response = await fetch('/api/flearn-proxy/users/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileForm),
      });

      const data = await response.json();
      
      if (response.ok) {
        setProfile(data.user);
        setIsEditing(false);
        setMessage('Profile saved successfully! ✅');
      } else {
        setMessage(`Error: ${data.message || 'Failed to save profile'}`);
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      setMessage('Error saving profile');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setProfileForm({
      ...profileForm,
      [e.target.name]: e.target.value
    });
  };

  if (isLoading && !user) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="user-profile">
      <div className="profile-header">
        <div className="profile-avatar">
          {user?.picture ? (
            <Image
              src={user.picture}
              alt={user.name || 'User'}
              width={80}
              height={80}
              className="avatar-image"
            />
          ) : (
            <div className="avatar-placeholder">
              👤
            </div>
          )}
        </div>
        <div className="profile-basic">
          <h2>{user?.name || 'User'}</h2>
          <p className="email">{user?.email}</p>
          <p className="auth0-id">Auth0 ID: {user?.sub}</p>
        </div>
      </div>

      {message && (
        <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>
          {message}
        </div>
      )}

      <div className="profile-content">
        <div className="profile-section">
          <div className="section-header">
            <h3>📝 Profile Information</h3>
            {profile && !isEditing && (
              <button 
                onClick={() => setIsEditing(true)}
                className="edit-btn"
                disabled={loading}
              >
                ✏️ Edit
              </button>
            )}
          </div>

          {isEditing ? (
            <form onSubmit={handleSubmit} className="profile-form">
              <div className="form-group">
                <label htmlFor="name">Full Name:</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={profileForm.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email:</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={profileForm.email}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="birthdate">Birth Date:</label>
                <input
                  type="date"
                  id="birthdate"
                  name="birthdate"
                  value={profileForm.birthdate}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="edu_level">Education Level:</label>
                <select
                  id="edu_level"
                  name="edu_level"
                  value={profileForm.edu_level}
                  onChange={handleInputChange}
                  required
                >
                  <option value="Elementary">Elementary</option>
                  <option value="Middle School">Middle School</option>
                  <option value="High School">High School</option>
                  <option value="University">University</option>
                  <option value="Graduate">Graduate</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="form-actions">
                <button type="submit" disabled={loading} className="save-btn">
                  {loading ? '⏳ Saving...' : '💾 Save Profile'}
                </button>
                {profile && (
                  <button 
                    type="button" 
                    onClick={() => setIsEditing(false)}
                    className="cancel-btn"
                  >
                    ❌ Cancel
                  </button>
                )}
              </div>
            </form>
          ) : profile ? (
            <div className="profile-display">
              <div className="profile-stats">
                <div className="stat">
                  <span className="stat-label">🏆 Rank:</span>
                  <span className="stat-value">{profile.rank}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">🔥 Streak:</span>
                  <span className="stat-value">{profile.streak} days</span>
                </div>
                <div className="stat">
                  <span className="stat-label">✅ Tasks:</span>
                  <span className="stat-value">{profile.completed_task}</span>
                </div>
              </div>

              <div className="profile-details">
                <div className="detail">
                  <span className="detail-label">📚 Education:</span>
                  <span className="detail-value">{profile.edu_level}</span>
                </div>
                <div className="detail">
                  <span className="detail-label">🎂 Birth Date:</span>
                  <span className="detail-value">
                    {profile.birthdate ? new Date(profile.birthdate).toLocaleDateString() : 'Not set'}
                  </span>
                </div>
                <div className="detail">
                  <span className="detail-label">📅 Joined:</span>
                  <span className="detail-value">
                    {new Date(profile.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="experience-points">
                <h4>🎯 Experience Points</h4>
                <div className="exp-grid">
                  <div className="exp-item">
                    <span className="exp-label">📊 Daily:</span>
                    <span className="exp-value">{profile.daily_exp}</span>
                  </div>
                  <div className="exp-item">
                    <span className="exp-label">🔢 Math:</span>
                    <span className="exp-value">{profile.math_exp}</span>
                  </div>
                  <div className="exp-item">
                    <span className="exp-label">⚗️ Physics:</span>
                    <span className="exp-value">{profile.phy_exp}</span>
                  </div>
                  <div className="exp-item">
                    <span className="exp-label">🧬 Biology:</span>
                    <span className="exp-value">{profile.bio_exp}</span>
                  </div>
                  <div className="exp-item">
                    <span className="exp-label">🧪 Chemistry:</span>
                    <span className="exp-value">{profile.chem_exp}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="no-profile">
              <p>No profile found. Create your profile to get started!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
