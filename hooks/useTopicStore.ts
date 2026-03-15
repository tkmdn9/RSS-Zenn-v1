// hooks/useTopicStore.ts

'use client';

import { useState, useEffect, useCallback } from 'react';
import type { TopicConfig, TopicType, ArticleSource } from '@/types/article';
import { serializeTopics, deserializeTopics, getStorageKey } from '@/lib/topicSerializer';

interface UseTopicStoreReturn {
  topics: TopicConfig[];
  addTopic: (name: string) => { success: boolean; error?: string };
  removeTopic: (type: TopicType) => void;
  isLoading: boolean;
}

/** Zennデフォルトトピック */
const ZENN_DEFAULT_TOPICS: TopicConfig[] = [
  { name: 'Claude Code', url: 'https://zenn.dev/topics/claudecode/feed', type: 'claudecode', source: 'zenn' },
  { name: 'Skills', url: 'https://zenn.dev/topics/skills/feed', type: 'skills', source: 'zenn' },
  { name: 'MCP', url: 'https://zenn.dev/topics/mcp/feed', type: 'mcp', source: 'zenn' },
  { name: 'RAG', url: 'https://zenn.dev/topics/rag/feed', type: 'rag', source: 'zenn' },
];

/** Qiitaデフォルトトピック */
const QIITA_DEFAULT_TOPICS: TopicConfig[] = [
  { name: 'RAG', url: 'https://qiita.com/tags/rag/feed', type: 'rag', source: 'qiita' },
  { name: 'MCP', url: 'https://qiita.com/tags/mcp/feed', type: 'mcp', source: 'qiita' },
  { name: 'AgentSkills', url: 'https://qiita.com/tags/agentskills/feed', type: 'agentskills', source: 'qiita' },
  { name: 'Claude Code', url: 'https://qiita.com/tags/claudecode/feed', type: 'claudecode', source: 'qiita' },
  { name: 'Next.js', url: 'https://qiita.com/tags/nextjs/feed', type: 'nextjs', source: 'qiita' },
  { name: 'React', url: 'https://qiita.com/tags/react/feed', type: 'react', source: 'qiita' },
  { name: 'Python', url: 'https://qiita.com/tags/python/feed', type: 'python', source: 'qiita' },
  { name: 'AWS', url: 'https://qiita.com/tags/aws/feed', type: 'aws', source: 'qiita' },
];

/**
 * ソース別のデフォルトトピックを取得
 */
function getDefaultTopics(source: ArticleSource): TopicConfig[] {
  if (source === 'zenn') {
    try {
      const env = process.env.NEXT_PUBLIC_TOPICS;
      if (env) {
        const parsed = JSON.parse(env);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore
    }
    return ZENN_DEFAULT_TOPICS;
  }
  return QIITA_DEFAULT_TOPICS;
}

/**
 * ソースに応じたRSSフィードURLを生成
 */
function generateTopicUrl(normalized: string, source: ArticleSource): string {
  if (source === 'qiita') {
    return `https://qiita.com/tags/${normalized}/feed`;
  }
  return `https://zenn.dev/topics/${normalized}/feed`;
}

/**
 * トピック設定のCRUDとlocalStorage永続化を管理するカスタムフック
 * source引数でZenn/Qiitaのソース別管理を行う
 */
export function useTopicStore(source: ArticleSource = 'zenn'): UseTopicStoreReturn {
  const [topics, setTopics] = useState<TopicConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const storageKey = getStorageKey(source);

  const saveToStorage = useCallback((newTopics: TopicConfig[]) => {
    try {
      localStorage.setItem(storageKey, serializeTopics(newTopics));
    } catch (error) {
      console.error('Failed to save topics to localStorage:', error);
    }
  }, [storageKey]);

  // ソース変更時・初期読み込み時にlocalStorageから読み込み
  useEffect(() => {
    setIsLoading(true);
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = deserializeTopics(stored);
        if (parsed) {
          setTopics(parsed);
        } else {
          console.warn('Invalid topic data in localStorage, falling back to defaults');
          const defaults = getDefaultTopics(source);
          setTopics(defaults);
          saveToStorage(defaults);
        }
      } else {
        const defaults = getDefaultTopics(source);
        setTopics(defaults);
        saveToStorage(defaults);
      }
    } catch (error) {
      console.warn('Failed to load topics from localStorage:', error);
      const defaults = getDefaultTopics(source);
      setTopics(defaults);
    }
    setIsLoading(false);
  }, [source, storageKey, saveToStorage]);

  const addTopic = useCallback((name: string): { success: boolean; error?: string } => {
    const normalized = name.trim().toLowerCase();
    if (!normalized) {
      return { success: false, error: 'トピック名を入力してください' };
    }
    if (topics.some(t => t.type === normalized)) {
      return { success: false, error: 'このトピックは既に追加されています' };
    }
    const newTopic: TopicConfig = {
      name: name.trim(),
      url: generateTopicUrl(normalized, source),
      type: normalized,
      source,
    };
    const updated = [...topics, newTopic];
    setTopics(updated);
    saveToStorage(updated);
    return { success: true };
  }, [topics, source, saveToStorage]);

  const removeTopic = useCallback((type: TopicType) => {
    const updated = topics.filter(t => t.type !== type);
    setTopics(updated);
    saveToStorage(updated);
  }, [topics, saveToStorage]);

  return { topics, addTopic, removeTopic, isLoading };
}
