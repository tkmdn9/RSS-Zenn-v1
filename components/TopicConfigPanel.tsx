// components/TopicConfigPanel.tsx

'use client';

import { useState } from 'react';
import type { TopicConfig, TopicType } from '@/types/article';
import { isDefaultTopic } from '@/types/article';
import { getTopicColor } from '@/lib/topicColors';

interface TopicConfigPanelProps {
  topics: TopicConfig[];
  onAddTopic: (name: string) => { success: boolean; error?: string };
  onRemoveTopic: (type: TopicType) => void;
  allTopicTypes: TopicType[];
}

export function TopicConfigPanel({ topics, onAddTopic, onRemoveTopic, allTopicTypes }: TopicConfigPanelProps) {
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleAdd = () => {
    setError(null);
    const result = onAddTopic(inputValue);
    if (result.success) {
      setInputValue('');
    } else {
      setError(result.error || 'エラーが発生しました');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleAdd();
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6" role="region" aria-label="トピック管理">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">トピック管理</h2>

      {/* 入力フィールド */}
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => { setInputValue(e.target.value); setError(null); }}
          onKeyDown={handleKeyDown}
          placeholder="例: nextjs, react, typescript"
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          aria-label="トピック名入力"
        />
        <button
          onClick={handleAdd}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          aria-label="トピックを追加"
        >
          追加
        </button>
      </div>

      {/* エラーメッセージ */}
      {error && (
        <p className="text-sm text-red-600 mb-3" role="alert">{error}</p>
      )}

      {/* トピック一覧 */}
      <ul className="space-y-2" aria-label="トピック一覧">
        {topics.map((topic) => {
          const colors = getTopicColor(topic.type, allTopicTypes);
          return (
            <li key={topic.type} className="flex items-center justify-between py-2 px-3 rounded-lg border border-gray-100 hover:bg-gray-50">
              <div className="flex items-center gap-2">
                <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded ${colors.badge}`}>
                  {topic.name}
                </span>
                {isDefaultTopic(topic.type) && (
                  <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">デフォルト</span>
                )}
              </div>
              <button
                onClick={() => onRemoveTopic(topic.type)}
                className="text-gray-400 hover:text-red-500 transition-colors p-1"
                aria-label={`${topic.name}を削除`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
