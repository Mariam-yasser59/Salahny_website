import mongoose from 'mongoose';
import { db, findById, nextId } from '../data/mockData.js';

const isMongoReady = () => mongoose.connection.readyState === 1 && mongoose.connection.db;
const collection = (name) => mongoose.connection.db.collection(name);
const objectId = (id) => (mongoose.Types.ObjectId.isValid(String(id)) ? new mongoose.Types.ObjectId(String(id)) : null);

const byIdQuery = (id) => {
  const oid = objectId(id);
  return { $or: [{ id }, ...(oid ? [{ _id: oid }] : [])] };
};

const normalizeId = (item) => {
  if (!item) return item;
  return { ...item, id: item.id || item._id?.toString() };
};

const normalizeSlot = (slot) => {
  const value = typeof slot === 'string'
    ? slot
    : slot?.value || slot?.slot || slot?.datetime || slot?.startTime || slot?.start || (slot?.date && slot?.time ? `${slot.date}T${slot.time}:00.000Z` : '');
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toISOString();
};

const activeBookingStatuses = ['pending', 'accepted', 'in_progress', 'diagnostics_ready', 'repair_in_progress'];

export const toPublicSlot = (slot) => {
  const value = normalizeSlot(slot);
  return value ? { id: value, value, date: value.slice(0, 10), time: value.slice(11, 16), booked: false } : null;
};

export const availableSlotValues = (workshop, bookings = []) => {
  const bookedSlots = new Set(
    bookings
      .filter((booking) => activeBookingStatuses.includes(booking.status) || !['cancelled', 'rejected'].includes(booking.status))
      .map((booking) => normalizeSlot(booking.slot || booking.date))
      .filter(Boolean)
  );

  return [...new Set((workshop?.availableSlots || [])
    .map(normalizeSlot)
    .filter((slot) => slot && new Date(slot).getTime() > Date.now() && !bookedSlots.has(slot)))]
    .sort();
};

export const listServices = async () => {
  if (!isMongoReady()) return db.services;
  const items = await collection('services').find({}).toArray();
  return items.map(normalizeId);
};

export const findService = async (id) => {
  if (!isMongoReady()) return findById('services', id);
  const item = await collection('services').findOne(byIdQuery(id));
  return normalizeId(item);
};

export const listWorkshops = async () => {
  if (!isMongoReady()) return db.workshops;
  const [workshops, bookings] = await Promise.all([
    collection('workshops').find({}).toArray(),
    collection('bookings').find({}).toArray()
  ]);
  return workshops.map((workshop) => {
    const normalized = normalizeId(workshop);
    return {
      ...normalized,
      availableSlots: availableSlotValues(normalized, bookings.filter((booking) => String(booking.workshopId || booking.workshop || booking.workshopRef) === String(normalized.id || normalized._id)))
    };
  });
};

export const findWorkshopById = async (id) => {
  if (!isMongoReady()) return findById('workshops', id);
  const item = await collection('workshops').findOne(byIdQuery(id));
  return normalizeId(item);
};

export const findWorkshopByUser = async (userId) => {
  if (!isMongoReady()) return db.workshops.find((workshop) => workshop.userId === userId) || db.workshops[0];
  const oid = objectId(userId);
  const item = await collection('workshops').findOne({
    $or: [
      { userId },
      { ownerId: userId },
      { owner: userId },
      { user: userId },
      ...(oid ? [{ userId: oid }, { ownerId: oid }, { owner: oid }, { user: oid }] : [])
    ]
  });
  return normalizeId(item) || db.workshops.find((workshop) => workshop.userId === userId) || db.workshops[0];
};

export const listBookings = async (filter = {}) => {
  if (!isMongoReady()) {
    return db.bookings.filter((booking) => Object.entries(filter).every(([key, value]) => String(booking[key]) === String(value)));
  }
  const mongoFilter = {};
  Object.entries(filter).forEach(([key, value]) => {
    const oid = objectId(value);
    const fields = key === 'workshopId' ? ['workshopId', 'workshop', 'workshopRef'] : key === 'driverId' ? ['driverId', 'driver', 'user', 'userId'] : [key];
    mongoFilter.$and = mongoFilter.$and || [];
    mongoFilter.$and.push({
      $or: fields.flatMap((field) => [{ [field]: value }, ...(oid ? [{ [field]: oid }] : [])])
    });
  });
  const items = await collection('bookings').find(mongoFilter).toArray();
  return items.map(normalizeId);
};

export const listEmergencyRequests = async () => {
  if (!isMongoReady()) return db.emergencyRequests;
  const items = await collection('emergencyrequests').find({}).toArray();
  return items.map(normalizeId);
};

export const listEarnings = async (workshopId) => {
  if (!isMongoReady()) return db.earnings.filter((earning) => String(earning.workshopId) === String(workshopId));
  const oid = objectId(workshopId);
  const items = await collection('earnings').find({ $or: [{ workshopId }, { workshop: workshopId }, ...(oid ? [{ workshopId: oid }, { workshop: oid }] : [])] }).toArray();
  return items.map(normalizeId);
};

export const saveWorkshopSlots = async (workshop, slots) => {
  const normalizedSlots = [...new Set(slots.map(normalizeSlot).filter((slot) => slot && new Date(slot).getTime() > Date.now()))].sort();

  if (!isMongoReady()) {
    workshop.availableSlots = normalizedSlots;
    return normalizedSlots;
  }

  await collection('workshops').updateOne(byIdQuery(workshop.id || workshop._id), { $set: { availableSlots: normalizedSlots, updatedAt: new Date() } });
  return normalizedSlots;
};

export const consumeWorkshopSlot = async (workshop, slot) => {
  const normalizedSlot = normalizeSlot(slot);
  if (!normalizedSlot) return { ok: false, message: 'Selected workshop slot is invalid' };

  if (!isMongoReady()) {
    const alreadyBooked = db.bookings.some((booking) => String(booking.workshopId) === String(workshop.id) && normalizeSlot(booking.slot) === normalizedSlot && !['cancelled', 'rejected'].includes(booking.status));
    if (alreadyBooked) return { ok: false, message: 'This workshop slot is no longer available' };
    if (!workshop.availableSlots?.map(normalizeSlot).includes(normalizedSlot)) return { ok: false, message: 'Selected workshop slot is not available' };
    workshop.availableSlots = workshop.availableSlots.filter((item) => normalizeSlot(item) !== normalizedSlot);
    return { ok: true, slot: normalizedSlot };
  }

  const activeConflict = await collection('bookings').findOne({
    $and: [
      { $or: [{ workshopId: workshop.id }, { workshopId: workshop._id }, { workshop: workshop.id }, { workshop: workshop._id }] },
      { slot: normalizedSlot },
      { status: { $nin: ['cancelled', 'rejected'] } }
    ]
  });
  if (activeConflict) return { ok: false, message: 'This workshop slot is no longer available' };

  const result = await collection('workshops').updateOne(
    { ...byIdQuery(workshop.id || workshop._id), availableSlots: normalizedSlot },
    { $pull: { availableSlots: normalizedSlot }, $set: { updatedAt: new Date() } }
  );

  if (!result.modifiedCount) return { ok: false, message: 'Selected workshop slot is not available' };
  return { ok: true, slot: normalizedSlot };
};

export const insertBooking = async (booking) => {
  if (!isMongoReady()) {
    db.bookings.unshift(booking);
    return booking;
  }
  const document = { ...booking, createdAt: new Date() };
  await collection('bookings').insertOne(document);
  return normalizeId(document);
};

export const findBookingForWorkshop = async (bookingId, workshop) => {
  if (!isMongoReady()) return db.bookings.find((item) => item.id === bookingId && String(item.workshopId) === String(workshop.id));
  const workshopOid = objectId(workshop.id || workshop._id);
  const booking = await collection('bookings').findOne({
    $and: [
      byIdQuery(bookingId),
      { $or: [{ workshopId: workshop.id }, { workshop: workshop.id }, { workshopRef: workshop.id }, ...(workshopOid ? [{ workshopId: workshopOid }, { workshop: workshopOid }, { workshopRef: workshopOid }] : [])] }
    ]
  });
  return normalizeId(booking);
};

export const saveBookingPatch = async (bookingId, patch) => {
  if (!isMongoReady()) {
    const booking = db.bookings.find((item) => item.id === bookingId);
    if (booking) Object.assign(booking, patch);
    return booking;
  }
  await collection('bookings').updateOne(byIdQuery(bookingId), { $set: { ...patch, updatedAt: new Date() } });
  return normalizeId(await collection('bookings').findOne(byIdQuery(bookingId)));
};

export const createEarningForBooking = async (booking) => {
  if (!booking || !(booking.workshopId || booking.workshop)) return null;
  if (!isMongoReady()) {
    if (db.earnings.some((earning) => earning.bookingId === booking.id)) return null;
    const earning = { id: nextId('e', 'earnings'), workshopId: booking.workshopId, bookingId: booking.id, driverId: booking.driverId, amount: booking.price || 0, status: 'available', createdAt: new Date().toISOString() };
    db.earnings.unshift(earning);
    return earning;
  }
  const existing = await collection('earnings').findOne({ bookingId: booking.id || booking._id?.toString() });
  if (existing) return normalizeId(existing);
  const earning = { workshopId: booking.workshopId || booking.workshop, bookingId: booking.id || booking._id?.toString(), driverId: booking.driverId || booking.driver, amount: booking.price || booking.total || 0, status: 'available', createdAt: new Date() };
  await collection('earnings').insertOne(earning);
  return normalizeId(earning);
};

export const createMockBooking = (payload) => ({ id: nextId('b', 'bookings'), ...payload });

export const usingMongo = isMongoReady;
