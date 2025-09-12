class Metadata {
    constructor(data = {}) {
        this.source = data.source || '';
        this.user_agent = data.user_agent || '';
        this.ip_address = data.ip_address || '';
        this.version = data.version || '';
    }

    static fromPayload(metadataData) {
        return new Metadata({
            source: metadataData.source,
            user_agent: metadataData.user_agent,
            ip_address: metadataData.ip_address,
            version: metadataData.version
        });
    }

    toJSON() {
        return {
            source: this.source,
            user_agent: this.user_agent,
            ip_address: this.ip_address,
            version: this.version
        };
    }

    validate() {
        const errors = [];
        const validSources = ['website', 'mobile_app', 'api', 'phone', 'email', 'travel_agency'];
        
        if (!this.source) {
            errors.push('Metadata source is required');
        } else if (!validSources.includes(this.source)) {
            errors.push(`Invalid source. Valid sources: ${validSources.join(', ')}`);
        }
        
        if (!this.user_agent) {
            errors.push('User agent is required');
        }
        
        if (!this.ip_address) {
            errors.push('IP address is required');
        } else if (!this.isValidIP(this.ip_address)) {
            errors.push('Invalid IP address format');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    isValidIP(ip) {
        const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
        const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
        return ipv4Regex.test(ip) || ipv6Regex.test(ip);
    }
}

module.exports = Metadata;
