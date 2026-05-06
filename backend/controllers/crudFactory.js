// Generic CRUD controller factory for simple collections
// Keeps implementation consistent across modules.

export const makeCrudControllers = (Model) => {
  const list = async (req, res) => {
    try {
      const items = await Model.find({}).sort({ createdAt: -1 });
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

  const create = async (req, res) => {
    try {
      const item = await Model.create(req.body);
      res.status(201).json(item);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  };

  const getById = async (req, res) => {
    try {
      const item = await Model.findById(req.params.id);
      if (!item) return res.status(404).json({ message: 'Item not found' });
      res.json(item);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

  const updateById = async (req, res) => {
    try {
      const item = await Model.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!item) return res.status(404).json({ message: 'Item not found' });
      res.json(item);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

  const deleteById = async (req, res) => {
    try {
      const item = await Model.findByIdAndDelete(req.params.id);
      if (!item) return res.status(404).json({ message: 'Item not found' });
      res.json({ message: 'Item removed' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

  return { list, create, getById, updateById, deleteById };
};

