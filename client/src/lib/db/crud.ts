import { supabase } from '@/lib/supabase';
import type { PostgrestError } from '@supabase/supabase-js';

export class DbError extends Error {
  constructor(message: string, public code?: string, public details?: unknown) {
    super(message);
    this.name = 'DbError';
  }
}

export function handleDbError(error: PostgrestError | null, context: string): never {
  if (!error) throw new DbError(`Unknown error in ${context}`);
  throw new DbError(error.message, error.code, error.details);
}

export function generateClientId(): string {
  return `client_${crypto.randomUUID()}`;
}

export interface ListOptions {
  limit?: number;
  offset?: number;
  startDate?: string;
  endDate?: string;
  orderBy?: string;
  ascending?: boolean;
}

export async function getCurrentUserId(): Promise<string> {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) throw new DbError('Not authenticated', '401');
  return user.id;
}

export async function listRecords<T>(
  table: string,
  userId: string,
  options: ListOptions = {},
  dateColumn = 'logged_date'
): Promise<T[]> {
  let query = supabase
    .from(table as 'period_logs')
    .select('*')
    .eq('user_id', userId)
    .is('deleted_at', null)
    .order(options.orderBy || dateColumn, { ascending: options.ascending ?? false });

  if (options.startDate) query = query.gte(dateColumn, options.startDate);
  if (options.endDate) query = query.lte(dateColumn, options.endDate);
  if (options.limit) query = query.limit(options.limit);
  if (options.offset) query = query.range(options.offset, options.offset + (options.limit || 50) - 1);

  const { data, error } = await query;
  if (error) handleDbError(error, `list ${table}`);
  return (data || []) as T[];
}

export async function getRecord<T>(table: string, id: string, userId: string): Promise<T | null> {
  const { data, error } = await supabase
    .from(table as 'period_logs')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .is('deleted_at', null)
    .maybeSingle();

  if (error) handleDbError(error, `get ${table}`);
  return data as T | null;
}

export async function insertRecord<T>(table: string, record: object): Promise<T> {
  const { data, error } = await supabase.from(table as 'period_logs').insert(record as never).select().single();
  if (error) handleDbError(error, `insert ${table}`);
  return data as T;
}

export async function updateRecord<T>(
  table: string, id: string, userId: string, updates: Partial<T>
): Promise<T> {
  const { data, error } = await supabase
    .from(table as 'period_logs')
    .update(updates as never)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();
  if (error) handleDbError(error, `update ${table}`);
  return data as T;
}

export async function deleteRecord(table: string, id: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from(table as 'period_logs')
    .update({ deleted_at: new Date().toISOString() } as never)
    .eq('id', id)
    .eq('user_id', userId);
  if (error) handleDbError(error, `delete ${table}`);
}

export async function hardDeleteRecord(table: string, id: string, userId: string): Promise<void> {
  const { error } = await supabase.from(table as 'quiz_results').delete().eq('id', id).eq('user_id', userId);
  if (error) handleDbError(error, `hard delete ${table}`);
}

export async function upsertRecord<T>(table: string, record: object, onConflict: string): Promise<T> {
  const { data, error } = await supabase
    .from(table as 'sleep_logs')
    .upsert(record as never, { onConflict })
    .select()
    .single();
  if (error) handleDbError(error, `upsert ${table}`);
  return data as T;
}
