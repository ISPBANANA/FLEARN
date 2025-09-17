import { getAccessToken, withApiAuthRequired } from '@auth0/nextjs-auth0';

export default withApiAuthRequired(async function handler(req, res) {
  try {
    const { accessToken } = await getAccessToken(req, res);

    const { method, body } = req;
    const apiUrl = `${process.env.FLEARN_API_URL || 'http://localhost:8099'}/api/users/profile`;

    console.log(`[API Proxy] ${method} ${apiUrl}`);
    console.log(`[API Proxy] Access Token: ${accessToken ? 'Present' : 'Missing'}`);

    const response = await fetch(apiUrl, {
      method,
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      ...(method !== 'GET' && { body: JSON.stringify(body) }),
    });

    const data = await response.json();
    
    console.log(`[API Proxy] Response Status: ${response.status}`);
    console.log(`[API Proxy] Response Data:`, data);

    res.status(response.status).json(data);
  } catch (error) {
    console.error('[API Proxy] Error:', error);
    res.status(500).json({ 
      error: 'Internal Server Error', 
      message: error.message,
      details: 'Failed to proxy request to FLEARN backend'
    });
  }
});
