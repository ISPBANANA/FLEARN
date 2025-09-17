import { getAccessToken, withApiAuthRequired } from '@auth0/nextjs-auth0';

export default withApiAuthRequired(async function handler(req, res) {
  try {
    const { accessToken } = await getAccessToken(req, res);

    const { method, body } = req;
    const apiUrl = `${process.env.FLEARN_API_URL || 'http://localhost:8099'}/api/gardens`;

    console.log(`[Gardens API] ${method} ${apiUrl}`);

    const response = await fetch(apiUrl, {
      method,
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      ...(method !== 'GET' && { body: JSON.stringify(body) }),
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    console.error('[Gardens API] Error:', error);
    res.status(500).json({ 
      error: 'Internal Server Error', 
      message: error.message,
      details: 'Failed to proxy gardens request to FLEARN backend'
    });
  }
});
