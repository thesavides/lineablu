#!/usr/bin/env node

/**
 * LineaBlu Legal Impact Score - Direct Database Setup
 * Uses the service role key to set up the database directly via Supabase API
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Supabase credentials
const SUPABASE_URL = 'https://bucygeoagmovtqptdpsa.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ1Y3lnZW9hZ21vdnRxcHRkcHNhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODMxMzA3OSwiZXhwIjoyMDgzODg5MDc5fQ.b4aLP8ExDBFU867buxuWaZLr-5Ak78ZBO6G0--MFphg';

console.log('🚀 LineaBlu Legal Impact Score - Database Setup');
console.log('================================================\n');

// Read migration SQL
const migrationPath = path.join(__dirname, '../supabase/migrations/001_initial_schema.sql');
const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

console.log('📄 Migration SQL loaded');
console.log(`📊 SQL length: ${migrationSQL.length} characters\n`);

// Make API request to Supabase
function executeSQL(sql) {
  return new Promise((resolve, reject) => {
    const url = new URL('/rest/v1/rpc/exec_sql', SUPABASE_URL);

    const postData = JSON.stringify({ sql });

    const options = {
      hostname: url.hostname,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Prefer': 'return=minimal',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ success: true, data, statusCode: res.statusCode });
        } else {
          resolve({ success: false, error: data, statusCode: res.statusCode });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

// Check if table exists
async function checkTable(tableName) {
  return new Promise((resolve, reject) => {
    const url = new URL(`/rest/v1/${tableName}?limit=0`, SUPABASE_URL);

    const options = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method: 'HEAD',
      headers: {
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`
      }
    };

    const req = https.request(options, (res) => {
      resolve(res.statusCode === 200);
    });

    req.on('error', () => {
      resolve(false);
    });

    req.end();
  });
}

async function main() {
  console.log('⚙️  Applying database migration...\n');

  try {
    // Try to execute the SQL
    const result = await executeSQL(migrationSQL);

    if (result.success) {
      console.log('✅ Migration executed successfully!\n');
    } else {
      console.log(`⚠️  Response: ${result.statusCode}`);
      if (result.error) {
        console.log(`   ${result.error}\n`);
      }
      console.log('   This might mean the tables already exist or the exec_sql function is not available.\n');
    }

    // Verify tables exist
    console.log('🔍 Verifying tables...\n');

    const tables = ['assessments', 'email_sequences', 'analytics_events'];
    let allExist = true;

    for (const table of tables) {
      const exists = await checkTable(table);
      if (exists) {
        console.log(`✅ ${table}: EXISTS`);
      } else {
        console.log(`❌ ${table}: NOT FOUND`);
        allExist = false;
      }
    }

    console.log('\n================================================');

    if (allExist) {
      console.log('🎉 Database setup complete!');
      console.log('================================================\n');
      console.log('Next steps:');
      console.log('1. Run: npm run dev');
      console.log('2. Visit: http://localhost:3000');
      console.log('3. Complete a test assessment');
      console.log('4. Check Supabase dashboard to see data\n');
    } else {
      console.log('⚠️  Some tables missing - Manual setup required');
      console.log('================================================\n');
      console.log('Please run the SQL manually:');
      console.log('1. Go to: https://app.supabase.com/project/bucygeoagmovtqptdpsa/sql');
      console.log('2. Click "New query"');
      console.log('3. Copy contents of: supabase/migrations/001_initial_schema.sql');
      console.log('4. Paste and click "Run"\n');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n================================================');
    console.log('Manual Setup Instructions:');
    console.log('================================================\n');
    console.log('1. Go to: https://app.supabase.com/project/bucygeoagmovtqptdpsa/sql');
    console.log('2. Click "New query"');
    console.log('3. Open: supabase/migrations/001_initial_schema.sql');
    console.log('4. Copy all contents');
    console.log('5. Paste into SQL Editor');
    console.log('6. Click "Run" (or Cmd+Enter)\n');
  }
}

main();
