/**
 * API Module - Backward Compatibility Re-export
 * 
 * This file maintains backward compatibility by re-exporting all API functions
 * from the new modular structure in src/api/
 * 
 * New code should import from '@/api' or '@/api/tasks', etc.
 */

export * from './api/index';
