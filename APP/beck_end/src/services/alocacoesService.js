const supabase = require('../config/supabase');
const createAlocacoesService = require('./alocacoesServiceFactory');

module.exports = createAlocacoesService(supabase);
