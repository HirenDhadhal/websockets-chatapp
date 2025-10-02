import { create } from "zustand";
import { GroupChat, Message, User } from "../types/types";

type ChatStore = {
  allChatsOrder: number[];
  setAllChatsOrder: (order: number[]) => void;

  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;

  roomids: number[];
  setRoomids: (roomids: number[]) => void;

  allUsersMapping: Record<string, User> | null;
  setAllUsersMapping: (
    allUser: Record<string, User>
  ) => void;

  chatDetailsMap: Record<number, GroupChat>;
  setChatDetailsMap: (map: Record<number, GroupChat>) => void;

  activeChatId: number | null;
  setActiveChatId: (id: number | null) => void;

  isLoadingChats: boolean;
  setIsLoadingChats: (loading: boolean) => void;

  isLoadingMoreChats: boolean;
  setIsLoadingMoreChats: (loading: boolean) => void;

  allMessages: Record<string, Message[]>;
  setAllMessages: (messages: Record<string, Message[]>) => void;

  chatIdToTimestampMapping: [number, string][];
  setChatIdToTimestampMapping: (mapping: [number, string][]) => void;

  chatIdUserMapping: Record<number, string[]>;
  setChatIdUserMapping: (mapping: Record<number, string[]>) => void;

  showNewChatModal: boolean;
  setShowNewChatModal: (newChatModal: boolean) => void;

  createNewChat: boolean;
  setCreateNewChat: (newChat: boolean) => void;

  selectedUsers: User[];
  setSelectedUsers: (selectedusers: User[]) => void;
};

export const useChatStore = create<ChatStore>((set) => ({
  allChatsOrder: [],
  setAllChatsOrder: (order) => set({ allChatsOrder: order }),

  currentUser: null,
  setCurrentUser: (currentUser) => set({ currentUser }),

  roomids: [],
  setRoomids: (roomids) => set({ roomids }),

  allUsersMapping: null,
  setAllUsersMapping: (allUsersMapping) => set({ allUsersMapping }),

  chatDetailsMap: {},
  setChatDetailsMap: (map) => set({ chatDetailsMap: map }),

  activeChatId: null,
  setActiveChatId: (id) => set({ activeChatId: id }),

  isLoadingChats: false,
  setIsLoadingChats: (loading) => set({ isLoadingChats: loading }),

  isLoadingMoreChats: false,
  setIsLoadingMoreChats: (loading) => set({ isLoadingMoreChats: loading }),

  allMessages: {},
  setAllMessages: (messages) => set({ allMessages: messages }),

  chatIdToTimestampMapping: [],
  setChatIdToTimestampMapping: (mapping) =>
    set({ chatIdToTimestampMapping: mapping }),

  chatIdUserMapping: {},
  setChatIdUserMapping: (mapping) => set({ chatIdUserMapping: mapping }),

  showNewChatModal: false,
  setShowNewChatModal: (newChatModal) => set({showNewChatModal: newChatModal}),

  createNewChat: false,
  setCreateNewChat: (newChat) => set({createNewChat: newChat}),

  selectedUsers: [],
  setSelectedUsers: (selectedusers) => set({selectedUsers: selectedusers}),
}));
