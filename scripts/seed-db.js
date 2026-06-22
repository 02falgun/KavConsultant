import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing env vars: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function run() {
  console.log('Seeding universities and programs for all active tenants...');

  const { data: tenants, error: tenantsErr } = await supabase.from('tenants').select('id, name');
  if (tenantsErr) {
    console.error('Error fetching tenants:', tenantsErr.message);
    process.exit(1);
  }

  if (!tenants || tenants.length === 0) {
    console.error('No tenants found in the database. Please create a tenant first.');
    process.exit(1);
  }

  // First, clean up existing records to prevent unique constraint failures
  console.log('Cleaning up existing programs and universities...');
  const { error: delProgError } = await supabase.from('programs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  const { error: delUniError } = await supabase.from('universities').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  if (delProgError || delUniError) {
    console.error('Error cleaning tables:', delProgError?.message || delUniError?.message);
  }

  for (const tenant of tenants) {
    console.log(`\n--- Seeding for Tenant: ${tenant.name} (${tenant.id}) ---`);

    // 1. Seed Universities
    const universitiesData = [
      {
        tenant_id: tenant.id,
        name: 'Oxford University',
        slug: 'oxford-university',
        country: 'United Kingdom',
        city: 'Oxford',
        website: 'https://ox.ac.uk',
        email: 'admissions@ox.ac.uk',
        type: 'university'
      },
      {
        tenant_id: tenant.id,
        name: 'University of Toronto',
        slug: 'university-of-toronto',
        country: 'Canada',
        city: 'Toronto',
        website: 'https://utoronto.ca',
        email: 'international@utoronto.ca',
        type: 'university'
      },
      {
        tenant_id: tenant.id,
        name: 'MIT',
        slug: 'mit',
        country: 'United States',
        city: 'Cambridge',
        website: 'https://mit.edu',
        email: 'admissions@mit.edu',
        type: 'university'
      }
    ];

    const { data: insertedUnis, error: uniError } = await supabase
      .from('universities')
      .insert(universitiesData)
      .select('id, name, slug');

    if (uniError) {
      console.error(`Failed to insert universities for tenant ${tenant.name}:`, uniError.message);
      continue;
    }

    console.log(`Seeded ${insertedUnis?.length} universities successfully.`);
    insertedUnis?.forEach(u => {
      console.log(`  - University: ${u.name} (UUID: ${u.id})`);
    });

    // 2. Seed Programs
    const oxford = insertedUnis?.find(u => u.slug === 'oxford-university');
    const uoft = insertedUnis?.find(u => u.slug === 'university-of-toronto');
    const mit = insertedUnis?.find(u => u.slug === 'mit');

    const programsData = [];

    if (oxford) {
      programsData.push({
        tenant_id: tenant.id,
        university_id: oxford.id,
        code: 'MSC-CS-OX',
        name: 'MSc Computer Science',
        degree_level: 'Postgraduate',
        field_of_study: 'Engineering',
        duration_months: 12,
        intake_months: ['September'],
        tuition_fee_min: 32000,
        tuition_fee_max: 32000
      });
    }

    if (uoft) {
      programsData.push({
        tenant_id: tenant.id,
        university_id: uoft.id,
        code: 'MBA-BA-UT',
        name: 'MBA Business Administration',
        degree_level: 'Postgraduate',
        field_of_study: 'Business School',
        duration_months: 24,
        intake_months: ['September', 'January'],
        tuition_fee_min: 45000,
        tuition_fee_max: 45000
      });
    }

    if (mit) {
      programsData.push({
        tenant_id: tenant.id,
        university_id: mit.id,
        code: 'BSC-DS-MIT',
        name: 'BSc Data Science',
        degree_level: 'Undergraduate',
        field_of_study: 'Computer Science',
        duration_months: 48,
        intake_months: ['September'],
        tuition_fee_min: 55000,
        tuition_fee_max: 55000
      });
    }

    if (programsData.length > 0) {
      const { data: insertedProgs, error: progError } = await supabase
        .from('programs')
        .insert(programsData)
        .select('id, name, university_id');

      if (progError) {
        console.error(`Failed to insert programs for tenant ${tenant.name}:`, progError.message);
        continue;
      }

      console.log(`Seeded ${insertedProgs?.length} programs successfully.`);
      insertedProgs?.forEach(p => {
        console.log(`  - Program: ${p.name} (UUID: ${p.id})`);
      });
    }
  }

  console.log('\n🎉 Database successfully seeded! Use the above UUIDs to test student application registrations.');
}

run();
