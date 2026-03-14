// lib/topicColors.ts

import { DefaultTopicType, TopicType, TopicColorConfig, isDefaultTopic } from '@/types/article';

/**
 * デフォルトトピックの固定カラー（要件4.1）
 */
export const DEFAULT_TOPIC_COLORS: Record<DefaultTopicType, TopicColorConfig> = {
  claudecode: {
    badge: 'bg-purple-100 text-purple-800',
    border: 'border-purple-200',
    background: 'hover:bg-purple-50'
  },
  skills: {
    badge: 'bg-yellow-100 text-yellow-800',
    border: 'border-yellow-200',
    background: 'hover:bg-yellow-50'
  },
  mcp: {
    badge: 'bg-blue-100 text-blue-800',
    border: 'border-blue-200',
    background: 'hover:bg-blue-50'
  },
  rag: {
    badge: 'bg-green-100 text-green-800',
    border: 'border-green-200',
    background: 'hover:bg-green-50'
  }
};

/** 後方互換性のためのエクスポート */
export const TOPIC_COLORS = DEFAULT_TOPIC_COLORS;

/**
 * 動的トピック用カラーパレット（要件4.2）
 */
export const DYNAMIC_COLOR_PALETTE: TopicColorConfig[] = [
  { badge: 'bg-red-100 text-red-800', border: 'border-red-200', background: 'hover:bg-red-50' },
  { badge: 'bg-pink-100 text-pink-800', border: 'border-pink-200', background: 'hover:bg-pink-50' },
  { badge: 'bg-indigo-100 text-indigo-800', border: 'border-indigo-200', background: 'hover:bg-indigo-50' },
  { badge: 'bg-teal-100 text-teal-800', border: 'border-teal-200', background: 'hover:bg-teal-50' },
  { badge: 'bg-orange-100 text-orange-800', border: 'border-orange-200', background: 'hover:bg-orange-50' },
  { badge: 'bg-cyan-100 text-cyan-800', border: 'border-cyan-200', background: 'hover:bg-cyan-50' },
];


const FALLBACK_COLOR: TopicColorConfig = {
  badge: 'bg-gray-100 text-gray-800',
  border: 'border-gray-200',
  background: 'hover:bg-gray-50'
};

/**
 * トピックに対応するカラー設定を返す（要件4.3, 4.5）
 * デフォルトトピックは固定色、動的トピックはパレットから決定的に割り当て
 */
export function getTopicColor(topic: TopicType, allTopics: TopicType[]): TopicColorConfig {
  if (isDefaultTopic(topic)) {
    return DEFAULT_TOPIC_COLORS[topic];
  }

  // 動的トピックのみ抽出してソート
  const dynamicTopics = allTopics.filter(t => !isDefaultTopic(t)).sort();
  const index = dynamicTopics.indexOf(topic);

  if (index === -1 || DYNAMIC_COLOR_PALETTE.length === 0) {
    return FALLBACK_COLOR;
  }

  return DYNAMIC_COLOR_PALETTE[index % DYNAMIC_COLOR_PALETTE.length];
}

/**
 * 後方互換性のためのヘルパー
 */
export function getTopicColors(allTopics: TopicType[]): Record<string, TopicColorConfig> {
  const colors: Record<string, TopicColorConfig> = {};
  for (const topic of allTopics) {
    colors[topic] = getTopicColor(topic, allTopics);
  }
  return colors;
}
