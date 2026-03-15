# 実装計画: Qiita RSS Integration

## 概要

既存のZenn RSSダッシュボードにQiita RSSフィード取得機能を追加する。ArticleSource型の追加、ソース別トピック管理、SourceTabコンポーネント、API対応を段階的に実装し、各ステップでテストを通じて正当性を検証する。

## タスク

- [x] 1. データモデルの拡張とソース別シリアライザ対応
  - [x] 1.1 ArticleSource型の追加とTopicConfigの拡張
    - `types/article.ts`に`ArticleSource`型（`'zenn' | 'qiita'`）を追加
    - `TopicConfig`インターフェースに`source?: ArticleSource`フィールドを追加（オプショナルで後方互換）
    - _要件: 1.1, 1.2, 1.3_

  - [x] 1.2 topicSerializerにソース別ストレージキーとデシリアライズ時の後方互換処理を追加
    - `lib/topicSerializer.ts`に`getStorageKey(source: ArticleSource): string`関数を追加
    - Zenn: `'zenn-dashboard-topics'`（既存キー維持）、Qiita: `'qiita-dashboard-topics'`
    - `deserializeTopics`でsourceフィールドが無いTopicConfigに`'zenn'`をデフォルト設定する処理を追加
    - _要件: 7.1, 1.3_

  - [ ]* 1.3 Property 1のプロパティベーステスト: ソース別URL生成パターン
    - **Property 1: ソース別URL生成パターン**
    - ランダムなトピック名とソース種別で、Zennは`https://zenn.dev/topics/{name}/feed`、Qiitaは`https://qiita.com/tags/{name}/feed`パターンのURLが生成されることを検証
    - **検証対象: 要件 2.1, 2.2, 5.2, 5.3**

  - [ ]* 1.4 Property 3のプロパティベーステスト: 後方互換性デフォルト
    - **Property 3: 後方互換性デフォルト**
    - sourceフィールドを持たないランダムなTopicConfigオブジェクトをデシリアライズした際、sourceが`'zenn'`にデフォルト設定されることを検証
    - **検証対象: 要件 1.3, 8.3**

  - [ ]* 1.5 Property 5のプロパティベーステスト: トピック永続化ラウンドトリップ
    - **Property 5: トピック永続化ラウンドトリップ**
    - ランダムなTopicConfig配列をシリアライズ→デシリアライズして元と同等の配列が復元されることを検証
    - **検証対象: 要件 7.4**

  - [ ]* 1.6 Property 7のプロパティベーステスト: ArticleSource型バリデーション
    - **Property 7: ArticleSource型バリデーション**
    - ランダムな文字列に対して`'zenn'`と`'qiita'`のみが有効なArticleSourceとして受け入れられることを検証
    - **検証対象: 要件 1.1, 8.2**

- [x] 2. チェックポイント - テスト実行と確認
  - すべてのテストが通ることを確認し、不明点があればユーザーに質問してください。

- [x] 3. useTopicStoreのソース別対応リファクタリング
  - [x] 3.1 useTopicStoreにsource引数を追加しソース別ロジックを実装
    - `hooks/useTopicStore.ts`の`useTopicStore`関数に`source: ArticleSource`引数を追加
    - ソース別のデフォルトトピック定義（Zenn: 既存4トピック、Qiita: RAG, MCP, AgentSkills, Claude Code）
    - `addTopic`でソースに応じたURL生成パターンを適用
    - `source`変更時にlocalStorageから再読み込みする`useEffect`を実装
    - `getStorageKey`を使用してソース別のlocalStorageキーで永続化
    - _要件: 3.1-3.6, 5.1-5.6, 7.1-7.5_

  - [ ]* 3.2 Property 2のプロパティベーステスト: ソース別トピック分離
    - **Property 2: ソース別トピック分離**
    - ランダムなトピック操作（追加・削除）を一方のソースに対して行った際、もう一方のソースのlocalStorageデータが変更されないことを検証
    - **検証対象: 要件 3.6, 5.1, 5.4, 5.5, 7.2, 7.3**

  - [ ]* 3.3 Property 4のプロパティベーステスト: トピック重複検出
    - **Property 4: トピック重複検出**
    - 既にソース内に存在するトピック名を再度追加しようとした場合、追加が拒否されエラーが返されることを検証
    - **検証対象: 要件 5.6**

  - [ ]* 3.4 Property 6のプロパティベーステスト: 破損データのフォールバック分離
    - **Property 6: 破損データのフォールバック分離**
    - 一方のソースのlocalStorageデータが破損している場合、そのソースのみデフォルトにフォールバックし、他方に影響しないことを検証
    - **検証対象: 要件 7.5**

  - [ ]* 3.5 useTopicStoreのユニットテスト
    - Qiitaデフォルトトピック4つが正しいURL・名前で定義されていることをテスト
    - ソース切り替え時にlocalStorageから正しく再読み込みされることをテスト
    - _要件: 3.1-3.5_

- [x] 4. チェックポイント - テスト実行と確認
  - すべてのテストが通ることを確認し、不明点があればユーザーに質問してください。

- [x] 5. SourceTabコンポーネントの作成とDashboardClientの統合
  - [x] 5.1 SourceTabコンポーネントの作成
    - `components/SourceTab.tsx`を新規作成
    - "Zenn"と"Qiita"の2つのタブを表示
    - アクティブタブの視覚的強調（border-bottom + テキスト色変更）
    - `activeSource`と`onSourceChange`プロパティを受け取る
    - アクセシビリティ対応（`role="tablist"`、`aria-selected`等）
    - _要件: 4.1, 4.2, 4.6_

  - [x] 5.2 DashboardClientにソース切り替え機能を統合
    - `components/DashboardClient.tsx`に`activeSource`状態（デフォルト: `'zenn'`）を追加
    - `SourceTab`コンポーネントを配置
    - `useTopicStore`呼び出しに`activeSource`を渡す
    - ソース切り替え時にフィルタ状態をリセットし記事を再取得
    - 各ソースのフィルタ状態を保持する仕組みを実装
    - _要件: 4.2, 4.3, 4.4, 4.5, 6.1, 6.2, 6.3_

  - [ ]* 5.3 SourceTabのユニットテスト
    - 初期表示でZennタブがアクティブであることをテスト
    - タブクリックで`onSourceChange`が正しいソース値で呼ばれることをテスト
    - _要件: 4.1, 4.2, 4.3_

  - [ ]* 5.4 Property 9のプロパティベーステスト: ソース別記事表示
    - **Property 9: ソース別記事表示**
    - アクティブソースのトピックから取得された記事のみが表示されることを検証
    - **検証対象: 要件 6.1, 6.2, 6.4**

  - [ ]* 5.5 Property 10のプロパティベーステスト: タブ切り替え時の状態保持
    - **Property 10: タブ切り替え時の状態保持**
    - タブ切り替え操作の列において、各ソースのトピック設定とフィルタ状態が保持されることを検証
    - **検証対象: 要件 4.5**

- [x] 6. チェックポイント - テスト実行と確認
  - すべてのテストが通ることを確認し、不明点があればユーザーに質問してください。

- [x] 7. APIエンドポイントのソース対応と記事重複排除
  - [x] 7.1 APIエンドポイントのsourceフィールド対応
    - `app/api/articles/route.ts`の`validateTopicConfigs`呼び出し部分を更新
    - sourceフィールド付きTopicConfigを受け入れるよう`lib/topicSerializer.ts`の`validateTopicConfigs`を更新
    - sourceフィールドが無い場合は`'zenn'`をデフォルト設定する後方互換処理を追加
    - _要件: 8.1, 8.2, 8.3_

  - [ ]* 7.2 Property 8のプロパティベーステスト: 記事リンク重複排除
    - **Property 8: 記事リンク重複排除**
    - 同一リンクを持つ記事が複数含まれるリストにおいて、fetchArticlesの出力には各リンクが最大1回しか出現しないことを検証
    - **検証対象: 要件 2.5**

  - [ ]* 7.3 APIエンドポイントのユニットテスト
    - sourceフィールド付きTopicConfigが受け入れられることをテスト
    - sourceフィールド無しのTopicConfigが`'zenn'`として扱われることをテスト
    - 無効なsource値が拒否されることをテスト
    - _要件: 8.1, 8.2, 8.3_

- [x] 8. 最終チェックポイント - 全テスト実行と最終確認
  - すべてのテストが通ることを確認し、不明点があればユーザーに質問してください。

## 備考

- `*`マーク付きのタスクはオプションで、MVP実装時にはスキップ可能です
- 各タスクは具体的な要件を参照しており、トレーサビリティを確保しています
- チェックポイントで段階的に検証を行い、問題の早期発見を図ります
- プロパティベーステストは設計書の正当性プロパティに基づいて普遍的な正しさを検証します
- ユニットテストは具体的な例とエッジケースを検証します
