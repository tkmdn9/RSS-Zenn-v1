// app/api/articles/route.ts

import { fetchArticles } from '@/lib/fetchArticles';
import { validateTopicConfigs } from '@/lib/topicSerializer';
import type { TopicConfig } from '@/types/article';
import type { FetchArticlesResult } from '@/lib/fetchArticles';

/**
 * GET /api/articles エンドポイント
 * 
 * クエリパラメータ`topics`でTopicConfig配列を受け取り、動的トピックに対応
 */
export async function GET(request: Request): Promise<Response> {
  try {
    const url = new URL(request.url);
    const topicsParam = url.searchParams.get('topics');

    let topicConfigs: TopicConfig[] | undefined;
    if (topicsParam) {
      try {
        const parsed = JSON.parse(topicsParam);
        if (!validateTopicConfigs(parsed)) {
          return Response.json({ error: 'Invalid topics parameter' }, { status: 400 });
        }
        // sourceフィールドが無い場合は'zenn'をデフォルト設定（要件8.3: 後方互換）
        topicConfigs = (parsed as TopicConfig[]).map((topic) => ({
          ...topic,
          source: topic.source ?? 'zenn',
        }));
      } catch {
        return Response.json({ error: 'Invalid JSON in topics parameter' }, { status: 400 });
      }
    }

    const result: FetchArticlesResult = await fetchArticles(topicConfigs);
    return Response.json(result);
  } catch (error) {
    console.error('API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch articles';
    return Response.json({ error: errorMessage }, { status: 500 });
  }
}
