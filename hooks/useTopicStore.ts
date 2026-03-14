// hooks/useTopicStore.ts

'use client';

import { useState, useEffect, useCallback } from 'react';
import type { TopicConfig, TopicType } from '@/types/article';
import { serializeTopics, deserializeTopics, STORAGE_KEY } from '@/lib/topicSerializer';

interface UseTopicStoreReturn {
  topics: TopicConfig[];
  addTopic: (name: string) => { success: boolean; error?: string };
  removeTopic: (type: TopicType) => void;
  isLoading: boolean;
}

/**
 * 環境変数からデフォルトトピック設定を取得
 */
function getDefaultTopics(): TopicConfig[] {
  try {
    const env = process.env.NEXT_PUBLIC_TOPICS;
    if (env) {
      const parsed = JSON.parse(env);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // ignore
  }
  return [
    { name: 'Claude Code', url: 'https://zenn.dev/topics/claudecode/feed', type: 'claudecode' },
    { name: 'Skills', url: 'https://zenn.dev/topics/skills/feed', type: 'skills' },
    { name: 'MCP', url: 'https://zenn.dev/topics/mcp/feed', type: 'mcp' },
    { name: 'RAG', url: 'https://zenn.dev/topics/rag/feed', type: 'rag' },
  ];
}

/**
 * トピック設定のCRUDとlocalStorage永続化を管理するカスタムフック
 */
export function useTopicStore(): UseTopicStoreReturn {
  const [topics, setTopics] = useState<TopicConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 初期読み込み
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = deserializeTopics(stored);
        if (parsed) {
          setTopics(parsed);
        } else {
          console.warn('Invalid topic data in localStorage, falling back to defaults');
          const defaults = getDefaultTopics();
          setTopics(defaults);
          saveToStorage(defaults);
        }
      } else {
        const defaults = getDefaultTopics();
        setTopics(defaults);
        saveToStorage(defaults);
      }
    } catch (error) {
      console.warn('Failed to load topics from localStorage:', error);
      const defaults = getDefaultTopics();
      setTopics(defaults);
    }
    setIsLoading(false);
  }, []);

  const saveToStorage = (newTopics: TopicConfig[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, serializeTopics(newTopics));
    } catch (error) {
      console.error('Failed to save topics to localStorage:', error);
    }
  };

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
      url: `https://zenn.dev/topics/${normalized}/feed`,
      type: normalized,
    };
    const updated = [...topics, newTopic];
    setTopics(updated);
    saveToStorage(updated);
    return { success: true };
  }, [topics]);

  const removeTopic = useCallback((type: TopicType) => {
    const updated = topics.filter(t => t.type !== type);
    setTopics(updated);
    saveToStorage(updated);
  }, [topics]);

  return { topics, addTopic, removeTopic, isLoading };
}
