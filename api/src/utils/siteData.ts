/**
 * @file siteData.ts
 * @author Angelo Nicolson
 * @brief Site-wide statistics management utilities
 * @description Helper functions to increment/decrement aggregate site statistics stored in the site_data table.
 * Provides efficient cached counts for resources, tutors, downloads, and users without expensive COUNT queries.
 */

import { query } from '../database/connection';

/**
 * Increment a site data counter
 */
export async function incrementSiteData(key: string, amount: number = 1): Promise<void> {
  await query(
    `INSERT INTO site_data (key, value) VALUES ($1, $2)
     ON CONFLICT (key) DO UPDATE SET value = site_data.value + $2`,
    [key, amount]
  );
}

/**
 * Decrement a site data counter
 */
export async function decrementSiteData(key: string, amount: number = 1): Promise<void> {
  await query(
    `UPDATE site_data SET value = GREATEST(0, value - $1) WHERE key = $2`,
    [amount, key]
  );
}

/**
 * Get a specific site data value
 */
export async function getSiteDataValue(key: string): Promise<number> {
  const result = await query(
    'SELECT value FROM site_data WHERE key = $1',
    [key]
  );
  return result.rows[0]?.value || 0;
}

/**
 * Get all site data as key-value pairs
 */
export async function getAllSiteData(): Promise<Record<string, number>> {
  const result = await query('SELECT key, value FROM site_data');
  const data: Record<string, number> = {};
  result.rows.forEach(row => {
    data[row.key] = row.value;
  });
  return data;
}

/**
 * Set a site data value directly
 */
export async function setSiteData(key: string, value: number): Promise<void> {
  await query(
    `INSERT INTO site_data (key, value) VALUES ($1, $2)
     ON CONFLICT (key) DO UPDATE SET value = $2`,
    [key, value]
  );
}
