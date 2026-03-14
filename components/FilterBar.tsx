// components/FilterBar.tsx

'use client';

import { TopicType } from '@/types/article';
import { getTopicColor } from '@/lib/topicColors';

interface FilterBarProps {
  topics: TopicType[];
  selectedTopics: TopicType[];
  onFilterChange: (topics: TopicType[]) => void;
  allTopicTypes: TopicType[];
}

/**
 * Filter Bar コンポーネント（動的トピック対応）
 */
export function FilterBar({ topics, selectedTopics, onFilterChange, allTopicTypes }: FilterBarProps) {
  const handleTopicToggle = (topic: TopicType) => {
    if (selectedTopics.includes(topic)) {
      onFilterChange(selectedTopics.filter(t => t !== topic));
    } else {
      onFilterChange([...selectedTopics, topic]);
    }
  };

  const handleClearAll = () => onFilterChange([]);
  const handleSelectAll = () => onFilterChange([...topics]);

  // デフォルトトピック表示名マッピング
  const defaultLabels: Record<string, string> = {
    claudecode: 'Claude Code', skills: 'Skills', mcp: 'MCP', rag: 'RAG'
  };
  const getLabel = (topic: TopicType) => defaultLabels[topic] || topic;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">トピックでフィルタ</h2>
        <div className="flex gap-2">
          <button onClick={handleSelectAll} disabled={selectedTopics.length === topics.length}
            className="text-sm text-blue-600 hover:text-blue-800 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors">
            すべて選択
          </button>
          <span className="text-gray-300">|</span>
          <button onClick={handleClearAll} disabled={selectedTopics.length === 0}
            className="text-sm text-blue-600 hover:text-blue-800 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors">
            クリア
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        {topics.map((topic) => {
          const isSelected = selectedTopics.includes(topic);
          const colors = getTopicColor(topic, allTopicTypes);
          return (
            <button
              key={topic}
              onClick={() => handleTopicToggle(topic)}
              className={`px-4 py-2 rounded-lg font-medium text-sm border-2 transition-all duration-200
                ${isSelected
                  ? `${colors.badge} ${colors.border} shadow-md scale-105`
                  : `bg-white ${colors.border} text-gray-700 ${colors.background}`
                }`}
              aria-pressed={isSelected}
              aria-label={`${getLabel(topic)}でフィルタ`}
            >
              {isSelected && (
                <span className="inline-block mr-1">
                  <svg className="w-4 h-4 inline" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </span>
              )}
              {getLabel(topic)}
            </button>
          );
        })}
      </div>

      {selectedTopics.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            {selectedTopics.length === topics.length
              ? 'すべてのトピックを表示中'
              : `${selectedTopics.length}個のトピックでフィルタ中`}
          </p>
        </div>
      )}
    </div>
  );
}
