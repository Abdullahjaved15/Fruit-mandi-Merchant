import Customer from '../models/Customer.js';

export const getCustomers = async (req, res) => {
    try {
        const customers = await Customer.find({});
        res.json(customers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createCustomer = async (req, res) => {
    try {
        const customer = await Customer.create(req.body);
        res.status(201).json(customer);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const updateCustomerPayment = async (req, res) => {
    try {
        let customer = await Customer.findById(req.params.id);
        if (!customer) {
            customer = await Customer.findOne({ customerId: req.params.id });
        }
        
        if (customer) {
            customer.udhaarRaw = req.body.udhaarRaw;
            customer.udhaar = req.body.udhaar;
            customer.udhaarPercent = req.body.udhaarPercent;
            customer.udhaarType = req.body.udhaarType;
            const updatedCustomer = await customer.save();
            res.json(updatedCustomer);
        } else {
            res.status(404).json({ message: 'Customer not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
export const deleteCustomer = async (req, res) => {
    try {
        const customer = await Customer.findByIdAndDelete(req.params.id);
        if (customer) {
            res.json({ message: 'Customer removed' });
        } else {
            res.status(404).json({ message: 'Customer not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
