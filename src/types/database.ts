export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type RoomStatus = "waiting" | "ready" | "playing" | "finished";

export interface Database {
  public: {
    Tables: {
      questions: {
        Row: {
          id: string;
          grade: number;
          term: number;
          question_text: string;
          options: Json | null;
          correct_option_index: number | null;
          explanation: string;
          created_at: string;
          question_type: "multiple_choice" | "free_form";
          correct_answer: string | null;
          acceptable_answers: string[] | null;
          answer_unit: string | null;
          answer_type: "integer" | "decimal" | "fraction" | "text";
        };
        Insert: {
          id?: string;
          grade: number;
          term: number;
          question_text: string;
          options?: Json | null;
          correct_option_index?: number | null;
          explanation: string;
          created_at?: string;
          question_type?: "multiple_choice" | "free_form";
          correct_answer?: string | null;
          acceptable_answers?: string[] | null;
          answer_unit?: string | null;
          answer_type?: "integer" | "decimal" | "fraction" | "text";
        };
        Update: {
          id?: string;
          grade?: number;
          term?: number;
          question_text?: string;
          options?: Json | null;
          correct_option_index?: number | null;
          explanation?: string;
          created_at?: string;
          question_type?: "multiple_choice" | "free_form";
          correct_answer?: string | null;
          acceptable_answers?: string[] | null;
          answer_unit?: string | null;
          answer_type?: "integer" | "decimal" | "fraction" | "text";
        };
        Relationships: [];
      };
      rooms: {
        Row: {
          id: string;
          code: string;
          grade: number;
          term: number;
          max_players: number;
          questions_count: number;
          time_per_question_sec: number;
          question_ids: string[];
          status: RoomStatus;
          created_at: string;
          started_at: string | null;
          finished_at: string | null;
          expires_at: string;
          is_public: boolean;
          name: string | null;
        };
        Insert: {
          id?: string;
          code: string;
          grade: number;
          term: number;
          max_players?: number;
          questions_count?: number;
          time_per_question_sec?: number;
          question_ids: string[];
          status?: RoomStatus;
          created_at?: string;
          started_at?: string | null;
          finished_at?: string | null;
          expires_at?: string;
          is_public?: boolean;
          name?: string | null;
        };
        Update: {
          id?: string;
          code?: string;
          grade?: number;
          term?: number;
          max_players?: number;
          questions_count?: number;
          time_per_question_sec?: number;
          question_ids?: string[];
          status?: RoomStatus;
          created_at?: string;
          started_at?: string | null;
          finished_at?: string | null;
          expires_at?: string;
          is_public?: boolean;
          name?: string | null;
        };
        Relationships: [];
      };
      room_players: {
        Row: {
          id: string;
          room_id: string;
          device_id: string;
          nickname: string;
          is_ready: boolean;
          is_finished: boolean;
          current_question_index: number;
          score: number;
          total_time_ms: number;
          joined_at: string;
          finished_at: string | null;
          last_heartbeat: string;
          is_owner: boolean;
        };
        Insert: {
          id?: string;
          room_id: string;
          device_id: string;
          nickname: string;
          is_ready?: boolean;
          is_finished?: boolean;
          current_question_index?: number;
          score?: number;
          total_time_ms?: number;
          joined_at?: string;
          finished_at?: string | null;
          last_heartbeat?: string;
          is_owner?: boolean;
        };
        Update: {
          id?: string;
          room_id?: string;
          device_id?: string;
          nickname?: string;
          is_ready?: boolean;
          is_finished?: boolean;
          current_question_index?: number;
          score?: number;
          total_time_ms?: number;
          joined_at?: string;
          finished_at?: string | null;
          last_heartbeat?: string;
          is_owner?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: "room_players_room_id_fkey";
            columns: ["room_id"];
            referencedRelation: "rooms";
            referencedColumns: ["id"];
          },
        ];
      };
      answers: {
        Row: {
          id: string;
          room_id: string;
          player_id: string;
          question_id: string;
          question_index: number;
          selected_option_index: number | null;
          answer_text: string | null;
          is_correct: boolean;
          answer_time_ms: number;
          answered_at: string;
        };
        Insert: {
          id?: string;
          room_id: string;
          player_id: string;
          question_id: string;
          question_index: number;
          selected_option_index?: number | null;
          answer_text?: string | null;
          is_correct: boolean;
          answer_time_ms: number;
          answered_at?: string;
        };
        Update: {
          id?: string;
          room_id?: string;
          player_id?: string;
          question_id?: string;
          question_index?: number;
          selected_option_index?: number | null;
          answer_text?: string | null;
          is_correct?: boolean;
          answer_time_ms?: number;
          answered_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "answers_room_id_fkey";
            columns: ["room_id"];
            referencedRelation: "rooms";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "answers_player_id_fkey";
            columns: ["player_id"];
            referencedRelation: "room_players";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "answers_question_id_fkey";
            columns: ["question_id"];
            referencedRelation: "questions";
            referencedColumns: ["id"];
          },
        ];
      };
      question_reports: {
        Row: {
          id: string;
          question_id: string;
          room_id: string | null;
          player_id: string | null;
          report_type: string;
          report_text: string | null;
          selected_option_index: number | null;
          answer_text: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          question_id: string;
          room_id?: string | null;
          player_id?: string | null;
          report_type: string;
          report_text?: string | null;
          selected_option_index?: number | null;
          answer_text?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          question_id?: string;
          room_id?: string | null;
          player_id?: string | null;
          report_type?: string;
          report_text?: string | null;
          selected_option_index?: number | null;
          answer_text?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "question_reports_question_id_fkey";
            columns: ["question_id"];
            referencedRelation: "questions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "question_reports_room_id_fkey";
            columns: ["room_id"];
            referencedRelation: "rooms";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "question_reports_player_id_fkey";
            columns: ["player_id"];
            referencedRelation: "room_players";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
export type InsertTables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];
export type UpdateTables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];

// Convenience types
export type Question = Tables<"questions">;
export type Room = Tables<"rooms">;
export type Player = Tables<"room_players">;
export type Answer = Tables<"answers">;
export type QuestionReport = Tables<"question_reports">;
