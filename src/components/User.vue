<template>
  <div>
    <video
      v-show="stream"
      w-100
      h-50
      ref="video"
      autoplay
      controls
      muted
    ></video>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useUserMedia } from '@/hooks/useUserMedia';
import { useSocket } from '@/hooks/useSocket';
import { v4 as uuidv4 } from 'uuid';
import { useRouter } from 'vue-router';

const router = useRouter();
const { stream, getStream, stopStream } = useUserMedia();
const { socket, init } = useSocket();

const video = ref<HTMLVideoElement | null>(null);

const { roomId } = router.currentRoute.value.query as Record<string, string>;

console.log('roomId', roomId);

onMounted(async () => {
  init({
    userId: uuidv4(),
    roomId: roomId || '10011',
    nickname: uuidv4(),
  });
  onSocketEvent();
  await getStream();
  video.value!.srcObject = stream.value;
});

const onSocketEvent = () => {
  socket.value?.on('connect', () => {
    console.log('连接成功✅');
  });
  socket.value?.on('msg', ({ type, msg, data }) => {
    console.log(`消息 >>> 类型：${type}，内容：${msg}`);
    switch (type) {
      case 'join':
      case 'leave':
        socket.value?.emit('roomUsers', { roomId });
        break;

      default:
        break;
    }
  });
  socket.value?.on('error', e => {
    console.log('连接报错❎', e);
  });
  socket.value?.on('roomUsers', users => {
    console.log('房间用户 >>>', users);
  });
};
</script>
