import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing env vars: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function run() {
  console.log('Querying database tables...');

  const { data: users, error: usersErr } = await supabase.from('users').select('*');
  console.log('Users:', usersErr ? usersErr.message : users);

  const { data: memberships, error: membErr } = await supabase.from('memberships').select('*');
  console.log('Memberships:', membErr ? membErr.message : memberships);

  const { data: tenants, error: tenantsErr } = await supabase.from('tenants').select('*');
  console.log('Tenants:', tenantsErr ? tenantsErr.message : tenants);
}

run();
