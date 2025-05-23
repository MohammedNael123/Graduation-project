// dropboxTokenManager.js
const axios = require("axios");

const refresh_token = process.env.DPX_REFRESH_TOKEN;
const client_id = process.env.DPX_CLIENT_ID;
const client_secret = process.env.DPX_CLIENT_SECRET;

let dropboxAccessToken = null;

async function refreshDropboxToken() {
  const params = new URLSearchParams();
  params.append("grant_type", "refresh_token");
  params.append("refresh_token", refresh_token);

  const authHeader = Buffer.from(`${client_id}:${client_secret}`).toString("base64");

  try {
    const response = await axios.post("https://api.dropbox.com/oauth2/token", params, {
      headers: {
        Authorization: `Basic ${authHeader}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    dropboxAccessToken = response.data.access_token;
    console.log("✅ Dropbox token refreshed:", new Date().toISOString());

  } catch (error) {
    console.error("❌ Error refreshing Dropbox token:", error.response?.data || error.message);
  }
}

function getDropboxToken() {
  return dropboxAccessToken;
}

module.exports = {
  refreshDropboxToken,
  getDropboxToken,
};
