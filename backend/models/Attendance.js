import mongoose from 'mongoose';

// Flexible schema: you can evolve fields from UI without migrations.
const attendanceSchema = mongoose.Schema(
  {},
  {
    timestamps: true,
    strict: false,
    collection: 'Attendance',
  }
);

const Attendance = mongoose.model('Attendance', attendanceSchema);
export default Attendance;

