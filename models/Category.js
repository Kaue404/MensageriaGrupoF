class SubCategory {
    constructor(data = {}) {
        this.id = data.id || '';
        this.name = data.name || '';
    }

    static fromPayload(subCategoryData) {
        return new SubCategory({
            id: subCategoryData.id,
            name: subCategoryData.name
        });
    }

    toJSON() {
        return {
            id: this.id,
            name: this.name
        };
    }

    validate() {
        const errors = [];
        
        if (!this.id) {
            errors.push('SubCategory ID is required');
        }
        
        if (!this.name) {
            errors.push('SubCategory name is required');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }
}

class Category {
    constructor(data = {}) {
        this.id = data.id || '';
        this.name = data.name || '';
        this.sub_category = data.sub_category instanceof SubCategory 
            ? data.sub_category 
            : new SubCategory(data.sub_category || {});
    }

    static fromPayload(categoryData) {
        return new Category({
            id: categoryData.id,
            name: categoryData.name,
            sub_category: categoryData.sub_category 
                ? SubCategory.fromPayload(categoryData.sub_category)
                : null
        });
    }

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            sub_category: this.sub_category ? this.sub_category.toJSON() : null
        };
    }

    validate() {
        const errors = [];
        
        if (!this.id) {
            errors.push('Category ID is required');
        }
        
        if (!this.name) {
            errors.push('Category name is required');
        }

        if (this.sub_category) {
            const subCategoryValidation = this.sub_category.validate();
            if (!subCategoryValidation.isValid) {
                errors.push(...subCategoryValidation.errors.map(error => `SubCategory: ${error}`));
            }
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }
}

module.exports = { Category, SubCategory };
