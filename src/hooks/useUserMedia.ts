import { ElMessage } from 'element-plus';
import to from 'await-to-js';
import { ref } from 'vue';

const checkMediaDeviceSupported = () => {
  return navigator.mediaDevices?.enumerateDevices;
};

const checkConstraintsValid = (constraints: MediaStreamConstraints) => {
  return constraints.video || constraints.audio;
};

/**
 * @author liangjiasheng
 * @description 获取用户媒体流
 */
export const useUserMedia = (
  constraints: MediaStreamConstraints = { audio: true, video: true }
) => {
  const stream = ref<MediaStream | null>(null);

  const getStream = async () => {
    if (!checkMediaDeviceSupported()) {
      ElMessage.error('浏览器不支持获取媒体设备。');
      throw new Error('浏览器不支持获取媒体设备。');
    }
    if (!checkConstraintsValid(constraints)) {
      ElMessage.error('constraints 中必须包含音视频轨道中的其中一员。');
      throw new Error('constraints 中必须包含音视频轨道中的其中一员。');
    }
    const [err, res] = await to(
      navigator.mediaDevices.getUserMedia(constraints)
    );
    if (err) {
      throw err;
    }
    stream.value = res;
  };

  const stopStream = () => {
    if (stream.value) {
      stream.value.getTracks().forEach(track => {
        track.stop();
      });
      stream.value = null;
    }
  };

  return {
    stream,
    getStream,
    stopStream,
  };
};
