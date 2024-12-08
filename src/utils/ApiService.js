import { STATIC_OPERATORS } from './operators';

class ApiService {
    constructor() {
        this.API_URL = '/v1/modules/3/operators';
        this.options = {
            method: 'GET',
            headers: {
                'accept': 'application/json'
            }
        };
    }

    async fetchOperators() {
        try {
            const response = await fetch(this.API_URL, this.options);
            if (!response.ok) {
                console.log('Falling back to static data');
                return STATIC_OPERATORS.data;
            }
            return await response.json();
        } catch (error) {
            console.log('Error fetching operators, using static data:', error);
            return STATIC_OPERATORS.data;
        }
    }
}

export default new ApiService();
