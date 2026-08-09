export interface Database {
  public: {
    Tables: {
      users: {
        Row: { id: string; email: string; created_at: string };
        Insert: { id: string; email: string; created_at?: string };
        Update: { email?: string };
        Relationships: [];
      };
      lessons: {
        Row: {
          id: string;
          character_name: string;
          anime_name: string;
          image_url: string | null;
          concept: string;
          lesson: string;
          career_advice: string;
          tier: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          character_name: string;
          anime_name: string;
          image_url?: string | null;
          concept: string;
          lesson: string;
          career_advice: string;
          tier?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["lessons"]["Insert"]>;
        Relationships: [];
      };
      bookmarks: {
        Row: {
          id: string;
          user_id: string;
          lesson_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          lesson_id: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["bookmarks"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "bookmarks_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "bookmarks_lesson_id_fkey";
            columns: ["lesson_id"];
            isOneToOne: false;
            referencedRelation: "lessons";
            referencedColumns: ["id"];
          },
        ];
      };
      subscribers: {
        Row: { id: string; email: string; subscribed_at: string };
        Insert: { id?: string; email: string; subscribed_at?: string };
        Update: Partial<Database["public"]["Tables"]["subscribers"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

export type Lesson = Database["public"]["Tables"]["lessons"]["Row"];
export type Bookmark = Database["public"]["Tables"]["bookmarks"]["Row"];
export type Subscriber = Database["public"]["Tables"]["subscribers"]["Row"];
