// pages/api/neon.js
import { Pool } from 'pg';
import UAParser from 'ua-parser-js';
import geoip from 'geoip-lite';

let { PGHOST, PGDATABASE, PGUSER, PGPASSWORD } = process.env;

const pool = new Pool({
  host: PGHOST,
  database: PGDATABASE,
  user: PGUSER,
  password: PGPASSWORD,
  port: 5432,
  ssl: {
    rejectUnauthorized: false,
  },
});


export default async function handler(req, res) {
  // Get the device type from the user agent
  const userAgent = req.headers['user-agent'];
  const parser = new UAParser();
  parser.setUA(userAgent);
  const uaResult = parser.getResult();
  let deviceType = uaResult.device.type;

  // Check if deviceType is null and set it to 'unknown' if it is
  if (!deviceType) {
    deviceType = 'unknown';
  }

  // Get the client's IP address
  const ip = (req.headers['x-forwarded-for'] || '').split(',').pop().trim() || 
         req.connection.remoteAddress || 
         req.socket.remoteAddress || 
         req.connection.socket.remoteAddress;

  // Get the geolocation data for the IP address
  const geo = geoip.lookup(ip);

  // Insert a new row into the nextjs table
  const currentTime = new Date();
  await pool.query("INSERT INTO nextjs (time, device_type, location) VALUES ($1, $2, $3)", [currentTime, deviceType, geo]);

  // Query the latest row from the nextjs table
  const queryResult = await pool.query("SELECT * FROM nextjs ORDER BY time DESC LIMIT 1");

  // Send the latest row as a JSON response
  res.status(200).json(queryResult.rows[0]);
}