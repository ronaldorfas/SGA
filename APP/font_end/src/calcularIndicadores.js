function normalizeStatus(value) {
	return String(value || '')
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.trim()
		.toLowerCase();
}

function calculateIndicators(allocations, suggestions) {
	if (!Array.isArray(allocations) || !Array.isArray(suggestions)) {
		throw new Error('Os dados recebidos para os indicadores devem ser listas.');
	}

	const allocationsByEnvironment = new Map();
	allocations.forEach((allocation) => {
		const key = allocation.ambienteId ?? allocation.ambienteCodigo ?? allocation.ambienteNome;
		const environmentKey = String(key ?? 'ambiente-nao-identificado');
		const current = allocationsByEnvironment.get(environmentKey) || {
			id: environmentKey,
			name: allocation.ambienteNome || allocation.ambienteCodigo || `Ambiente ${environmentKey}`,
			total: 0
		};
		current.total += 1;
		allocationsByEnvironment.set(environmentKey, current);
	});

	const mostUsedEnvironment = [...allocationsByEnvironment.values()]
		.sort((first, second) => second.total - first.total || first.name.localeCompare(second.name, 'pt-BR'))[0] || null;
	const completedSuggestions = suggestions.filter((suggestion) => ['concluida', 'finalizada'].includes(normalizeStatus(suggestion.status))).length;

	return {
		allocationConcentration: {
			totalAllocations: allocations.length,
			environmentCount: allocationsByEnvironment.size,
			leadingEnvironment: mostUsedEnvironment,
			percentage: allocations.length && mostUsedEnvironment
				? (mostUsedEnvironment.total / allocations.length) * 100
				: null
		},
		maintenanceCompletion: {
			totalSuggestions: suggestions.length,
			completedSuggestions,
			percentage: suggestions.length
				? (completedSuggestions / suggestions.length) * 100
				: null
		}
	};
}

module.exports = calculateIndicators;
