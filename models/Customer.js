class Customer {
    constructor(data = {}) {
        this.id = data.id || null;
        this.name = data.name || '';
        this.email = data.email || '';
        this.document = data.document || '';
        this.phone = data.phone || '';
        this.country = data.country || '';
        this.loyalty_tier = data.loyalty_tier || null;
    }

    static fromPayload(customerData) {
        return new Customer({
            id: customerData.id,
            name: customerData.name,
            email: customerData.email,
            document: customerData.document,
            phone: customerData.phone,
            country: customerData.country,
            loyalty_tier: customerData.loyalty_tier
        });
    }

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            email: this.email,
            document: this.document,
            phone: this.phone,
            country: this.country,
            loyalty_tier: this.loyalty_tier
        };
    }

    validate() {
        const errors = [];
        
        if (!this.id) {
            errors.push('Customer ID is required');
        }
        
        if (!this.name) {
            errors.push('Customer name is required');
        }
        
        if (!this.email) {
            errors.push('Customer email is required');
        }
        
        if (!this.document) {
            errors.push('Customer document is required');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }
}

module.exports = Customer;
