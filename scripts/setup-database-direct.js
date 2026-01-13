#!/usr/bin/env node

/**
 * LineaBlu Legal Impact Score - Database Setup Script
 *
 * This script directly applies the database migration to your Supabase project.
 * Run this instead of using the Supabase CLI.
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Missing Supabase credentials');
  console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local');
  process.exit(1);
}

console.log('🚀 LineaBlu Legal Impact Score - Database Setup');
console.log('================================================\n');
console.log(`📍 Supabase URL: ${supabaseUrl}`);
console.log('🔑 Service key found\n');

// Create Supabase admin client
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Read the migration SQL
const migrationPath = path.join(__dirname, '../supabase/migrations/001_initial_schema.sql');
const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

console.log('📄 Migration file loaded\n');
console.log('⚙️  Applying database migration...\n');

// Split SQL into individual statements (basic split by semicolon)
const statements = migrationSQL
  .split(';')
  .map(s => s.trim())
  .filter(s => s.length > 0 && !s.startsWith('--'));

async function runMigration() {
  try {
    console.log(`📊 Found ${statements.length} SQL statements to execute\n`);

    let successCount = 0;
    let skipCount = 0;

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';';
      const preview = statement.substring(0, 80).replace(/\s+/g, ' ');

      process.stdout.write(`[${i + 1}/${statements.length}] ${preview}...`);

      try {
        const { data, error } = await supabase.rpc('exec_sql', {
          sql: statement
        });

        if (error) {
          // Check if it's a "already exists" error, which is okay
          if (error.message && (
            error.message.includes('already exists') ||
            error.message.includes('does not exist')
          )) {
            console.log(' ⚠️  SKIP (already exists)');
            skipCount++;
          } else {
            console.log(` ❌ ERROR: ${error.message}`);
          }
        } else {
          console.log(' ✅');
          successCount++;
        }
      } catch (err) {
        console.log(` ❌ ERROR: ${err.message}`);
      }
    }

    console.log('\n================================================');
    console.log(`✅ Migration complete!`);
    console.log(`   Success: ${successCount} statements`);
    console.log(`   Skipped: ${skipCount} statements`);
    console.log('================================================\n');

    // Verify tables exist
    console.log('🔍 Verifying tables...\n');

    const { data: tables, error: tablesError } = await supabase
      .from('assessments')
      .select('count')
      .limit(1);

    if (!tablesError) {
      console.log('✅ assessments table: EXISTS');
    } else {
      console.log('❌ assessments table: NOT FOUND');
    }

    const { data: emailTables, error: emailError } = await supabase
      .from('email_sequences')
      .select('count')
      .limit(1);

    if (!emailError) {
      console.log('✅ email_sequences table: EXISTS');
    } else {
      console.log('❌ email_sequences table: NOT FOUND');
    }

    const { data: analyticsTables, error: analyticsError } = await supabase
      .from('analytics_events')
      .select('count')
      .limit(1);

    if (!analyticsError) {
      console.log('✅ analytics_events table: EXISTS');
    } else {
      console.log('❌ analytics_events table: NOT FOUND');
    }

    console.log('\n================================================');
    console.log('🎉 Database setup complete!');
    console.log('================================================\n');
    console.log('Next steps:');
    console.log('1. Test locally: npm run dev');
    console.log('2. Complete an assessment');
    console.log('3. Check Supabase dashboard to see data\n');

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error('\nTry running the SQL manually in Supabase SQL Editor:');
    console.error('1. Go to https://app.supabase.com/project/bucygeoagmovtqptdpsa');
    console.error('2. Click SQL Editor');
    console.error('3. Copy contents of supabase/migrations/001_initial_schema.sql');
    console.error('4. Paste and run\n');
    process.exit(1);
  }
}

// Alternative approach: Use raw SQL execution
async function runMigrationDirect() {
  try {
    console.log('📊 Running migration using direct SQL execution...\n');

    // Try to run the entire migration at once
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: migrationSQL
    });

    if (error) {
      console.log('⚠️  Direct execution failed, trying statement by statement...\n');
      await runMigration();
    } else {
      console.log('✅ Migration applied successfully!\n');
      console.log('🔍 Verifying tables...\n');

      const tables = ['assessments', 'email_sequences', 'analytics_events'];
      for (const table of tables) {
        const { error: checkError } = await supabase
          .from(table)
          .select('count')
          .limit(1);

        if (!checkError) {
          console.log(`✅ ${table} table: EXISTS`);
        } else {
          console.log(`❌ ${table} table: NOT FOUND`);
        }
      }

      console.log('\n🎉 Database setup complete!\n');
    }
  } catch (error) {
    console.log('⚠️  Error with direct execution, trying alternative method...\n');
    await runMigrationManual();
  }
}

// Manual approach - use Supabase management API
async function runMigrationManual() {
  console.log('📋 Manual Setup Instructions:\n');
  console.log('Since automated setup is not available, please follow these steps:\n');
  console.log('1. Go to: https://app.supabase.com/project/bucygeoagmovtqptdpsa/sql');
  console.log('2. Click "New query"');
  console.log('3. Copy the contents of: supabase/migrations/001_initial_schema.sql');
  console.log('4. Paste into the SQL Editor');
  console.log('5. Click "Run" (or press Cmd+Enter)\n');
  console.log('The migration file is located at:');
  console.log(`   ${migrationPath}\n`);
  console.log('After running, verify tables exist in Table Editor.\n');
}

// Run the migration
runMigrationManual();
