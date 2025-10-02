import React, { useRef, useEffect } from "react";
import { useChatStore } from "../store/chatStore";
import NewChatModal from "./NewChatModal";

const ChatListHeader: React.FC = () => {
  const newChatButtonRef = useRef<HTMLButtonElement>(null);
  const showNewChatModal = useChatStore((state) => state.showNewChatModal);
  const setShowNewChatModal = useChatStore.getState().setShowNewChatModal;

  const handleNewChatClick = () => {
    setShowNewChatModal(true);
  };

  const closeModal = () => {
    setShowNewChatModal(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (showNewChatModal && !target?.closest(".new-chat-modal")) {
        closeModal();
      }
    };

    if (showNewChatModal) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showNewChatModal]);

  return (
    <>
      <div className="p-4 px-5 border-b border-slate-200 bg-slate-50 font-semibold text-slate-800 flex items-center justify-between">
        Chats
        <div className="flex flex-row gap-4">
          <button
            ref={newChatButtonRef}
            onClick={handleNewChatClick}
            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-lg text-sm font-medium transition-colors"
          >
            New Chat
          </button>
        </div>
      </div>

      {showNewChatModal && newChatButtonRef.current && (
        <NewChatModal
          closeModal={closeModal}
          top={newChatButtonRef.current.getBoundingClientRect().bottom + 8}
          left={newChatButtonRef.current.getBoundingClientRect().left}
        />
      )}

      {showNewChatModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-40"
          onClick={closeModal}
        />
      )}
    </>
  );
};

export default ChatListHeader;