const schedulesByPeriod = {
	Manhã: ['07:00 - 08:50', '09:10 - 11:00'],
	Tarde: ['12:00 - 13:50', '14:10 - 16:00'],
	Noite: ['18:30 - 20:10', '20:20 - 22:00'],
	Integral: ['07:00 - 08:50', '09:10 - 11:00', '12:00 - 13:50', '14:10 - 16:00']
};

const weekdays = ['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];

function parsePositiveInteger(value, label) {
	const parsed = Number(value);
	if (!Number.isSafeInteger(parsed) || parsed <= 0) {
		throw new Error(`${label} deve ser um identificador inteiro válido.`);
	}
	return parsed;
}

function validateAlocacao(input = {}) {
	const values = input && typeof input === 'object' ? input : {};
	const ambienteId = parsePositiveInteger(values.ambienteId, 'Ambiente');
	const aulaId = parsePositiveInteger(values.aulaId, 'Aula');
	const diaSemana = String(values.diaSemana || '').trim();
	const periodo = String(values.periodo || '').trim();
	const horario = String(values.horario || '').trim();

	if (!weekdays.includes(diaSemana)) {
		throw new Error('Selecione um dia da semana válido.');
	}
	if (!Object.prototype.hasOwnProperty.call(schedulesByPeriod, periodo)) {
		throw new Error('Selecione um período válido.');
	}
	if (!schedulesByPeriod[periodo].includes(horario)) {
		throw new Error('Selecione um horário válido para o período informado.');
	}

	return { ambienteId, aulaId, diaSemana, periodo, horario };
}

module.exports = {
	validateAlocacao
};
