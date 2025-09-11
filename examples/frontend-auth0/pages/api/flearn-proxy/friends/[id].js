import { getAccessToken, withApiAuthRequired } from '@auth0/nextjs-auth0';

export default withApiAuthRequired(async function handler(req, res) {
  try {
    const { accessToken } = await getAccessToken(req, res);

    const { method } = req;
    const { id } = req.query;
    const apiUrl = `${process.env.FLEARN_API_URL || 'http://localhost:8099'}/api/friends/${id}`;

    console.log(`[Friends API] ${method} ${apiUrl}`);

    const response = await fetch(apiUrl, {
      method,
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    console.error('[Friends API] Error:', error);
    res.status(500).json({ 
      error: 'Internal Server Error', 
      message: error.message,
      details: 'Failed to proxy friend request to FLEARN backend'
    });
  }
});
