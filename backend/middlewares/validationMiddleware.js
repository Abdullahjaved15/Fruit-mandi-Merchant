import Joi from 'joi';

export const validateRequest = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body, { abortEarly: false });
        if (error) {
            const errorMessages = error.details.map(detail => detail.message);
            return res.status(400).json({ 
                success: false, 
                message: "Validation Error", 
                errors: errorMessages 
            });
        }
        next();
    };
};

// Validation Schemas
export const schemas = {
    // Inventory Validation
    inventory: Joi.object({
        name: Joi.string().required().min(3).max(50),
        sku: Joi.string().allow('', null).uppercase(),
        stock: Joi.number().required().min(0),
        price: Joi.number().required().min(0),
        category: Joi.string().required(),
        unit: Joi.string().required(),
        img: Joi.string().allow('', null),
        health: Joi.string().allow('', null),
        status: Joi.string().allow('', null),
        isSoldInShop: Joi.boolean(),
        beypariId: Joi.string().allow('', null),
        beypariName: Joi.string().allow('', null)
    }),

    // Auth Validation (Registration)
    register: Joi.object({
        username: Joi.string().required().min(3).alphanum(),
        email: Joi.string().required().email(),
        password: Joi.string().required().min(6),
        phone: Joi.string().required().min(7).max(20).trim(),
        role: Joi.string().valid('user', 'admin')
    }),

    // Ledger Validation
    ledger: Joi.object({
        party: Joi.string().required(),
        amountRaw: Joi.number().required().min(1),
        desc: Joi.string().required(),
        type: Joi.string().valid('income', 'expense').required(),
        date: Joi.string().allow('', null),
        transactionId: Joi.string().allow('', null)
    }),

    consignment: Joi.object({
        beypari: Joi.string().required(),
        productName: Joi.string().required(),
        unit: Joi.string().default('crate'),
        quantityReceived: Joi.number().required().min(1),
        minimumTargetAmount: Joi.number().required().min(0),
        fuelCost: Joi.number().min(0).default(0),
        arrivalDate: Joi.date().allow('', null),
        notes: Joi.string().allow('', null),
    }),

    shopSale: Joi.object({
        saleDate: Joi.date().allow('', null),
        consignment: Joi.string().allow('', null),
        beypari: Joi.string().allow('', null),
        inventoryItem: Joi.string().allow('', null),
        customer: Joi.string().allow('', null),
        customerName: Joi.string().allow('', null),
        productName: Joi.string().allow('', null),
        quantity: Joi.number().required().min(0.01),
        ratePerUnit: Joi.number().required().min(0),
        commissionRate: Joi.number().min(0).allow('', null),
        paymentMode: Joi.string().valid('spot', 'udhaar', 'mixed').required(),
        spotAmount: Joi.number().min(0),
        udhaarAmount: Joi.number().min(0),
        copybookStaff: Joi.string().required(),
    }),

    settlement: Joi.object({
        consignment: Joi.string().required(),
        commissionAmount: Joi.number().min(0).default(0),
        fuelCost: Joi.number().min(0),
        otherDeductions: Joi.number().min(0).default(0),
        notes: Joi.string().allow('', null),
    }),

    customerPayment: Joi.object({
        amount: Joi.number().required().min(1),
        copybookStaff: Joi.string().allow('', null),
        method: Joi.string().allow('', null),
        note: Joi.string().allow('', null),
    }),

    copybookEntry: Joi.object({
        copybookId: Joi.string().required(),
        type: Joi.string().valid('sale', 'payment', 'manual').default('manual'),
        customer: Joi.string().allow('', null),
        customerName: Joi.string().allow('', null),
        description: Joi.string().allow('', null),
        debit: Joi.number().min(0).default(0),
        credit: Joi.number().min(0).default(0),
        entryDate: Joi.date().allow('', null),
    }),
};
