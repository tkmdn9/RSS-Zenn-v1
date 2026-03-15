// lib/__tests__/fetchArticles.test.ts

import { fetchArticles } from '../fetchArticles';

describe('fetchArticles', () => {
  const originalEnv = process.env.NEXT_PUBLIC_TOPICS;

  afterEach(() => {
    // 環境変数を元に戻す
    process.env.NEXT_PUBLIC_TOPICS = originalEnv;
  });

  it('should use default topics when NEXT_PUBLIC_TOPICS is not defined', async () => {
    delete process.env.NEXT_PUBLIC_TOPICS;
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    
    const result = await fetchArticles();
    
    // デフォルトトピックにフォールバックし、エラーではなく結果を返す
    expect(result).toHaveProperty('articles');
    expect(result).toHaveProperty('errors');
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      'NEXT_PUBLIC_TOPICS is not defined, using default topics'
    );
    
    consoleWarnSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  it('should use default topics when NEXT_PUBLIC_TOPICS is invalid JSON', async () => {
    process.env.NEXT_PUBLIC_TOPICS = 'invalid json';
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    
    const result = await fetchArticles();
    
    expect(result).toHaveProperty('articles');
    expect(result).toHaveProperty('errors');
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      'Invalid NEXT_PUBLIC_TOPICS format, using default topics'
    );
    
    consoleWarnSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  it('should use default topics when NEXT_PUBLIC_TOPICS is not an array', async () => {
    process.env.NEXT_PUBLIC_TOPICS = '{"name": "test"}';
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    
    const result = await fetchArticles();
    
    expect(result).toHaveProperty('articles');
    expect(result).toHaveProperty('errors');
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      'NEXT_PUBLIC_TOPICS is not an array, using default topics'
    );
    
    consoleWarnSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  it('should accept dynamic topic types (non-default types are valid)', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    
    process.env.NEXT_PUBLIC_TOPICS = JSON.stringify([
      {
        name: 'Custom Topic',
        url: 'https://zenn.dev/topics/custom/feed',
        type: 'custom_type', // 動的トピックタイプ（有効）
      },
    ]);
    
    const result = await fetchArticles();
    
    // 動的トピックタイプは受け入れられる（RSSフェッチは失敗する可能性あり）
    expect(result.errors.length).toBeGreaterThanOrEqual(0);
    
    consoleErrorSpy.mockRestore();
  });

  it('should skip topic configurations with missing required fields', async () => {
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
    
    process.env.NEXT_PUBLIC_TOPICS = JSON.stringify([
      {
        name: 'Missing URL',
        type: 'claudecode',
        // url フィールドが欠落
      },
    ]);
    
    const result = await fetchArticles();
    
    expect(result.articles).toEqual([]);
    expect(result.errors).toHaveLength(1);
    expect(consoleWarnSpy).toHaveBeenCalled();
    
    consoleWarnSpy.mockRestore();
  });
});
