declare module 'sentiment' {
  interface SentimentResult {
    score: number;
    comparative: number;
    calculation: Record<string, number>;
    tokens: string[];
    words: string[];
    positive: string[];
    negative: string[];
  }

  interface Options {
    extras?: Record<string, number>;
    language?: string;
  }

  class Sentiment {
    constructor(options?: Options);
    analyze(phrase: string | string[], options?: Options): SentimentResult;
  }

  export = Sentiment;
} 