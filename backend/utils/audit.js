const AuditLog = require("../models/AuditLog");

const logAudit = async ({ actor, action, targetType, targetId, details }) => {
  try {
    await AuditLog.create({
      actor,
      action,
      targetType: targetType || "system",
      targetId: targetId ? String(targetId) : "",
      details: details || {}
    });
  } catch (error) {
    console.error("Audit log error:", error.message);
  }
};

module.exports = { logAudit };
