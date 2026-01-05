import License from '../models/License.js';
import Person from '../models/Person.js';

export const listLicenses = async (req, res) => {
  const { personId='' } = req.query;
  const f = {};
  if (personId) f.personId = personId;
  res.json({ items: await License.find(f).sort({ createdAt: -1 }) });
};

export const createLicense = async (req, res) => {
  const item = await License.create(req.body);

  // espejo opcional al subdoc en Person (Sprint 1)
  if (req.body.personId) {
    await Person.findByIdAndUpdate(req.body.personId, { $push: { licenses: {
      number: req.body.number, type: req.body.type, issuer: req.body.issuer,
      issuedAt: req.body.issuedAt, expiresAt: req.body.expiresAt, notes: req.body.notes,
      active: req.body.active ?? true,
    } } });
  }

  res.status(201).json({ item });
};

export const updateLicense = async (req, res) => {
  const item = await License.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!item) return res.status(404).json({ message: 'Licencia no encontrada' });
  res.json({ item });
};

export const deleteLicense = async (req, res) => {
  const item = await License.findByIdAndDelete(req.params.id);
  if (!item) return res.status(404).json({ message: 'Licencia no encontrada' });
  res.json({ ok: true });
};
