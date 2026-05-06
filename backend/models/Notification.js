import mongoose from 'mongoose';

const notificationSchema = mongoose.Schema(
  {},
  {
    timestamps: true,
    strict: false,
    collection: 'Notification',
  }
);

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;

