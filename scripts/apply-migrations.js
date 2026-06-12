import fs from 'fs';
import path from 'path';
import pg from 'pg';

const { Client } = pg;
const sqlFilePath = './supabase/combined_migration.sql';
const password = 'KavConsultant2026';
const username = 'postgres.wanmdazaqzbfyeohfaon';
const database = 'postgres';

// List of all Supabase regions
const regions = [
  { name: 'Singapore (ap-southeast-1)', host: 'aws-0-ap-southeast-1.pooler.supabase.com' },
  { name: 'Mumbai (ap-south-1)', host: 'aws-0-ap-south-1.pooler.supabase.com' },
  { name: 'N. Virginia (us-east-1)', host: 'aws-0-us-east-1.pooler.supabase.com' },
  { name: 'Ohio (us-east-2)', host: 'aws-0-us-east-2.pooler.supabase.com' },
  { name: 'N. California (us-west-1)', host: 'aws-0-us-west-1.pooler.supabase.com' },
  { name: 'Oregon (us-west-2)', host: 'aws-0-us-west-2.pooler.supabase.com' },
  { name: 'Tokyo (ap-northeast-1)', host: 'aws-0-ap-northeast-1.pooler.supabase.com' },
  { name: 'Seoul (ap-northeast-2)', host: 'aws-0-ap-northeast-2.pooler.supabase.com' },
  { name: 'Osaka (ap-northeast-3)', host: 'aws-0-ap-northeast-3.pooler.supabase.com' },
  { name: 'Sydney (ap-southeast-2)', host: 'aws-0-ap-southeast-2.pooler.supabase.com' },
  { name: 'Canada Central (ca-central-1)', host: 'aws-0-ca-central-1.pooler.supabase.com' },
  { name: 'Frankfurt (eu-central-1)', host: 'aws-0-eu-central-1.pooler.supabase.com' },
  { name: 'Ireland (eu-west-1)', host: 'aws-0-eu-west-1.pooler.supabase.com' },
  { name: 'London (eu-west-2)', host: 'aws-0-eu-west-2.pooler.supabase.com' },
  { name: 'Paris (eu-west-3)', host: 'aws-0-eu-west-3.pooler.supabase.com' },
  { name: 'Stockholm (eu-north-1)', host: 'aws-0-eu-north-1.pooler.supabase.com' },
  { name: 'São Paulo (sa-east-1)', host: 'aws-0-sa-east-1.pooler.supabase.com' },
  { name: 'Cape Town (af-south-1)', host: 'aws-0-af-south-1.pooler.supabase.com' },
  { name: 'Middle East (me-central-1)', host: 'aws-0-me-central-1.pooler.supabase.com' }
];

async function tryConnectAndRun() {
  const sql = fs.readFileSync(sqlFilePath, 'utf8');
  console.log(`Loaded migration file from ${sqlFilePath} (${sql.length} characters).`);

  for (const region of regions) {
    console.log(`Trying to connect to database in region: ${region.name}...`);
    const client = new Client({
      host: region.host,
      port: 6543,
      user: username,
      password: password,
      database: database,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 3000,
    });

    try {
      await client.connect();
      console.log(`✅ Connected successfully to ${region.name}!`);
      console.log('Running SQL migrations...');
      
      // Run the entire SQL block
      await client.query(sql);
      
      console.log('🎉 Migrations executed successfully!');
      await client.end();
      return;
    } catch (err) {
      console.log(`❌ Failed to connect or execute on ${region.name}:`, err.message);
      try {
        await client.end();
      } catch (e) {}
    }
  }

  console.error('❌ Could not connect to any of the database regional poolers. Please verify credentials or connection settings.');
  process.exit(1);
}

tryConnectAndRun();
