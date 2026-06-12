import fs from 'fs';
import path from 'path';

const migrationsDir = './supabase/migrations';
const outputFile = './supabase/combined_migration.sql';

function combine() {
  try {
    const file1Path = path.join(migrationsDir, '20260611000100_kavconsultant_extensions_types_helpers.sql');
    const file2Path = path.join(migrationsDir, '20260611000200_kavconsultant_tables_indexes_constraints.sql');
    const file3Path = path.join(migrationsDir, '20260611000300_kavconsultant_triggers_rls_policies.sql');
    const file4Path = path.join(migrationsDir, '20260611000400_application_pipeline_stage.sql');
    const file5Path = path.join(migrationsDir, '20260612000500_remaining_tables_and_policies.sql');

    const file1Content = fs.readFileSync(file1Path, 'utf8');
    const file2Content = fs.readFileSync(file2Path, 'utf8');
    const file3Content = fs.readFileSync(file3Path, 'utf8');
    const file4Content = fs.readFileSync(file4Path, 'utf8');
    const file5Content = fs.readFileSync(file5Path, 'utf8');

    // Split file 1 into Part A (Enums, types) and Part B (Helper functions querying tables)
    const splitToken = 'create or replace function public.is_tenant_member';
    const splitIndex = file1Content.indexOf(splitToken);

    if (splitIndex === -1) {
      throw new Error(`Split token "${splitToken}" not found in 20260611000100 migration.`);
    }

    const file1PartA = file1Content.substring(0, splitIndex);
    const file1PartB = file1Content.substring(splitIndex);

    let combinedSql = '';

    // 1. Extensions, Types, simple helpers (Block A)
    combinedSql += `-- ==========================================\n`;
    combinedSql += `-- SECTION 1: EXTENSIONS, ENUMS, SIMPLE UTILS (20260611000100 Part A)\n`;
    combinedSql += `-- ==========================================\n\n`;
    combinedSql += file1PartA.trim();
    combinedSql += '\n\n';

    // 2. Core Tables, Indexes, Constraints (File 2)
    combinedSql += `-- ==========================================\n`;
    combinedSql += `-- SECTION 2: CORE TABLES & INDEXES (20260611000200)\n`;
    combinedSql += `-- ==========================================\n\n`;
    combinedSql += file2Content.trim();
    combinedSql += '\n\n';

    // 3. Helper Functions querying tables (Block B)
    combinedSql += `-- ==========================================\n`;
    combinedSql += `-- SECTION 3: COMPLEX HELPER FUNCTIONS (20260611000100 Part B)\n`;
    combinedSql += `-- ==========================================\n\n`;
    combinedSql += file1PartB.trim();
    combinedSql += '\n\n';

    // 4. Triggers, RLS Policies for Core Tables (File 3)
    combinedSql += `-- ==========================================\n`;
    combinedSql += `-- SECTION 4: CORE TRIGGERS & RLS POLICIES (20260611000300)\n`;
    combinedSql += `-- ==========================================\n\n`;
    combinedSql += file3Content.trim();
    combinedSql += '\n\n';

    // 5. Pipeline Stage Configuration (File 4)
    combinedSql += `-- ==========================================\n`;
    combinedSql += `-- SECTION 5: PIPELINE CONFIGURATION (20260611000400)\n`;
    combinedSql += `-- ==========================================\n\n`;
    combinedSql += file4Content.trim();
    combinedSql += '\n\n';

    // 6. Remaining Tables and Policies (File 5)
    combinedSql += `-- ==========================================\n`;
    combinedSql += `-- SECTION 6: REMAINING TABLES & POLICIES (20260612000500)\n`;
    combinedSql += `-- ==========================================\n\n`;
    combinedSql += file5Content.trim();
    combinedSql += '\n\n';

    fs.writeFileSync(outputFile, combinedSql);
    console.log(`Successfully created REORDERED combined migration file at: ${outputFile}`);
  } catch (err) {
    console.error('Error combining migrations:', err);
  }
}

combine();
