// back/templates/resource.model.template.js
// -----------------------------------------------------------------------------
// FleetCore Standard v1.0 - Mongoose model template
// -----------------------------------------------------------------------------
import mongoose from "mongoose";

const Schema = new mongoose.Schema(
  {
    // TODO: campos
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("<Resource>", Schema);
