export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      news: {
        Row: {
          id: string
          title: string
          url: string
          date: string
          category: string
          category_en: string | null
          source: string
          source_en: string | null
          image_url: string | null
          scraped_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          url: string
          date: string
          category: string
          category_en?: string | null
          source: string
          source_en?: string | null
          image_url?: string | null
          scraped_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          url?: string
          date?: string
          category?: string
          category_en?: string | null
          source?: string
          source_en?: string | null
          image_url?: string | null
          scraped_at?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
