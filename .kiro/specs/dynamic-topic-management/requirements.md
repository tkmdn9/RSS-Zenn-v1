# 要件定義書: 動的トピック管理

## はじめに

Zenn Article Dashboardに動的トピック管理機能を追加する。現在は環境変数`NEXT_PUBLIC_TOPICS`に固定された4つのトピック（Claude Code、Skills、MCP、RAG）のみ対応しているが、ユーザーがアプリ画面からトピック（タグ）を自由に追加・削除できるようにする。追加されたトピックのZenn RSSフィード（`https://zenn.dev/topics/{topic_name}/feed`）から記事を自動取得し、フィルタリングにも反映する。

## 用語集

- **Dashboard**: Zenn記事を集約・表示するWebアプリケーションのメイン画面
- **Topic_Manager**: トピックの追加・削除・永続化を担当するモジュール
- **Topic_Store**: localStorageを使用してユーザーのトピック設定を永続化するストレージ層
- **Color_Assigner**: 動的に追加されたトピックにカラーコーディングを割り当てるモジュール
- **Filter_Bar**: トピックによる記事フィルタリングUIコンポーネント
- **Topic_Config_Panel**: トピックの追加・削除を行うUI管理パネル
- **RSS_Fetcher**: ZennのRSSフィードから記事を取得するモジュール
- **TopicType**: トピックを識別する文字列型（動的に拡張可能）
- **TopicConfig**: トピックの名前、URL、タイプを含む設定オブジェクト
- **Default_Topics**: 環境変数で定義された初期トピック（claudecode、skills、mcp、rag）

## 要件

### 要件1: トピックの追加

**ユーザーストーリー:** ダッシュボードユーザーとして、新しいトピックを追加したい。追加したトピックのZenn記事を自動的に取得・表示できるようにするため。

#### 受け入れ基準

1. WHEN ユーザーがTopic_Config_Panelでトピック名を入力して追加ボタンを押した場合、THE Topic_Manager SHALL 入力されたトピック名からZenn RSSフィードURL（`https://zenn.dev/topics/{topic_name}/feed`）を生成し、新しいTopicConfigを作成する
2. WHEN 新しいトピックが追加された場合、THE Topic_Store SHALL トピック設定をlocalStorageに保存する
3. WHEN 新しいトピックが追加された場合、THE RSS_Fetcher SHALL 該当トピックのRSSフィードから記事を取得する
4. IF ユーザーが既に存在するトピック名を入力した場合、THEN THE Topic_Manager SHALL 重複エラーメッセージを表示し、追加を拒否する
5. IF ユーザーが空文字列または空白のみのトピック名を入力した場合、THEN THE Topic_Manager SHALL バリデーションエラーメッセージを表示し、追加を拒否する
6. THE Topic_Config_Panel SHALL トピック名の入力フィールドと追加ボタンを表示する

### 要件2: トピックの削除

**ユーザーストーリー:** ダッシュボードユーザーとして、不要なトピックを削除したい。関心のないトピックの記事を非表示にするため。

#### 受け入れ基準

1. WHEN ユーザーがTopic_Config_Panelでトピックの削除ボタンを押した場合、THE Topic_Manager SHALL 該当トピックをトピック一覧から削除する
2. WHEN トピックが削除された場合、THE Topic_Store SHALL 更新されたトピック設定をlocalStorageに保存する
3. WHEN トピックが削除された場合、THE Dashboard SHALL 該当トピックの記事を表示から除外する
4. WHEN トピックが削除された場合、THE Filter_Bar SHALL 該当トピックのフィルタオプションを除外する
5. THE Topic_Config_Panel SHALL 各トピックに対して削除ボタンを表示する

### 要件3: トピック設定の永続化

**ユーザーストーリー:** ダッシュボードユーザーとして、追加したトピック設定がブラウザを閉じても保持されてほしい。毎回トピックを再設定する手間を省くため。

#### 受け入れ基準

1. THE Topic_Store SHALL ユーザーが追加したトピック設定をlocalStorageにJSON形式で保存する
2. WHEN Dashboardが読み込まれた場合、THE Topic_Store SHALL localStorageから保存済みトピック設定を読み込む
3. WHEN localStorageにトピック設定が存在しない場合、THE Topic_Store SHALL Default_Topicsを初期値として使用する
4. IF localStorageのデータが破損している場合、THEN THE Topic_Store SHALL 警告をコンソールに記録し、Default_Topicsにフォールバックする
5. WHEN トピック設定が変更された場合（追加または削除）、THE Topic_Store SHALL 変更を即座にlocalStorageに反映する

### 要件4: 動的カラーコーディング

**ユーザーストーリー:** ダッシュボードユーザーとして、動的に追加されたトピックにも色が割り当てられてほしい。トピックを視覚的に区別できるようにするため。

#### 受け入れ基準

1. THE Color_Assigner SHALL Default_Topics（claudecode、skills、mcp、rag）に対して既存の固定カラー（紫、黄、青、緑）を維持する
2. WHEN 新しいトピックが追加された場合、THE Color_Assigner SHALL 事前定義されたカラーパレットから未使用の色を割り当てる
3. THE Color_Assigner SHALL バッジ、ボーダー、背景の3種類のカラークラスを各トピックに提供する
4. WHEN すべてのパレット色が使用済みの場合、THE Color_Assigner SHALL パレットの先頭から色を再利用する
5. THE Color_Assigner SHALL 同一トピックに対して常に同じ色を返す（決定的な割り当て）

### 要件5: 動的フィルタリング

**ユーザーストーリー:** ダッシュボードユーザーとして、動的に追加されたトピックでもフィルタリングしたい。特定のトピックの記事だけを閲覧できるようにするため。

#### 受け入れ基準

1. WHEN トピックが追加された場合、THE Filter_Bar SHALL 新しいトピックのフィルタボタンを自動的に表示する
2. WHEN トピックが削除された場合、THE Filter_Bar SHALL 該当トピックのフィルタボタンを自動的に非表示にする
3. THE Filter_Bar SHALL 動的に追加されたトピックに対してもColor_Assignerが割り当てた色を適用する
4. WHEN 動的トピックのフィルタボタンが選択された場合、THE Dashboard SHALL 該当トピックに一致する記事のみを表示する
5. THE Filter_Bar SHALL トピック名をフィルタボタンのラベルとして表示する

### 要件6: TopicType型の動的拡張

**ユーザーストーリー:** 開発者として、TopicTypeが動的なトピックに対応できるようにしたい。型安全性を維持しつつ任意のトピック名を扱えるようにするため。

#### 受け入れ基準

1. THE Dashboard SHALL TopicTypeを固定ユニオン型からstring型に変更し、動的なトピック名を受け入れる
2. THE Dashboard SHALL Default_Topicsの型定義を維持し、デフォルトトピックの識別に使用する
3. THE RSS_Fetcher SHALL 動的なTopicType値を持つTopicConfigを受け入れてRSSフィードを取得する
4. THE Topic_Manager SHALL トピック名を小文字に正規化してTopicType値として使用する

### 要件7: トピック管理UIパネル

**ユーザーストーリー:** ダッシュボードユーザーとして、トピックの追加・削除を直感的に操作できるUIがほしい。簡単にトピックを管理できるようにするため。

#### 受け入れ基準

1. THE Topic_Config_Panel SHALL Dashboard画面内にトピック管理セクションとして表示する
2. THE Topic_Config_Panel SHALL 現在登録されているすべてのトピックをリスト表示する
3. THE Topic_Config_Panel SHALL 各トピックにColor_Assignerが割り当てた色のバッジを表示する
4. THE Topic_Config_Panel SHALL Default_Topicsに対して「デフォルト」ラベルを表示する
5. WHEN ユーザーがトピック名入力フィールドにフォーカスした場合、THE Topic_Config_Panel SHALL プレースホルダーテキスト「例: nextjs, react, typescript」を表示する
6. THE Topic_Config_Panel SHALL アクセシビリティ要件を満たすaria属性を各操作要素に設定する

### 要件8: RSSフィード取得の動的対応

**ユーザーストーリー:** ダッシュボードユーザーとして、追加したトピックの記事がリアルタイムに取得されてほしい。新しいトピックの記事をすぐに閲覧できるようにするため。

#### 受け入れ基準

1. WHEN Dashboardが読み込まれた場合、THE RSS_Fetcher SHALL Topic_Storeから取得したすべてのトピック設定に基づいてRSSフィードを取得する
2. THE RSS_Fetcher SHALL 環境変数のトピック設定とlocalStorageのトピック設定をマージして使用する
3. IF RSSフィードの取得に失敗した場合、THEN THE RSS_Fetcher SHALL エラーをログに記録し、他のフィードの取得を継続する
4. THE RSS_Fetcher SHALL 動的に追加されたトピックのRSSフィードURLを`https://zenn.dev/topics/{topic_name}/feed`形式で生成する
5. WHEN 新しいトピックが追加された場合、THE Dashboard SHALL ページをリロードして新しいトピックの記事を取得する

### 要件9: トピック設定のシリアライズ・デシリアライズ

**ユーザーストーリー:** 開発者として、トピック設定のlocalStorage保存・読み込みが正確に行われることを保証したい。データの整合性を維持するため。

#### 受け入れ基準

1. THE Topic_Store SHALL トピック設定をJSON文字列にシリアライズしてlocalStorageに保存する
2. WHEN localStorageからトピック設定を読み込む場合、THE Topic_Store SHALL JSON文字列をTopicConfig配列にデシリアライズする
3. FOR ALL 有効なTopicConfig配列に対して、シリアライズしてからデシリアライズした結果は元のTopicConfig配列と等価である（ラウンドトリップ特性）
4. IF デシリアライズ結果が有効なTopicConfig配列でない場合、THEN THE Topic_Store SHALL バリデーションエラーとして処理し、Default_Topicsにフォールバックする
