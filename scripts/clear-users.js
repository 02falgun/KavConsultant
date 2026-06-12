import pg from 'pg';

const { Client } = pg;
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

async function clearUsers() {
  console.log('Resetting users and tenants database records...');

  for (const region of regions) {
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
      console.log(`Connected to database in ${region.name}.`);

      console.log('Deleting from auth.users and public.tenants...');
      // Cascade delete starting from auth.users (auth schema) and public.tenants (public schema)
      await client.query('DELETE FROM auth.users;');
      await client.query('DELETE FROM public.tenants;');
      
      console.log('🎉 Database successfully reset! All users and tenants deleted.');
      await client.end();
      return;
    } catch (err) {
      if (err.message && err.message.includes('tenant/user postgres.wanmdazaqzbfyeohfaon not found')) {
        // Skip silently for other regions
      } else {
        console.log(`❌ Failed to reset on ${region.name}:`, err.message);
      }
      try {
        await client.end();
      } catch (e) {}
    }
  }

  console.error('❌ Could not connect to the database to reset users. Please ensure credentials are correct.');
  process.exit(1);
}

clearUsers();
