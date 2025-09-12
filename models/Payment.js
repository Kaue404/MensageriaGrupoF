class Payment {
    constructor(data = {}) {
        this.method = data.method || '';
        this.status = data.status || '';
        this.transaction_id = data.transaction_id || '';
        this.amount = data.amount || 0;
    }

    static fromPayload(paymentData) {
        return new Payment({
            method: paymentData.method,
            status: paymentData.status,
            transaction_id: paymentData.transaction_id,
            amount: paymentData.amount
        });
    }

    toJSON() {
        return {
            method: this.method,
            status: this.status,
            transaction_id: this.transaction_id,
            amount: this.amount
        };
    }

    validate() {
        const errors = [];
        const validMethods = ['credit_card', 'debit_card', 'pix', 'bank_transfer', 'cash'];
        const validStatuses = ['pending', 'approved', 'declined', 'cancelled', 'refunded', 'processing'];
        
        if (!this.method) {
            errors.push('Payment method is required');
        } else if (!validMethods.includes(this.method)) {
            errors.push(`Invalid payment method. Valid methods: ${validMethods.join(', ')}`);
        }
        
        if (!this.status) {
            errors.push('Payment status is required');
        } else if (!validStatuses.includes(this.status)) {
            errors.push(`Invalid payment status. Valid statuses: ${validStatuses.join(', ')}`);
        }
        
        if (!this.transaction_id) {
            errors.push('Transaction ID is required');
        }

        if (this.amount !== undefined && this.amount < 0) {
            errors.push('Payment amount must be greater than or equal to 0');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    isApproved() {
        return this.status === 'approved';
    }

    isPending() {
        return this.status === 'pending';
    }

    isDeclined() {
        return this.status === 'declined';
    }
}

module.exports = Payment;
