require('dotenv').config();
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
const { Dropbox } = require('dropbox');

const dbx = new Dropbox({
  clientId: process.env.DROPBOX_CLIENT_ID,
  fetch: fetch
});

if (process.env.DROPBOX_REFRESH_TOKEN) {
  dbx.auth.setRefreshToken(process.env.DROPBOX_REFRESH_TOKEN);
}

async function updateEnvFile(key, value) {
  const envPath = path.resolve(__dirname, '.env');
  let envContents = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';
  const lines = envContents.split('\n');
  let found = false;

  const updatedLines = lines.map(line => {
    if (line.startsWith(`${key}=`)) {
      found = true;
      return `${key}=${value}`;
    }
    return line;
  });

  if (!found) {
    updatedLines.push(`${key}=${value}`);
  }

  fs.writeFileSync(envPath, updatedLines.join('\n'));
}

async function checkAndRefreshToken() {
  try {
    // Verify current access token
    if (process.env.DPX_TOKEN) {
      dbx.setAccessToken(process.env.DPX_TOKEN);
      await dbx.usersGetCurrentAccount();
      console.log('DPX token is valid');
      return true;
    }
    throw new Error('No DPX token found');
  } catch (error) {
    if (error.status === 401 || error.message.includes('No DPX token')) {
      console.log('Attempting token refresh...');
      
      try {
        const response = await dbx.auth.refreshAccessToken();
        const newAccessToken = response.result.access_token;
        
        // Update environment variables
        await updateEnvFile('DPX_TOKEN', newAccessToken);
        console.log('Successfully refreshed DPX token');
        
        // Update Dropbox instance with new token
        dbx.setAccessToken(newAccessToken);
        return true;
      } catch (refreshError) {
        console.error('Failed to refresh DPX token:', refreshError);
        return false;
      }
    }
    
    console.error('Error verifying DPX token:', error);
    return false;
  }
}

// Initial check and schedule every 3 hours
checkAndRefreshToken().then(success => {
  if (success) {
    setInterval(checkAndRefreshToken, 3 * 60 * 60 * 1000); // 3 hours
  } else {
    console.error('Initial token check failed. Please check your refresh token.');
  }
});