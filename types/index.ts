export interface SearchResult {
  url: string
  title: string
  domain: string
  summary?: string
  favicon?: string
}

export interface Citation {
  url: string
  title: string
  summary: string
}

export interface SimilarResult {
  url: string
  title: string
  domain: string
  summary?: string
  favicon?: string
}

export interface SearchResponse {
  question?: string
  answer?: string
  citations?: Citation[]
  results?: SearchResult[]
  similar?: SimilarResult[]
  relatedQueries?: string[]
  error?: string
}

export interface SearchParams {
  q: string
  include_domains?: string
  exclude_domains?: string
  recency_days?: number
  num_results?: number
}
