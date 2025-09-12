const { Category } = require('./Category');

class Room {
    constructor(data = {}) {
        this.id = data.id || null;
        this.room_number = data.room_number || '';
        this.daily_rate = data.daily_rate || 0;
        this.number_of_days = data.number_of_days || 0;
        this.checkin_date = data.checkin_date || '';
        this.checkout_date = data.checkout_date || '';
        this.category = data.category instanceof Category 
            ? data.category 
            : new Category(data.category || {});
        this.status = data.status || '';
        this.guests = data.guests || 0;
        this.breakfast_included = data.breakfast_included || false;
    }

    static fromPayload(roomData) {
        return new Room({
            id: roomData.id,
            room_number: roomData.room_number,
            daily_rate: roomData.daily_rate,
            number_of_days: roomData.number_of_days,
            checkin_date: roomData.checkin_date,
            checkout_date: roomData.checkout_date,
            category: roomData.category ? Category.fromPayload(roomData.category) : null,
            status: roomData.status,
            guests: roomData.guests,
            breakfast_included: roomData.breakfast_included
        });
    }

    toJSON() {
        return {
            id: this.id,
            room_number: this.room_number,
            daily_rate: this.daily_rate,
            number_of_days: this.number_of_days,
            checkin_date: this.checkin_date,
            checkout_date: this.checkout_date,
            category: this.category ? this.category.toJSON() : null,
            status: this.status,
            guests: this.guests,
            breakfast_included: this.breakfast_included
        };
    }

    calculateTotalCost() {
        return this.daily_rate * this.number_of_days;
    }

    validate() {
        const errors = [];
        const validStatuses = ['confirmed', 'cancelled', 'no_show', 'pending'];
        
        if (!this.id) {
            errors.push('Room ID is required');
        }
        
        if (!this.room_number) {
            errors.push('Room number is required');
        }
        
        if (this.daily_rate <= 0) {
            errors.push('Daily rate must be greater than 0');
        }
        
        if (this.number_of_days <= 0) {
            errors.push('Number of days must be greater than 0');
        }
        
        if (!this.checkin_date) {
            errors.push('Check-in date is required');
        }
        
        if (!this.checkout_date) {
            errors.push('Check-out date is required');
        }
        
        if (!this.status) {
            errors.push('Room status is required');
        } else if (!validStatuses.includes(this.status)) {
            errors.push(`Invalid room status. Valid statuses: ${validStatuses.join(', ')}`);
        }
        
        if (this.guests <= 0) {
            errors.push('Number of guests must be greater than 0');
        }

        if (this.category) {
            const categoryValidation = this.category.validate();
            if (!categoryValidation.isValid) {
                errors.push(...categoryValidation.errors.map(error => `Category: ${error}`));
            }
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }
}

module.exports = Room;
