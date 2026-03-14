// app/error.tsx

'use client';

import { useEffect } from 'react';

/**
 * エラー境界コンポーネント
 * 
 * ダッシュボードページでエラーが発生した場合に表示されるフォールバックUI
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // エラーをログに記録
    console.error('Dashboard error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        {/* エラーアイコン */}
        <div className="mb-4">
          <svg
            className="w-16 h-16 text-red-500 mx-auto"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        {/* エラーメッセージ */}
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          エラーが発生しました
        </h2>
        <p className="text-gray-600 mb-6">
          記事の読み込み中に問題が発生しました。もう一度お試しください。
        </p>

        {/* エラー詳細（開発環境のみ） */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mb-6 p-4 bg-gray-100 rounded text-left">
            <p className="text-sm font-mono text-gray-800 break-words">
              {error.message}
            </p>
          </div>
        )}

        {/* リトライボタン */}
        <button
          onClick={reset}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
        >
          再読み込み
        </button>

        {/* ホームに戻るリンク */}
        <a
          href="/"
          className="block mt-4 text-sm text-blue-600 hover:text-blue-800 transition-colors"
        >
          ホームに戻る
        </a>
      </div>
    </div>
  );
}
