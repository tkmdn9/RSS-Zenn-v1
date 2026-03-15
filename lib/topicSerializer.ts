// lib/topicSerializer.ts

import type { ArticleSource, TopicConfig } from '@/types/article';

export const STORAGE_KEY = 'zenn-dashboard-topics';

/**
 * ソース種別に応じたlocalStorageキーを返す（要件7.1）
 * Zenn: 'zenn-dashboard-topics'（既存キー維持、後方互換）
 * Qiita: 'qiita-dashboard-topics'
 */
export function getStorageKey(source: ArticleSource): string {
  switch (source) {
    case 'zenn':
      return 'zenn-dashboard-topics';
    case 'qiita':
      return 'qiita-dashboard-topics';
  }
}

/**
 * TopicConfig配列をJSON文字列にシリアライズ（要件9.1）
 */
export function serializeTopics(topics: TopicConfig[]): string {
  return JSON.stringify(topics);
}

/**
 * JSON文字列をTopicConfig配列にデシリアライズ（要件9.2）
 * 失敗時はnullを返す
 * sourceフィールドが無いTopicConfigには'zenn'をデフォルト設定（要件1.3、後方互換）
 */
export function deserializeTopics(json: string): TopicConfig[] | null {
  try {
    const parsed = JSON.parse(json);
    if (validateTopicConfigs(parsed)) {
      return (parsed as TopicConfig[]).map((topic) => ({
        ...topic,
        source: topic.source ?? 'zenn',
      }));
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * ArticleSourceとして有効な値かどうかを検証する（要件8.2）
 */
export function isValidArticleSource(value: unknown): value is ArticleSource {
  return value === 'zenn' || value === 'qiita';
}

/**
 * TopicConfig配列のバリデーション（要件9.4, 8.1, 8.2）
 * sourceフィールドが存在する場合は'zenn'または'qiita'であることを検証
 * sourceフィールドが無い場合は後方互換として許容する
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
      (item as any).type.length > 0 &&
      ((item as any).source === undefined || isValidArticleSource((item as any).source))
  );
}
