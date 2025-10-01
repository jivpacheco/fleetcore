export default function auditSoftDelete(schema) {
  schema.add({
    createdBy: { type: schema.constructor.Types.ObjectId, ref: 'User' },
    updatedBy: { type: schema.constructor.Types.ObjectId, ref: 'User' },
    isDeleted: { type: Boolean, default: false, index: true }
  });
  schema.query.notDeleted = function() { return this.where({ isDeleted: false }); };
  schema.methods.softDelete = async function(userId) {
    this.isDeleted = true;
    this.updatedBy = userId;
    await this.save();
  };
}