#!/usr/bin/env node
/**
 * One-time script to create the initial System Admin account.
 * Run: node scripts/create-admin-account.mjs
 *
 * Requires .env with VITE_INSFORGE_URL, VITE_INSFORGE_ANON_KEY.
 * Credentials are read from env: CREATE_ADMIN_EMAIL, CREATE_ADMIN_PASSWORD, CREATE_ADMIN_NAME
 */

import { createClient } from '@insforge/sdk';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

function loadEnv() {
  const envPath = resolve(process.cwd(), '.env');
  if (!existsSync(envPath)) {
    console.error('No .env file found. Create one from .env.example with VITE_INSFORGE_URL and VITE_INSFORGE_ANON_KEY.');
    process.exit(1);
  }
  const content = readFileSync(envPath, 'utf-8');
  const env = {};
  for (const line of content.split(/\r?\n/)) {
    const stripped = line.trim();
    if (!stripped || stripped.startsWith('#')) continue;
    const idx = stripped.indexOf('=');
    if (idx <= 0) continue;
    const key = stripped.slice(0, idx).trim();
    let val = stripped.slice(idx + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    env[key] = val;
  }
  return env;
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 30) || 'garage';
}

async function bootstrapAccount(client, userId, userName) {
  const { data: existing } = await client.database
    .from('profiles')
    .select('user_id')
    .eq('user_id', userId)
    .maybeSingle();
  if (existing) return;

  const accountName = (userName || 'Admin').trim();
  const slug = `${slugify(accountName)}-${crypto.randomUUID().slice(0, 8)}`;

  const { data: accounts, error: accountError } = await client.database
    .from('accounts')
    .insert([{ owner_user_id: userId, name: accountName, slug }])
    .select('id')
    .limit(1);

  if (accountError || !accounts?.[0]) throw new Error(accountError?.message ?? 'Failed to create account');
  const accountId = accounts[0].id;

  const { error: profileError } = await client.database.from('profiles').insert([
    { user_id: userId, default_account_id: accountId, measurement_system: 'imperial' },
  ]);
  if (profileError) throw new Error(profileError.message ?? 'Failed to create profile');

  const { error: memberError } = await client.database.from('account_members').insert([
    { account_id: accountId, user_id: userId, role: 'owner' },
  ]);
  if (memberError) throw new Error(memberError.message ?? 'Failed to add membership');

  const { error: consentError } = await client.database.from('consents').insert([
    { user_id: userId, consent_type: 'terms', granted: true },
    { user_id: userId, consent_type: 'privacy', granted: true },
    { user_id: userId, consent_type: 'marketing', granted: false },
  ]);
  if (consentError) console.warn('Consent insert warning:', consentError.message);
}

async function main() {
  const env = { ...loadEnv(), ...process.env };
  const baseUrl = env.VITE_INSFORGE_URL;
  const anonKey = env.VITE_INSFORGE_ANON_KEY;
  const email = env.CREATE_ADMIN_EMAIL || 'autovital013@gmail.com';
  const password = env.CREATE_ADMIN_PASSWORD;
  const name = env.CREATE_ADMIN_NAME || 'AutoVital Admin';

  if (!password) {
    console.error('Set CREATE_ADMIN_PASSWORD in .env or pass it when running.');
    process.exit(1);
  }

  if (!baseUrl || !anonKey) {
    console.error('Missing VITE_INSFORGE_URL or VITE_INSFORGE_ANON_KEY in .env');
    process.exit(1);
  }

  const client = createClient({
    baseUrl: baseUrl.replace(/\/$/, ''),
    anonKey,
  });

  console.log('Signing up admin:', email);
  const { data, error } = await client.auth.signUp({
    email,
    password,
    name,
  });

  if (error) {
    if (error.message?.includes('already registered') || error.message?.toLowerCase().includes('already exists')) {
      console.log('User already exists. Add', email, 'to VITE_ADMIN_EMAILS in .env if not already done.');
      return;
    }
    console.error('Sign up failed:', error.message);
    process.exit(1);
  }

  if (data?.requireEmailVerification) {
    console.log('\nEmail verification is required. Check', email, 'for a verification link or OTP.');
    console.log('After verifying, add this to your .env:');
    console.log('VITE_ADMIN_EMAILS=' + email);
    console.log('\nThen log in at /login to access the admin panel.');
    return;
  }

  if (data?.user && data?.accessToken) {
    const authedClient = createClient({
      baseUrl: baseUrl.replace(/\/$/, ''),
      anonKey,
      accessToken: data.accessToken,
    });
    await bootstrapAccount(authedClient, data.user.id, name);
    console.log('\nAdmin account created successfully.');
  }

  console.log('\nAdd this to your .env (if not already present):');
  console.log('VITE_ADMIN_EMAILS=' + email);
  console.log('\nLog in at /login with', email, 'to access the admin panel.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
