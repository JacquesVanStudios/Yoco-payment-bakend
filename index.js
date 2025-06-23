const express = require('express');
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.json());

const PORT = process.env.PORT || 10000;

// Mock "database" for tokens (in production, use a real DB)
let tokens = {
  access_token: 'mock_access_token_123',
  refresh_token: 'mock_refresh_token_456'
};

// 1️⃣ OAuth Authorization Endpoint
app.get('/oauth/authorize', (req, res) => {
  // Simulate user consent and redirect with code
  const redirectUri = req.query.redirect_uri;
  const authCode = 'mock_auth_code_abc';
  return res.redirect(`${redirectUri}?code=${authCode}`);
});

// 2️⃣ Access Token Exchange Endpoint
app.post('/oauth/token', (req, res) => {
  const { code, grant_type, refresh_token } = req.body;

  if (grant_type === 'authorization_code' && code === 'mock_auth_code_abc') {
    return res.json({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      token_type: 'Bearer',
      expires_in: 3600
    });
  }

  if (grant_type === 'refresh_token' && refresh_token === tokens.refresh_token) {
    return res.json({
      access_token: 'new_access_token_789',
      refresh_token: 'new_refresh_token_012',
      token_type: 'Bearer',
      expires_in: 3600
    });
  }

  return res.status(400).json({ error: 'invalid_request' });
});

// 3️⃣ Test Auth Endpoint
app.post('/test-auth', (req, res) => {
  const authHeader = req.headers.authorization;

  if (authHeader === 'Bearer mock_access_token_123') {
    return res.json({ status: 'authorized' });
  }

  return res.status(401).json({ status: 'unauthorized' });
});

app.listen(PORT, () => {
  console.log(`Server live on ${PORT}`);
});
