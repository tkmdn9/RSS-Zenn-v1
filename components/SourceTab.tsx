// components/SourceTab.tsx

'use client';

import { ArticleSource } from '@/types/article';

interface SourceTabProps {
  activeSource: ArticleSource;
  onSourceChange: (source: ArticleSource) => void;
}

const SOURCES: { key: ArticleSource; label: string }[] = [
  { key: 'zenn', label: 'Zenn' },
  { key: 'qiita', label: 'Qiita' },
];

/**
 * ソース切り替えタブコンポーネント
 *
 * ZennとQiitaの2つのタブを表示し、アクティブソースの切り替えを行う。
 * 要件: 4.1, 4.2, 4.6
 */
export function SourceTab({ activeSource, onSourceChange }: SourceTabProps) {
  return (
    <div
      className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6"
      role="tablist"
      aria-label="記事ソース切り替え"
    >
      <div className="flex">
        {SOURCES.map(({ key, label }) => {
          const isActive = activeSource === key;
          return (
            <button
              key={key}
              role="tab"
              aria-selected={isActive}
              tabIndex={isActive ? 0 : -1}
              onClick={() => onSourceChange(key)}
              className={`flex-1 px-6 py-3 text-sm font-medium transition-colors border-b-2 ${
                isActive
                  ? 'border-blue-500 text-blue-600 font-semibold'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
