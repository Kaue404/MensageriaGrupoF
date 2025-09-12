class Hotel {
    constructor(data = {}) {
        this.id = data.id || null;
        this.name = data.name || '';
        this.city = data.city || '';
        this.state = data.state || '';
    }

    static fromPayload(hotelData) {
        return new Hotel({
            id: hotelData.id,
            name: hotelData.name,
            city: hotelData.city,
            state: hotelData.state
        });
    }

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            city: this.city,
            state: this.state
        };
    }

    validate() {
        const errors = [];
        
        if (!this.id) {
            errors.push('Hotel ID is required');
        }
        
        if (!this.name) {
            errors.push('Hotel name is required');
        }
        
        if (!this.city) {
            errors.push('Hotel city is required');
        }
        
        if (!this.state) {
            errors.push('Hotel state is required');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }
}

module.exports = Hotel;
