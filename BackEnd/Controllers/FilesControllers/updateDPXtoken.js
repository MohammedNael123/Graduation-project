const axios = require("axios");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

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
    updateEnvVariable("DPX_TOKEN",dropboxAccessToken)


  } catch (error) {
    console.error("❌ Error refreshing Dropbox token:", error.response?.data || error.message);
  }
}

function updateEnvVariable(key, value) {
  const envPath = path.resolve(__dirname, ".env");
  let envContent = fs.readFileSync(envPath, "utf8");

  const regex = new RegExp(`^${key}=.*$`, "m");
  if (envContent.match(regex)) {
    envContent = envContent.replace(regex, `${key}=${value}`);
  } else {
    envContent += `\n${key}=${value}`;
  }

  fs.writeFileSync(envPath, envContent, "utf8");
  console.log(`📝 .env updated:**** ${key}=****`);
}

function getDropboxToken() {
  return dropboxAccessToken;
}

module.exports = {
  refreshDropboxToken,
  getDropboxToken,
};

