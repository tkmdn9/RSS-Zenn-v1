# 実装計画: 動的トピック管理

## 概要

Zenn Article Dashboardに動的トピック管理機能を追加する。型定義の変更から始め、ユーティリティ層（シリアライザ、カラー割り当て）、状態管理層（useTopicStore）、プレゼンテーション層（TopicConfigPanel、FilterBar、ArticleCard）、データ取得層（API Route、fetchArticles）の順に段階的に実装する。各ステップでテストを追加し、最後にすべてを統合する。

## タスク

- [x] 1. 型定義の変更とデフォルトトピック定義
  - [x] 1.1 `types/article.ts`の`TopicType`を固定ユニオン型から`string`型に変更する
    - `DefaultTopicType`リテラル型（`'claudecode' | 'skills' | 'mcp' | 'rag'`）を新規追加
    - `TopicType`を`string`型に変更
    - `DEFAULT_TOPICS`定数配列と`isDefaultTopic`ヘルパー関数を追加
    - `TopicConfig`の`type`フィールドが`string`を受け入れることを確認
    - _要件: 6.1, 6.2_

  - [x] 1.2 型変更に伴う既存コードのコンパイルエラーを修正する
    - `lib/topicColors.ts`の`Record<TopicType, ...>`を`Record<DefaultTopicType, ...>`に変更
    - `components/FilterBar.tsx`の`topicLabels`の型を調整
    - `lib/fetchArticles.ts`の`isValidTopicConfig`内のTopicType検証を緩和（固定リストチェックを削除し、string型を受け入れ）
    - _要件: 6.1, 6.3_

- [x] 2. トピック設定シリアライザの実装
  - [x] 2.1 `lib/topicSerializer.ts`を新規作成する
    - `STORAGE_KEY`定数（`'zenn-dashboard-topics'`）を定義
    - `serializeTopics(topics: TopicConfig[]): string` — TopicConfig配列をJSON文字列にシリアライズ
    - `deserializeTopics(json: string): TopicConfig[] | null` — JSON文字列をTopicConfig配列にデシリアライズ、失敗時はnullを返す
    - `validateTopicConfigs(data: unknown): data is TopicConfig[]` — TopicConfig配列のバリデーション（配列チェック、各要素のname/url/typeフィールド検証）
    - _要件: 9.1, 9.2, 9.4_

  - [ ]* 2.2 プロパティテスト: シリアライズ・デシリアライズ ラウンドトリップ
    - **Property 6: トピック設定のシリアライズ・デシリアライズ ラウンドトリップ**
    - **検証対象: 要件 9.1, 9.2, 9.3, 3.1, 3.2, 3.5**

  - [ ]* 2.3 プロパティテスト: 不正データに対するフォールバック
    - **Property 7: 不正データに対するフォールバック**
    - **検証対象: 要件 3.4, 9.4**

  - [ ]* 2.4 `lib/__tests__/topicSerializer.test.ts`にユニットテストを作成する
    - 有効なTopicConfig配列のシリアライズ・デシリアライズ
    - 空配列のシリアライズ・デシリアライズ
    - 不正なJSON文字列のデシリアライズ（nullを返す）
    - 必須フィールドが欠けたオブジェクトのバリデーション失敗
    - _要件: 9.1, 9.2, 9.4_

- [x] 3. 動的カラー割り当てモジュールの拡張
  - [x] 3.1 `lib/topicColors.ts`に動的カラー割り当て機能を追加する
    - `DEFAULT_TOPIC_COLORS`を`Record<DefaultTopicType, TopicColorConfig>`として定義（既存の`TOPIC_COLORS`を置き換え）
    - `DYNAMIC_COLOR_PALETTE: TopicColorConfig[]`を定義（赤、ピンク、インディゴ、ティール、オレンジ、シアンの6色）
    - `getTopicColor(topic: TopicType, allTopics: TopicType[]): TopicColorConfig`を実装 — デフォルトトピックは固定色、動的トピックはソート後のインデックスでパレットから循環割り当て
    - `getTopicColors(allTopics: TopicType[]): Record<string, TopicColorConfig>`を実装 — 後方互換性のためのヘルパー
    - 既存の`TOPIC_COLORS`エクスポートは後方互換性のため維持
    - _要件: 4.1, 4.2, 4.3, 4.4, 4.5_

  - [ ]* 3.2 プロパティテスト: デフォルトトピックの固定カラー維持
    - **Property 8: デフォルトトピックの固定カラー維持**
    - **検証対象: 要件 4.1, 4.5**

  - [ ]* 3.3 プロパティテスト: 動的カラー割り当ての決定性
    - **Property 9: 動的カラー割り当ての決定性**
    - **検証対象: 要件 4.2, 4.3, 4.5**

  - [ ]* 3.4 プロパティテスト: カラーパレットの循環割り当て
    - **Property 10: カラーパレットの循環割り当て**
    - **検証対象: 要件 4.4**

- [x] 4. チェックポイント - 基盤モジュールの確認
  - すべてのテストが通ることを確認し、不明点があればユーザーに質問する。

- [x] 5. useTopicStoreフックの実装
  - [x] 5.1 `hooks/useTopicStore.ts`を新規作成する
    - `useTopicStore(): UseTopicStoreReturn`カスタムフックを実装
    - localStorageからトピック設定を読み込み（`deserializeTopics`使用）
    - localStorageが空またはデータ破損時は`getDefaultTopics()`にフォールバック（コンソール警告出力）
    - `addTopic(name: string): { success: boolean; error?: string }` — トピック名を小文字正規化、空文字/空白チェック、重複チェック、RSSフィードURL自動生成、localStorageに即座保存
    - `removeTopic(type: TopicType): void` — トピック削除、localStorageに即座保存
    - `isLoading`状態（初期読み込み中のフラグ）
    - デフォルトトピック設定は環境変数`NEXT_PUBLIC_TOPICS`から取得するヘルパー`getDefaultTopics()`を実装
    - _要件: 1.1, 1.4, 1.5, 2.1, 2.2, 3.1, 3.2, 3.3, 3.4, 3.5, 6.4_

  - [ ]* 5.2 プロパティテスト: トピック追加による一覧の成長
    - **Property 2: トピック追加による一覧の成長**
    - **検証対象: 要件 1.1, 1.2**

  - [ ]* 5.3 プロパティテスト: 重複トピックの拒否
    - **Property 3: 重複トピックの拒否**
    - **検証対象: 要件 1.4**

  - [ ]* 5.4 プロパティテスト: 空白トピック名の拒否
    - **Property 4: 空白トピック名の拒否**
    - **検証対象: 要件 1.5**

  - [ ]* 5.5 プロパティテスト: トピック削除による一覧の縮小
    - **Property 5: トピック削除による一覧の縮小**
    - **検証対象: 要件 2.1, 2.2**

  - [ ]* 5.6 プロパティテスト: トピック名の小文字正規化
    - **Property 13: トピック名の小文字正規化**
    - **検証対象: 要件 6.4**

  - [ ]* 5.7 プロパティテスト: デフォルトトピック判定の正確性
    - **Property 14: デフォルトトピック判定の正確性**
    - **検証対象: 要件 6.2**

- [x] 6. TopicConfigPanelコンポーネントの実装
  - [x] 6.1 `components/TopicConfigPanel.tsx`を新規作成する
    - トピック名入力フィールド（プレースホルダー: 「例: nextjs, react, typescript」）と追加ボタンを表示
    - 現在のトピック一覧をリスト表示（各トピックにカラーバッジ付き、`getTopicColor`使用）
    - デフォルトトピックに「デフォルト」ラベルを表示（`isDefaultTopic`使用）
    - 各トピックに削除ボタンを表示
    - バリデーションエラーメッセージの表示（空文字、重複）
    - aria属性の設定（`aria-label`、`role`等）
    - _要件: 1.6, 2.5, 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_

  - [ ]* 6.2 `components/__tests__/TopicConfigPanel.test.tsx`にユニットテストを作成する
    - 入力フィールドと追加ボタンの存在確認
    - トピック一覧の表示確認
    - デフォルトトピックの「デフォルト」ラベル表示確認
    - 削除ボタンの存在確認
    - プレースホルダーテキストの表示確認
    - aria属性の設定確認
    - _要件: 1.6, 2.5, 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_

- [x] 7. チェックポイント - コンポーネント層の確認
  - すべてのテストが通ることを確認し、不明点があればユーザーに質問する。

- [x] 8. DashboardClientの変更（useTopicStore統合）
  - [x] 8.1 `components/DashboardClient.tsx`に`useTopicStore`フックを統合する
    - `useTopicStore`からトピック一覧、`addTopic`、`removeTopic`を取得
    - `TopicConfigPanel`コンポーネントを配置
    - トピック変更時にAPIから記事を再取得する処理を追加（`/api/articles?topics=...`）
    - フィルタリングを動的トピック一覧に基づいて実行
    - `availableTopics`の算出を`useTopicStore`のトピック一覧ベースに変更
    - _要件: 1.3, 2.3, 8.1, 8.5_

- [x] 9. FilterBarの変更（動的トピック対応）
  - [x] 9.1 `components/FilterBar.tsx`を動的トピックに対応させる
    - 固定の`topicLabels`マッピングを廃止し、トピック名をそのままラベルとして使用
    - `TOPIC_COLORS[topic]`の直接参照を`getTopicColor(topic, allTopicTypes)`に変更
    - propsに`allTopicTypes: TopicType[]`を追加（カラー割り当て用）
    - 動的に追加されたトピックのフィルタボタンを自動表示
    - _要件: 5.1, 5.2, 5.3, 5.4, 5.5_

  - [ ]* 9.2 プロパティテスト: フィルタリングの正確性
    - **Property 11: フィルタリングの正確性**
    - **検証対象: 要件 5.4, 2.3, 2.4**

  - [ ]* 9.3 プロパティテスト: トピック一覧の完全表示
    - **Property 12: トピック一覧の完全表示**
    - **検証対象: 要件 5.1, 5.2, 5.5, 7.2**

- [x] 10. APIエンドポイントとfetchArticlesの変更
  - [x] 10.1 `lib/fetchArticles.ts`を変更し、引数でTopicConfig配列を受け取れるようにする
    - `fetchArticles(topicConfigs?: TopicConfig[]): Promise<FetchArticlesResult>`にシグネチャ変更
    - 引数が渡された場合はそれを使用、なければ環境変数から読み取り
    - `isValidTopicConfig`のTopicType検証を緩和（string型を受け入れ）
    - _要件: 6.3, 8.2, 8.3, 8.4_

  - [x] 10.2 `app/api/articles/route.ts`にクエリパラメータ対応を追加する
    - `GET(request: Request)`にシグネチャ変更
    - クエリパラメータ`topics`からTopicConfig配列をJSONパース
    - `validateTopicConfigs`でバリデーション、失敗時は400エラー
    - 環境変数のトピック設定とマージして`fetchArticles`に渡す
    - _要件: 8.1, 8.2, 8.4_

  - [ ]* 10.3 プロパティテスト: RSSフィードURL生成の正確性
    - **Property 1: RSSフィードURL生成の正確性**
    - **検証対象: 要件 1.1, 8.4**

  - [ ]* 10.4 プロパティテスト: トピック設定マージの完全性
    - **Property 15: トピック設定マージの完全性**
    - **検証対象: 要件 8.2**

- [x] 11. ArticleCardの変更（動的カラー対応）
  - [x] 11.1 `components/ArticleCard.tsx`を動的カラーに対応させる
    - `TOPIC_COLORS[article.topic]`の直接参照を`getTopicColor`に変更
    - propsに`allTopicTypes: TopicType[]`を追加（カラー割り当て用）
    - `ArticleGrid`経由で`allTopicTypes`を受け渡す
    - _要件: 4.2, 4.3_

- [x] 12. 最終チェックポイント - 全体統合の確認
  - すべてのテストが通ることを確認し、不明点があればユーザーに質問する。

## 備考

- `*`マーク付きのタスクはオプションであり、MVP実装時にはスキップ可能
- 各タスクは具体的な要件を参照しており、トレーサビリティを確保
- チェックポイントで段階的に動作確認を実施
- プロパティテストは普遍的な正確性を検証し、ユニットテストは具体的なケースを検証する
