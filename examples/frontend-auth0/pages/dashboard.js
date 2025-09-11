import { withPageAuthRequired } from '@auth0/nextjs-auth0/client';
import { useState } from 'react';
import Layout from '../components/Layout';
import UserProfile from '../components/UserProfile';
import ApiTester from '../components/ApiTester';
import FriendsManager from '../components/FriendsManager';
import GardensManager from '../components/GardensManager';

export default withPageAuthRequired(function Dashboard() {
  const [activeTab, setActiveTab] = useState('profile');

  const tabs = [
    { id: 'profile', label: '👤 Profile', component: UserProfile },
    { id: 'api', label: '🔌 API Tests', component: ApiTester },
    { id: 'friends', label: '👥 Friends', component: FriendsManager },
    { id: 'gardens', label: '🌱 Gardens', component: GardensManager },
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component;

  return (
    <Layout>
      <div className="dashboard">
        <div className="dashboard-header">
          <h1>🎯 Learning Dashboard</h1>
          <p>Manage your learning journey and connect with friends</p>
        </div>
        
        <div className="dashboard-tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        
        <div className="dashboard-content">
          {ActiveComponent && <ActiveComponent />}
        </div>
      </div>
    </Layout>
  );
});
