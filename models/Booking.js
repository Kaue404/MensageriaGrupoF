const Customer = require('./Customer');
const Hotel = require('./Hotel');
const Room = require('./Room');
const Payment = require('./Payment');
const Metadata = require('./Metadata');

class Booking {
    constructor(data = {}) {
        this.uuid = data.uuid || '';
        this.created_at = data.created_at || new Date().toISOString();
        this.type = data.type || '';
        this.reservation_status = data.reservation_status || '';
        this.total_amount = data.total_amount || 0;
        this.currency = data.currency || '';
        this.updated_at = data.updated_at || '';
        this.customer = data.customer instanceof Customer 
            ? data.customer 
            : new Customer(data.customer || {});
        this.hotel = data.hotel instanceof Hotel 
            ? data.hotel 
            : new Hotel(data.hotel || {});
        this.rooms = Array.isArray(data.rooms) 
            ? data.rooms.map(room => room instanceof Room ? room : Room.fromPayload(room))
            : [];
        this.payment = data.payment instanceof Payment 
            ? data.payment 
            : new Payment(data.payment || {});
        this.metadata = data.metadata instanceof Metadata 
            ? data.metadata 
            : new Metadata(data.metadata || {});
    }

    static fromPayload(payload) {
        return new Booking({
            uuid: payload.uuid,
            created_at: payload.created_at,
            type: payload.type,
            reservation_status: payload.reservation_status,
            total_amount: payload.total_amount,
            currency: payload.currency,
            updated_at: payload.updated_at,
            customer: payload.customer ? Customer.fromPayload(payload.customer) : null,
            hotel: payload.hotel ? Hotel.fromPayload(payload.hotel) : null,
            rooms: payload.rooms ? payload.rooms.map(room => Room.fromPayload(room)) : [],
            payment: payload.payment ? Payment.fromPayload(payload.payment) : null,
            metadata: payload.metadata ? Metadata.fromPayload(payload.metadata) : null
        });
    }

    toJSON() {
        return {
            uuid: this.uuid,
            created_at: this.created_at,
            type: this.type,
            reservation_status: this.reservation_status,
            total_amount: this.total_amount,
            currency: this.currency,
            updated_at: this.updated_at,
            customer: this.customer ? this.customer.toJSON() : null,
            hotel: this.hotel ? this.hotel.toJSON() : null,
            rooms: this.rooms.map(room => room.toJSON()),
            payment: this.payment ? this.payment.toJSON() : null,
            metadata: this.metadata ? this.metadata.toJSON() : null
        };
    }

    calculateTotalCost() {
        return this.rooms.reduce((total, room) => total + room.calculateTotalCost(), 0);
    }

    getTotalGuests() {
        return this.rooms.reduce((total, room) => total + room.guests, 0);
    }

    getTotalRooms() {
        return this.rooms.length;
    }

    isConfirmed() {
        return this.rooms.every(room => room.status === 'confirmed');
    }

    validate() {
        const errors = [];
        const validTypes = ['AB', 'CD', 'EF', 'GH', 'IJ', 'KL', 'MN', 'OP', 'QR', 'ST', 'UV', 'WX', 'YZ'];
        const validReservationStatuses = ['pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled'];
        const validCurrencies = ['BRL', 'USD', 'EUR'];
        
        if (!this.uuid) {
            errors.push('Booking UUID is required');
        }
        
        if (!this.created_at) {
            errors.push('Created at date is required');
        }
        
        if (!this.type) {
            errors.push('Booking type is required');
        } else if (!validTypes.includes(this.type)) {
            errors.push(`Invalid booking type. Valid types: ${validTypes.join(', ')}`);
        }

        if (!this.reservation_status) {
            errors.push('Reservation status is required');
        } else if (!validReservationStatuses.includes(this.reservation_status)) {
            errors.push(`Invalid reservation status. Valid statuses: ${validReservationStatuses.join(', ')}`);
        }

        if (this.total_amount !== undefined && this.total_amount < 0) {
            errors.push('Total amount must be greater than or equal to 0');
        }

        if (this.currency && !validCurrencies.includes(this.currency)) {
            errors.push(`Invalid currency. Valid currencies: ${validCurrencies.join(', ')}`);
        }

        if (this.customer) {
            const customerValidation = this.customer.validate();
            if (!customerValidation.isValid) {
                errors.push(...customerValidation.errors.map(error => `Customer: ${error}`));
            }
        } else {
            errors.push('Customer information is required');
        }

        if (this.hotel) {
            const hotelValidation = this.hotel.validate();
            if (!hotelValidation.isValid) {
                errors.push(...hotelValidation.errors.map(error => `Hotel: ${error}`));
            }
        } else {
            errors.push('Hotel information is required');
        }

        if (this.rooms.length === 0) {
            errors.push('At least one room is required');
        } else {
            this.rooms.forEach((room, index) => {
                const roomValidation = room.validate();
                if (!roomValidation.isValid) {
                    errors.push(...roomValidation.errors.map(error => `Room ${index + 1}: ${error}`));
                }
            });
        }

        if (this.payment) {
            const paymentValidation = this.payment.validate();
            if (!paymentValidation.isValid) {
                errors.push(...paymentValidation.errors.map(error => `Payment: ${error}`));
            }
        } else {
            errors.push('Payment information is required');
        }

        if (this.metadata) {
            const metadataValidation = this.metadata.validate();
            if (!metadataValidation.isValid) {
                errors.push(...metadataValidation.errors.map(error => `Metadata: ${error}`));
            }
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }
}

module.exports = Booking;
