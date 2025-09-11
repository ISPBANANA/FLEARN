import { useState } from 'react';

export default function ApiTester() {
  const [activeTest, setActiveTest] = useState('');
  const [testResults, setTestResults] = useState({});
  const [loading, setLoading] = useState({});

  const tests = [
    {
      id: 'profile',
      name: '👤 Get Profile',
      method: 'GET',
      endpoint: '/api/flearn-proxy/users/profile',
      description: 'Fetch current user profile'
    },
    {
      id: 'friends',
      name: '👥 Get Friends',
      method: 'GET',
      endpoint: '/api/flearn-proxy/friends',
      description: 'Get list of friends'
    },
    {
      id: 'gardens',
      name: '🌱 Get Gardens', 
      method: 'GET',
      endpoint: '/api/flearn-proxy/gardens',
      description: 'Get list of gardens'
    },
    {
      id: 'add-friend',
      name: '➕ Add Friend',
      method: 'POST',
      endpoint: '/api/flearn-proxy/friends',
      description: 'Add a new friend',
      body: { friend_email: 'friend@example.com' }
    },
    {
      id: 'create-garden',
      name: '🌿 Create Garden',
      method: 'POST', 
      endpoint: '/api/flearn-proxy/gardens',
      description: 'Create a new garden',
      body: { 
        garden_name: 'Test Garden',
        garden_category: 'Educational',
        description: 'A test garden for API testing'
      }
    }
  ];

  const runTest = async (test) => {
    const testId = test.id;
    setLoading(prev => ({ ...prev, [testId]: true }));
    setActiveTest(testId);
    
    try {
      const options = {
        method: test.method,
        headers: {
          'Content-Type': 'application/json',
        }
      };

      if (test.body) {
        options.body = JSON.stringify(test.body);
      }

      const response = await fetch(test.endpoint, options);
      const data = await response.json();
      
      const result = {
        status: response.status,
        statusText: response.statusText,
        success: response.ok,
        data: data,
        timestamp: new Date().toLocaleTimeString(),
        headers: Object.fromEntries(response.headers.entries())
      };

      setTestResults(prev => ({
        ...prev,
        [testId]: result
      }));

    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        [testId]: {
          status: 0,
          statusText: 'Network Error',
          success: false,
          error: error.message,
          timestamp: new Date().toLocaleTimeString()
        }
      }));
    } finally {
      setLoading(prev => ({ ...prev, [testId]: false }));
    }
  };

  const clearResults = () => {
    setTestResults({});
    setActiveTest('');
  };

  const formatJson = (obj) => {
    return JSON.stringify(obj, null, 2);
  };

  return (
    <div className="api-tester">
      <div className="tester-header">
        <h2>🔧 API Tester</h2>
        <p>Test the FLEARN API endpoints with your Auth0 authentication</p>
        <button onClick={clearResults} className="clear-btn">
          🗑️ Clear Results
        </button>
      </div>

      <div className="tests-grid">
        {tests.map(test => (
          <div 
            key={test.id} 
            className={`test-card ${activeTest === test.id ? 'active' : ''}`}
          >
            <div className="test-header">
              <h3>{test.name}</h3>
              <span className={`method-badge ${test.method.toLowerCase()}`}>
                {test.method}
              </span>
            </div>
            
            <div className="test-info">
              <p className="description">{test.description}</p>
              <code className="endpoint">{test.endpoint}</code>
              
              {test.body && (
                <details className="request-body">
                  <summary>📝 Request Body</summary>
                  <pre>{formatJson(test.body)}</pre>
                </details>
              )}
            </div>

            <button
              onClick={() => runTest(test)}
              disabled={loading[test.id]}
              className="test-btn"
            >
              {loading[test.id] ? '⏳ Testing...' : '▶️ Run Test'}
            </button>

            {testResults[test.id] && (
              <div className="test-result">
                <div className="result-header">
                  <span className={`status-badge ${testResults[test.id].success ? 'success' : 'error'}`}>
                    {testResults[test.id].status} {testResults[test.id].statusText}
                  </span>
                  <span className="timestamp">
                    {testResults[test.id].timestamp}
                  </span>
                </div>

                <div className="result-tabs">
                  <details open>
                    <summary>📊 Response Data</summary>
                    <pre className="result-data">
                      {formatJson(testResults[test.id].data || testResults[test.id].error)}
                    </pre>
                  </details>

                  <details>
                    <summary>📋 Response Headers</summary>
                    <pre className="result-headers">
                      {formatJson(testResults[test.id].headers || {})}
                    </pre>
                  </details>

                  <details>
                    <summary>🔍 Full Response</summary>
                    <pre className="result-full">
                      {formatJson(testResults[test.id])}
                    </pre>
                  </details>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="api-info">
        <h3>ℹ️ How to Use</h3>
        <div className="info-grid">
          <div className="info-item">
            <h4>🔐 Authentication</h4>
            <p>All requests automatically include your Auth0 access token</p>
          </div>
          <div className="info-item">
            <h4>🛠️ Testing Process</h4>
            <p>Click "Run Test" to make real API calls to the FLEARN backend</p>
          </div>
          <div className="info-item">
            <h4>📈 Status Codes</h4>
            <ul>
              <li><span className="status-success">200</span> - Success</li>
              <li><span className="status-created">201</span> - Created</li>
              <li><span className="status-error">400</span> - Bad Request</li>
              <li><span className="status-error">401</span> - Unauthorized</li>
              <li><span className="status-error">404</span> - Not Found</li>
              <li><span className="status-error">500</span> - Server Error</li>
            </ul>
          </div>
          <div className="info-item">
            <h4>🔄 Error Handling</h4>
            <p>Network errors and server errors are displayed with full details</p>
          </div>
        </div>
      </div>
    </div>
  );
}
