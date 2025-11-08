/**
 * @file audit.ts
 * @description Audit logging utilities for compliance (GDPR, COPPA, Privacy Act, CCPA)
 * @author System
 * @date 2025-11-08
 *
 * Tracks user actions and data access for security, compliance, and forensics.
 * All IP addresses and user agents are logged for audit trail.
 */

import { Request } from 'express';
import { hashIP, hashUserId } from './encryption';
import db from '../../database/connection';

/**
 * Standard audit actions
 * Extend this enum as needed for new actions
 */
export enum AuditAction {
  // Authentication
  USER_LOGIN = 'user.login',
  USER_LOGOUT = 'user.logout',
  USER_LOGIN_FAILED = 'user.login_failed',
  USER_REGISTER = 'user.register',
  USER_PASSWORD_RESET = 'user.password_reset',

  // User data operations
  USER_UPDATE = 'user.update',
  USER_DELETE = 'user.delete',
  USER_DATA_EXPORT = 'user.data_export',
  USER_VIEW_PROFILE = 'user.view_profile',

  // Content operations
  CONTENT_CREATE = 'content.create',
  CONTENT_UPDATE = 'content.update',
  CONTENT_DELETE = 'content.delete',
  CONTENT_PUBLISH = 'content.publish',
  CONTENT_DOWNLOAD = 'content.download',
  CONTENT_VIEW = 'content.view',

  // Purchase operations
  PURCHASE_ATTEMPT = 'purchase.attempt',
  PURCHASE_SUCCESS = 'purchase.success',
  PURCHASE_FAILED = 'purchase.failed',
  PURCHASE_REFUND = 'purchase.refund',

  // Admin operations
  ADMIN_APPROVE_TUTOR = 'admin.approve_tutor',
  ADMIN_REJECT_TUTOR = 'admin.reject_tutor',
  ADMIN_DELETE_USER = 'admin.delete_user',
  ADMIN_DELETE_CONTENT = 'admin.delete_content',
  ADMIN_MODERATE_CONTENT = 'admin.moderate_content',

  // Parental consent (COPPA)
  PARENTAL_CONSENT_GRANT = 'parental_consent.grant',
  PARENTAL_CONSENT_REVOKE = 'parental_consent.revoke',
  CHILD_ACCOUNT_CREATE = 'child_account.create',

  // Privacy & consent
  CONSENT_UPDATE = 'consent.update',
  PRIVACY_POLICY_VIEW = 'privacy_policy.view',
  TERMS_OF_SERVICE_VIEW = 'terms_of_service.view',

  // System events
  SYSTEM_ERROR = 'system.error',
  SYSTEM_SECURITY_ALERT = 'system.security_alert'
}

/**
 * Audit event structure
 */
export interface AuditEvent {
  userId?: number; // User performing the action (optional for anonymous events)
  action: AuditAction | string; // Action being performed
  resourceType?: string; // Type of resource affected (user, content, purchase, etc.)
  resourceId?: string; // ID of the affected resource
  metadata?: Record<string, any>; // Additional context
  req?: Request; // Express request object (for IP and user agent extraction)
  ipAddress?: string; // Manual IP override
  userAgent?: string; // Manual user agent override
}

/**
 * Log an audit event to the database
 *
 * @param event - The audit event to log
 * @returns Promise resolving to the audit log ID
 *
 * @example
 * // Login event
 * await logAudit({
 *   userId: user.id,
 *   action: AuditAction.USER_LOGIN,
 *   req
 * });
 *
 * @example
 * // Content creation
 * await logAudit({
 *   userId: tutor.id,
 *   action: AuditAction.CONTENT_CREATE,
 *   resourceType: 'content',
 *   resourceId: content.id,
 *   metadata: { contentType: 'course', title: content.title },
 *   req
 * });
 */
export async function logAudit(event: AuditEvent): Promise<number> {
  try {
    // Extract IP and user agent from request if provided
    const ipAddress = event.ipAddress || (event.req?.ip ?? event.req?.socket.remoteAddress);
    const userAgent = event.userAgent || event.req?.get('user-agent');

    // Hash IP address for privacy
    const ipAddressHash = ipAddress ? hashIP(ipAddress) : null;

    // Insert audit log
    const result = await db.query(
      `INSERT INTO audit_logs
        (user_id, action, resource_type, resource_id, ip_address_hash, user_agent, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id`,
      [
        event.userId || null,
        event.action,
        event.resourceType || null,
        event.resourceId || null,
        ipAddressHash,
        userAgent || null,
        JSON.stringify(event.metadata || {})
      ]
    );

    const auditLogId = result.rows[0]?.id;

    // Log to console in development
    if (process.env.NODE_ENV !== 'production') {
      const userDisplay = event.userId ? hashUserId(event.userId) : 'anonymous';
      console.log(`[Audit] ${event.action} by ${userDisplay}`, {
        resourceType: event.resourceType,
        resourceId: event.resourceId,
        metadata: event.metadata
      });
    }

    return auditLogId;
  } catch (error) {
    // Never let audit logging break the application
    console.error('[Audit] Failed to log audit event:', error);
    console.error('[Audit] Event:', event);
    return -1;
  }
}

/**
 * Query audit logs for a specific user
 *
 * @param userId - User ID to query
 * @param options - Query options
 * @returns Promise resolving to audit log entries
 *
 * @example
 * const userLogs = await queryAuditLogs(123, {
 *   action: AuditAction.USER_LOGIN,
 *   limit: 10
 * });
 */
export async function queryAuditLogs(
  userId: number,
  options?: {
    action?: AuditAction | string;
    resourceType?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
  }
): Promise<any[]> {
  const { action, resourceType, startDate, endDate, limit = 100, offset = 0 } = options || {};

  let query = `SELECT * FROM audit_logs WHERE user_id = $1`;
  const params: any[] = [userId];
  let paramIndex = 2;

  if (action) {
    query += ` AND action = $${paramIndex}`;
    params.push(action);
    paramIndex++;
  }

  if (resourceType) {
    query += ` AND resource_type = $${paramIndex}`;
    params.push(resourceType);
    paramIndex++;
  }

  if (startDate) {
    query += ` AND created_at >= $${paramIndex}`;
    params.push(startDate);
    paramIndex++;
  }

  if (endDate) {
    query += ` AND created_at <= $${paramIndex}`;
    params.push(endDate);
    paramIndex++;
  }

  query += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
  params.push(limit, offset);

  const result = await db.query(query, params);
  return result.rows;
}

/**
 * Query audit logs for a specific resource
 *
 * @param resourceType - Type of resource
 * @param resourceId - ID of resource
 * @param options - Query options
 * @returns Promise resolving to audit log entries
 *
 * @example
 * const contentLogs = await queryResourceAuditLogs('content', 'course-123', {
 *   limit: 20
 * });
 */
export async function queryResourceAuditLogs(
  resourceType: string,
  resourceId: string,
  options?: {
    action?: AuditAction | string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
  }
): Promise<any[]> {
  const { action, startDate, endDate, limit = 100, offset = 0 } = options || {};

  let query = `SELECT * FROM audit_logs WHERE resource_type = $1 AND resource_id = $2`;
  const params: any[] = [resourceType, resourceId];
  let paramIndex = 3;

  if (action) {
    query += ` AND action = $${paramIndex}`;
    params.push(action);
    paramIndex++;
  }

  if (startDate) {
    query += ` AND created_at >= $${paramIndex}`;
    params.push(startDate);
    paramIndex++;
  }

  if (endDate) {
    query += ` AND created_at <= $${paramIndex}`;
    params.push(endDate);
    paramIndex++;
  }

  query += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
  params.push(limit, offset);

  const result = await db.query(query, params);
  return result.rows;
}

/**
 * Get recent audit logs (for admin dashboard)
 *
 * @param limit - Number of logs to return
 * @returns Promise resolving to recent audit log entries
 *
 * @example
 * const recentActivity = await getRecentAuditLogs(50);
 */
export async function getRecentAuditLogs(limit: number = 100): Promise<any[]> {
  const result = await db.query(
    `SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT $1`,
    [limit]
  );
  return result.rows;
}

/**
 * Get audit statistics for a date range
 *
 * @param startDate - Start date
 * @param endDate - End date
 * @returns Promise resolving to statistics
 *
 * @example
 * const stats = await getAuditStatistics(
 *   new Date('2025-01-01'),
 *   new Date('2025-01-31')
 * );
 */
export async function getAuditStatistics(
  startDate: Date,
  endDate: Date
): Promise<{
  totalEvents: number;
  eventsByAction: Record<string, number>;
  uniqueUsers: number;
}> {
  // Total events
  const totalResult = await db.query(
    `SELECT COUNT(*) as count FROM audit_logs WHERE created_at >= $1 AND created_at <= $2`,
    [startDate, endDate]
  );
  const totalEvents = parseInt(totalResult.rows[0]?.count || '0');

  // Events by action
  const actionResult = await db.query(
    `SELECT action, COUNT(*) as count
     FROM audit_logs
     WHERE created_at >= $1 AND created_at <= $2
     GROUP BY action
     ORDER BY count DESC`,
    [startDate, endDate]
  );
  const eventsByAction: Record<string, number> = {};
  actionResult.rows.forEach((row) => {
    eventsByAction[row.action] = parseInt(row.count);
  });

  // Unique users
  const userResult = await db.query(
    `SELECT COUNT(DISTINCT user_id) as count
     FROM audit_logs
     WHERE created_at >= $1 AND created_at <= $2 AND user_id IS NOT NULL`,
    [startDate, endDate]
  );
  const uniqueUsers = parseInt(userResult.rows[0]?.count || '0');

  return {
    totalEvents,
    eventsByAction,
    uniqueUsers
  };
}

/**
 * Delete old audit logs (for data retention compliance)
 * Only call this from scheduled cleanup job, not from user requests
 *
 * @param retentionDays - Number of days to retain logs
 * @returns Promise resolving to number of deleted logs
 *
 * @example
 * // Delete logs older than 3 years (1095 days)
 * const deleted = await deleteOldAuditLogs(1095);
 */
export async function deleteOldAuditLogs(retentionDays: number): Promise<number> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

  const result = await db.query(
    `DELETE FROM audit_logs WHERE created_at < $1`,
    [cutoffDate]
  );

  const deletedCount = result.rowCount || 0;

  // Log the retention cleanup itself
  await db.query(
    `INSERT INTO data_retention_log (data_type, record_id, deletion_type, deletion_reason, metadata)
     VALUES ('audit_logs', 'bulk', 'hard_delete', 'retention_policy', $1)`,
    [JSON.stringify({ cutoffDate, deletedCount })]
  );

  console.log(`[Audit] Deleted ${deletedCount} audit logs older than ${retentionDays} days`);
  return deletedCount;
}
