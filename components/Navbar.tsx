// components/Navbar.tsx

/**
 * グローバルナビゲーションバー
 * 
 * 要件:
 * - 11.1: ページ上部にグローバルナビゲーションバーを表示
 * - 11.2: アプリケーションタイトル「Zenn Article Dashboard」を表示
 * - 11.3: スクロール中も表示され続ける（固定配置）
 * - 11.4: ミニマリストデザインスタイルを使用
 */
export function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* アプリケーションタイトル */}
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-gray-900">
              Zenn Article Dashboard
            </h1>
          </div>
        </div>
      </div>
    </nav>
  );
}
