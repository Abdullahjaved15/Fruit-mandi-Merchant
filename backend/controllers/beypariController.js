import Beypari from '../models/Beypari.js';

// @desc    Get all beyparis
// @route   GET /api/beyparis
export const getBeyparis = async (req, res) => {
    try {
        const beyparis = await Beypari.find({});
        res.json(beyparis);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a new beypari
// @route   POST /api/beyparis
export const createBeypari = async (req, res) => {
    try {
        let payload = { ...req.body };
        if (!payload.partnerId || String(payload.partnerId).trim() === '') {
            const count = await Beypari.countDocuments();
            payload.partnerId = `B-${1020 + count + 1}`;
        }
        const beypari = await Beypari.create(payload);
        res.status(201).json(beypari);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update an existing beypari
// @route   PUT /api/beyparis/:id
export const updateBeypari = async (req, res) => {
    try {
        const beypari = await Beypari.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (beypari) {
            res.json(beypari);
        } else {
            res.status(404).json({ message: 'Beypari not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete a beypari
// @route   DELETE /api/beyparis/:id
export const deleteBeypari = async (req, res) => {
    try {
        const beypari = await Beypari.findByIdAndDelete(req.params.id);
        if (beypari) {
            res.json({ message: 'Beypari removed' });
        } else {
            res.status(404).json({ message: 'Beypari not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
