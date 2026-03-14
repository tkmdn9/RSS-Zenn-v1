// app/demo-filter/page.tsx

'use client';

import { useState } from 'react';
import { FilterBar } from '@/components/FilterBar';
import { TopicType } from '@/types/article';

/**
 * FilterBarコンポーネントのデモページ
 * 
 * このページはFilterBarコンポーネントの動作を確認するためのものです
 */
export default function DemoFilterPage() {
  const [selectedTopics, setSelectedTopics] = useState<TopicType[]>([]);
  
  // 利用可能なすべてのトピック
  const allTopics: TopicType[] = ['claudecode', 'skills', 'mcp', 'rag'];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Filter Bar コンポーネント デモ
        </h1>

        {/* FilterBar コンポーネント */}
        <FilterBar
          topics={allTopics}
          selectedTopics={selectedTopics}
          onFilterChange={setSelectedTopics}
          allTopicTypes={allTopics}
        />

        {/* 選択状態の表示 */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            選択されたトピック
          </h2>
          
          {selectedTopics.length === 0 ? (
            <p className="text-gray-500">トピックが選択されていません</p>
          ) : (
            <div className="space-y-2">
              <p className="text-gray-700">
                {selectedTopics.length}個のトピックが選択されています:
              </p>
              <ul className="list-disc list-inside space-y-1">
                {selectedTopics.map((topic) => (
                  <li key={topic} className="text-gray-600">
                    {topic}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* 機能説明 */}
        <div className="mt-8 bg-blue-50 rounded-lg border border-blue-200 p-6">
          <h2 className="text-xl font-semibold text-blue-900 mb-4">
            実装された機能
          </h2>
          <ul className="space-y-2 text-blue-800">
            <li>✓ 要件4.1: 利用可能なすべてのトピックのフィルタオプションを表示</li>
            <li>✓ 要件4.4: 複数のトピックを同時に選択可能</li>
            <li>✓ 要件4.5: アクティブなフィルタを視覚的に表示（チェックマーク、影、スケール）</li>
            <li>✓ トピック別カラーコーディング（紫、黄、青、緑）</li>
            <li>✓ すべて選択/クリア機能</li>
            <li>✓ アクセシビリティ対応（aria-pressed, aria-label）</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
