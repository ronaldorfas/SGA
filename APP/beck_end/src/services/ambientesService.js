const supabase = require('../config/supabase');

async function listAmbientes() {
	if (!supabase) throw new Error('Supabase não configurado.');

	const { data, error } = await supabase
		.from('ambientes')
		.select('id, nome, tipo, local, capacidade, status')
		.order('id');

	if (error) throw error;

	return (data || []).map((row) => ({
		...row,
		codigo: row.tipo || `AMB-${row.id}`
	}));
}

async function listPublicAmbientes() {
	if (!supabase) throw new Error('Supabase não configurado.');

	const { data, error } = await supabase
		.from('ambientes')
		.select('id, codigo, nome')
		.order('nome');

	if (error) throw error;
	return data || [];
}

module.exports = {
	listAmbientes,
	listPublicAmbientes
};
