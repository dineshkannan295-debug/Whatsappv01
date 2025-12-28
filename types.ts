
export interface Profile {
  id: string;
  phone?: string;
  email?: string;
  display_name: string;
  about?: string;
  avatar_url: string;
  is_online: boolean;
  last_seen: string;
}

export interface Chat {
  id: string;
  created_at: string;
  is_group: boolean;
  group_name?: string;
  group_avatar?: string;
  participants: Profile[];
  last_message?: Message;
  unread_count: number;
}

export type MessageType = 'text' | 'image' | 'video' | 'audio' | 'file';
export type MessageStatusValue = 'sent' | 'delivered' | 'seen';

export interface Message {
  id: string;
  chat_id: string;
  sender_id: string;
  content: string;
  message_type: MessageType;
  status: MessageStatusValue;
  created_at: string;
  media_url?: string;
}

export interface AuthState {
  user: Profile | null;
  isLoading: boolean;
}
