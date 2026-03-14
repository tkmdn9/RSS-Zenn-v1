// lib/topicSerializer.ts

import type { TopicConfig } from '@/types/article';

export const STORAGE_KEY = 'zenn-dashboard-topics';

/**
 * TopicConfig配列をJSON文字列にシリアライズ（要件9.1）
 */
export function serializeTopics(topics: TopicConfig[]): string {
  return JSON.stringify(topics);
}

/**
 * JSON文字列をTopicConfig配列にデシリアライズ（要件9.2）
 * 失敗時はnullを返す
 */
export function deserializeTopics(json: string): TopicConfig[] | null {
  try {
    const parsed = JSON.parse(json);
    if (validateTopicConfigs(parsed)) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * TopicConfig配列のバリデーション（要件9.4）
 */
export function validateTopicConfigs(data: unknown): data is TopicConfig[] {
  if (!Array.isArray(data)) return false;
  return data.every(
    (item) =>
      item !== null &&
      typeof item === 'object' &&
      typeof (item as any).name === 'string' &&
      (item as any).name.length > 0 &&
      typeof (item as any).url === 'string' &&
      (item as any).url.length > 0 &&
      typeof (item as any).type === 'string' &&
      (item as any).type.length > 0
  );
}
