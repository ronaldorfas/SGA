const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const supabaseUrl = (process.env.SUPABASE_URL || '')
	.replace(/\/rest\/v1\/?$/, '')
	.replace(/\/+$/, '');
const supabaseAnonKey = (process.env.SUPABASE_ANON_KEY || '').trim();

if (!supabaseUrl || !supabaseAnonKey) {
	console.warn('⚠️ AVISO: SUPABASE_URL ou SUPABASE_ANON_KEY não configurados no .env');
}

const supabaseAuth = supabaseUrl && supabaseAnonKey
	? createClient(supabaseUrl, supabaseAnonKey, {
		auth: {
			autoRefreshToken: false,
			persistSession: false
		}
	})
	: null;

module.exports = supabaseAuth;
