export interface SearchResult {
  url: string
  title: string
  author?: string
  published_date?: string
  domain: string
  score?: number
  highlights?: string[]
  text?: string
}

export interface Citation {
  url: string
  title: string
}

export interface SimilarResult {
  url: string
  title: string
  domain: string
  highlights?: string[]
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
  highlights_per_url?: number
  include_text?: boolean
}
