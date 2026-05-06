import mongoose from 'mongoose';

const fruitTypeSchema = mongoose.Schema(
  {},
  {
    timestamps: true,
    strict: false,
    collection: 'Fruit_Types',
  }
);

const FruitType = mongoose.model('FruitType', fruitTypeSchema);
export default FruitType;

