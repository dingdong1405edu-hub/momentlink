import prisma from "@/lib/prisma";

export interface LogAuditOptions {
  actorId?: string | null;
  actorRole?: string;
  action: string;
  resourceType: string;
  resourceId: string;
  beforeSummary?: unknown;
  afterSummary?: unknown;
  reason?: string;
  ipHash?: string;
}

export async function logAudit(options: LogAuditOptions) {
  try {
    return await prisma.auditLog.create({
      data: {
        actorId: options.actorId || null,
        actorRole: options.actorRole || "SYSTEM",
        action: options.action,
        resourceType: options.resourceType,
        resourceId: options.resourceId,
        beforeSummary: options.beforeSummary ? JSON.stringify(options.beforeSummary) : null,
        afterSummary: options.afterSummary ? JSON.stringify(options.afterSummary) : null,
        reason: options.reason || null,
        ipHash: options.ipHash || null,
      },
    });
  } catch (err) {
    console.error("Audit log failed to write:", err);
  }
}

