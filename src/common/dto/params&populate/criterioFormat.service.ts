import {Injectable} from '@nestjs/common';

@Injectable()
export class CriterioService {
	private isFieldType(model: any, field: string, type: string): boolean {
		const schema = model.schema.paths;
		return schema[field] && schema[field].instance === type;
	}

	getPopulateFields(model: any, userPopulateFields: string[]): string[] {
		// Si 'all' no está en la lista, retornamos directamente los campos especificados
		if (!userPopulateFields.includes('all')) {
			return userPopulateFields;
		}
		// En caso de 'all', obtenemos todos los campos con referencia
		const modelSchema = model.schema.paths;
		const allPopulateFields = Object.keys(modelSchema).filter((field) => modelSchema[field].options && modelSchema[field].options.ref);

		return allPopulateFields;
	}

	criterioFormat(model: any, params: any): any {
		const filter = {...params};

		for (const [field, value] of Object.entries(params)) {
			if (this.isFieldType(model, field, 'Date')) {
				//Si el value tiene start o end, los formatea para hacer el query
				if (value && typeof value === 'object' && ('start' in value || 'end' in value)) {
					const startDate = (value as any).start ? new Date((value as any).start) : new Date();
					const endDate = (value as any).end ? new Date((value as any).end) : new Date();

					if ((value as any).start && (value as any).end) {
						filter[field] = {$gte: startDate, $lte: endDate};
					} else if ((value as any).start) {
						filter[field] = {$gte: startDate};
					} else if ((value as any).end) {
						filter[field] = {$lte: endDate};
					}
				}
				//si solo esta recibiendo una fecha en el campo, lo delimita a que la fecha que recibio es la fecha inicial, y la final es la actual
				else if (value && typeof value === 'string') {
					const date = new Date(value);
					filter[field] = {$gte: date, $lte: new Date()};
				}
				//eliminamos este campo mal formateado para los campos que son fechas
				else {
					delete filter[field];
				}
			}
		}
		return filter;
	}
}
