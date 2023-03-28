import { ref } from 'vue';
import { io } from 'socket.io-client';
import type { Socket } from 'socket.io-client';

interface UserInfo {
  userId: string;
  roomId: string;
  nickname: string;
}

const url = import.meta.env.VITE_SOCKET_URL;

export const useSocket = () => {
  const socket = ref<Socket | null>(null);

  const init = ({ userId, roomId, nickname }: UserInfo) => {
    socket.value = io(url, {
      reconnectionDelayMax: 10000,
      transports: ['websocket'],
      query: {
        userId,
        roomId,
        nickname,
      },
    });
  };

  return {
    socket,
    init,
  };
};
