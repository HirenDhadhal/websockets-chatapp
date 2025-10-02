export interface Message {
  email: string;
  text: string;
  timestamp: string;
}

export interface ActiveChatProps {
  // TODO => add chatsData
  messages: Record<string, Message[]>;
  activeChatId: number | null;
  onClose: () => void;
  socket: WebSocket | null;
}

export interface ChatListProps {
  onChatSelect: (id: number) => void;
}

export interface User {
  name: string;
  email: string;
  id: number;
  image: string;
  password?: string;
}

export interface ChatInformation {
    id: number;
    chatId: number;
    isGroup: boolean;
    chatName: string;
    createdAt: string;
    createdBy: string;
} 

export interface GroupChat {
  id: number;
  isGroup: boolean;
  chatName: string;
  chatId: number;
  createdAt: string;
  createdBy: string;
};

export interface newMessageFromWS {
  message: string;
  email: string;
  chatId: number;
  timestamp: string;
}

export interface NewChatProps {
  closeModal: () => void;
  top: number;
  left: number;
};

export interface NewChatModalProps {
  socket: WebSocket;
}