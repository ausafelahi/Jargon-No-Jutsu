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
      user_streaks: {
        Row: {
          user_id: string;
          current_streak: number;
          longest_streak: number;
          last_active_date: string | null;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          current_streak?: number;
          longest_streak?: number;
          last_active_date?: string | null;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["user_streaks"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "user_streaks_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      theory_articles: {
        Row: {
          id: string;
          concept: string;
          title: string;
          content: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          concept: string;
          title: string;
          content: string;
          created_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["theory_articles"]["Insert"]
        >;
        Relationships: [];
      };
      quiz_questions: {
        Row: {
          id: string;
          concept: string;
          question: string;
          options: string[];
          correct_index: number;
          explanation: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          concept: string;
          question: string;
          options: string[];
          correct_index: number;
          explanation: string;
          created_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["quiz_questions"]["Insert"]
        >;
        Relationships: [];
      };
      quiz_attempts: {
        Row: {
          id: string;
          user_id: string;
          question_id: string;
          selected_index: number;
          was_correct: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          question_id: string;
          selected_index: number;
          was_correct: boolean;
          created_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["quiz_attempts"]["Insert"]
        >;
        Relationships: [
          {
            foreignKeyName: "quiz_attempts_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "quiz_attempts_question_id_fkey";
            columns: ["question_id"];
            isOneToOne: false;
            referencedRelation: "quiz_questions";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: {
      check_rate_limit: {
        Args: { p_key: string; p_limit: number; p_window_seconds: number };
        Returns: boolean;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

export type Lesson = Database["public"]["Tables"]["lessons"]["Row"];
export type Bookmark = Database["public"]["Tables"]["bookmarks"]["Row"];
export type Subscriber = Database["public"]["Tables"]["subscribers"]["Row"];
export type UserStreak = Database["public"]["Tables"]["user_streaks"]["Row"];
export type TheoryArticle =
  Database["public"]["Tables"]["theory_articles"]["Row"];
export type QuizQuestion =
  Database["public"]["Tables"]["quiz_questions"]["Row"];
export type QuizAttempt = Database["public"]["Tables"]["quiz_attempts"]["Row"];
