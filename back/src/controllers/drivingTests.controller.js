import DrivingTest from '../models/DrivingTest.js';

export const listDrivingTests = async (req, res) => {
  const { personId='', branchId='' } = req.query;
  const f = {};
  if (personId) f.personId = personId;
  if (branchId) f.branchId = branchId;
  res.json({ items: await DrivingTest.find(f).sort({ createdAt: -1 }).limit(500) });
};

export const getDrivingTest = async (req, res) => {
  const item = await DrivingTest.findById(req.params.id);
  if (!item) return res.status(404).json({ message: 'Prueba no encontrada' });
  res.json({ item });
};

export const startDrivingTest = async (req, res) => {
  const item = await DrivingTest.create({
    ...req.body,
    status: 'IN_PROGRESS',
    startedAt: req.body.startedAt ? new Date(req.body.startedAt) : new Date(),
  });
  res.status(201).json({ item });
};

export const finishDrivingTest = async (req, res) => {
  const item = await DrivingTest.findById(req.params.id);
  if (!item) return res.status(404).json({ message: 'Prueba no encontrada' });

  Object.assign(item, req.body, {
    status: 'COMPLETED',
    endedAt: req.body.endedAt ? new Date(req.body.endedAt) : new Date(),
  });

  await item.save();
  res.json({ item });
};

export const deleteDrivingTest = async (req, res) => {
  const item = await DrivingTest.findByIdAndDelete(req.params.id);
  if (!item) return res.status(404).json({ message: 'Prueba no encontrada' });
  res.json({ ok: true });
};
