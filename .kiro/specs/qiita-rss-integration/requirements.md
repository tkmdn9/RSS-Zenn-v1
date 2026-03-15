# 要件定義書

## はじめに

既存のZenn RSSダッシュボードにQiita RSSフィード取得機能を追加する。ユーザーはZennとQiitaをタブで切り替えて記事を閲覧でき、各ソースごとに独立したトピック管理（追加・削除）を行える。既存のZenn機能への影響を最小限に抑えつつ、同等の操作性をQiitaにも提供する。

## 用語集

- **Dashboard**: 記事一覧を表示するメインUI
- **Source**: 記事の取得元プラットフォーム（Zenn または Qiita）
- **Source_Tab**: ZennとQiitaを切り替えるためのタブUI
- **Topic_Store**: ソースごとのトピック設定をlocalStorageで永続化するストア
- **Topic_Config_Panel**: トピックの追加・削除を行うUIパネル
- **Filter_Bar**: トピックによる記事フィルタリングUI
- **Article_Grid**: 記事カードを一覧表示するグリッドUI
- **RSS_Fetcher**: RSSフィードから記事を取得・パースするモジュール
- **Article_Normalizer**: RSSアイテムを統一フォーマットに正規化するモジュール
- **TopicConfig**: トピックの名前・URL・タイプを持つ設定オブジェクト
- **ArticleSource**: ソース種別を表す型（`'zenn'` | `'qiita'`）

## 要件

### 要件 1: ソース種別のデータモデル追加

**ユーザーストーリー:** 開発者として、記事やトピックにソース種別を持たせたい。ZennとQiitaの記事・トピックを区別して管理できるようにするため。

#### 受け入れ基準

1. THE Dashboard SHALL define an ArticleSource type that accepts the values `'zenn'` and `'qiita'`
2. THE TopicConfig SHALL include a `source` field of type ArticleSource to identify the originating platform
3. THE Dashboard SHALL maintain backward compatibility with existing TopicConfig data that lacks a `source` field by defaulting to `'zenn'`

### 要件 2: Qiita RSSフィード取得

**ユーザーストーリー:** ユーザーとして、QiitaのRSSフィードから記事を取得したい。Qiitaの最新記事もダッシュボードで閲覧できるようにするため。

#### 受け入れ基準

1. WHEN a Qiita topic is configured, THE RSS_Fetcher SHALL fetch articles from the URL pattern `https://qiita.com/tags/{tag}/feed`
2. WHEN a Zenn topic is configured, THE RSS_Fetcher SHALL fetch articles from the URL pattern `https://zenn.dev/topics/{name}/feed`
3. WHEN a Qiita RSS feed is unavailable, THE RSS_Fetcher SHALL log the error and continue fetching from other configured feeds
4. THE Article_Normalizer SHALL normalize Qiita RSS items into the same ZennArticle format used for Zenn articles
5. THE RSS_Fetcher SHALL deduplicate articles by link within the same source

### 要件 3: Qiitaデフォルトトピック

**ユーザーストーリー:** ユーザーとして、Qiitaの初期表示時にデフォルトのタグが設定されていてほしい。初回利用時にすぐ記事を閲覧できるようにするため。

#### 受け入れ基準

1. WHEN the Qiita source is loaded for the first time, THE Topic_Store SHALL provide the following default topics: RAG (`rag`), MCP (`mcp`), AgentSkills (`agentskills`), Claude Code (`claudecode`)
2. THE Topic_Store SHALL use the URL `https://qiita.com/tags/rag/feed` for the RAG default topic
3. THE Topic_Store SHALL use the URL `https://qiita.com/tags/mcp/feed` for the MCP default topic
4. THE Topic_Store SHALL use the URL `https://qiita.com/tags/agentskills/feed` for the AgentSkills default topic
5. THE Topic_Store SHALL use the URL `https://qiita.com/tags/claudecode/feed` for the Claude Code default topic
6. THE Topic_Store SHALL persist Qiita default topics independently from Zenn default topics

### 要件 4: ソース別タブUI

**ユーザーストーリー:** ユーザーとして、ZennとQiitaをタブで切り替えたい。各プラットフォームの記事を整理して閲覧できるようにするため。

#### 受け入れ基準

1. THE Source_Tab SHALL display two tabs labeled "Zenn" and "Qiita"
2. WHEN the Dashboard loads, THE Source_Tab SHALL display the "Zenn" tab as the active tab
3. WHEN the user selects a tab, THE Source_Tab SHALL switch the displayed content to the selected source
4. WHEN the user switches tabs, THE Dashboard SHALL display the Topic_Config_Panel, Filter_Bar, and Article_Grid corresponding to the selected source
5. WHEN the user switches tabs, THE Dashboard SHALL preserve the topic configuration and filter state of the previously active tab
6. THE Source_Tab SHALL visually indicate the currently active tab

### 要件 5: ソース別トピック管理

**ユーザーストーリー:** ユーザーとして、ZennとQiitaそれぞれで独立してトピックを追加・削除したい。各プラットフォームのトピックを個別に管理できるようにするため。

#### 受け入れ基準

1. THE Topic_Store SHALL maintain separate topic lists for Zenn and Qiita
2. WHEN the user adds a topic on the Zenn tab, THE Topic_Store SHALL generate the URL using the pattern `https://zenn.dev/topics/{name}/feed`
3. WHEN the user adds a topic on the Qiita tab, THE Topic_Store SHALL generate the URL using the pattern `https://qiita.com/tags/{name}/feed`
4. WHEN the user removes a topic on one source tab, THE Topic_Store SHALL remove the topic only from that source
5. THE Topic_Store SHALL persist Zenn topics and Qiita topics separately in localStorage
6. WHEN the user adds a topic that already exists in the current source, THE Topic_Store SHALL return an error indicating the topic is already added
7. THE Topic_Config_Panel SHALL display the same add/remove UI for both Zenn and Qiita sources

### 要件 6: ソース別記事取得・表示

**ユーザーストーリー:** ユーザーとして、選択中のソースの記事のみを表示したい。ZennとQiitaの記事が混在せず、整理された状態で閲覧できるようにするため。

#### 受け入れ基準

1. WHEN the Zenn tab is active, THE Dashboard SHALL fetch and display articles only from Zenn topics
2. WHEN the Qiita tab is active, THE Dashboard SHALL fetch and display articles only from Qiita topics
3. WHEN the user switches tabs, THE Dashboard SHALL fetch articles for the newly selected source
4. THE Filter_Bar SHALL filter articles only within the currently active source
5. THE Article_Grid SHALL display articles sorted by publication date in descending order within the active source

### 要件 7: ソース別localStorage永続化

**ユーザーストーリー:** 開発者として、ZennとQiitaのトピック設定を別々にlocalStorageへ保存したい。ブラウザリロード後も各ソースの設定が独立して復元されるようにするため。

#### 受け入れ基準

1. THE Topic_Store SHALL use separate localStorage keys for Zenn topics and Qiita topics
2. WHEN Zenn topics are modified, THE Topic_Store SHALL serialize and save Zenn topics without affecting Qiita topics
3. WHEN Qiita topics are modified, THE Topic_Store SHALL serialize and save Qiita topics without affecting Zenn topics
4. WHEN the Dashboard loads, THE Topic_Store SHALL deserialize and restore both Zenn and Qiita topics from localStorage
5. IF localStorage data for a source is corrupted, THEN THE Topic_Store SHALL fall back to the default topics for that source without affecting the other source

### 要件 8: APIエンドポイントのソース対応

**ユーザーストーリー:** 開発者として、APIエンドポイントがソース情報を含むTopicConfigを受け取れるようにしたい。クライアントからソース別の記事取得リクエストを処理できるようにするため。

#### 受け入れ基準

1. THE API endpoint SHALL accept TopicConfig arrays that include the `source` field
2. THE API endpoint SHALL validate that each TopicConfig contains a valid `source` field
3. WHEN TopicConfig without a `source` field is received, THE API endpoint SHALL treat the source as `'zenn'` for backward compatibility
