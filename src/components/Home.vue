<template>
  <div flex flex-col items-center>
    <el-form w-screen pl5 pr5 :model="constraints" :inline="true">
      <el-form-item label="视频开关">
        <el-select
          v-model="constraints.video"
          size="small"
          placeholder="请选择视频开关"
        >
          <el-option
            v-for="item in VIDEO_TOGGLE"
            :key="item.label"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="音频开关">
        <el-select
          v-model="constraints.audio"
          size="small"
          placeholder="请选择音频开关"
        >
          <el-option
            v-for="item in AUDIO_TOGGLE"
            :key="item.label"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="分辨率">
        <el-select
          v-model="resolution.width"
          size="small"
          placeholder="请选择视频分辨率"
          @change="handleChangeResolution"
        >
          <el-option
            v-for="item in VIEDO_RESOLUTION"
            :key="item.label"
            :label="item.label"
            :value="item.value.width"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="选择麦克风">
        <el-select
          v-model="deviceInfo.audioId"
          size="small"
          placeholder="请选择视频分辨率"
          @change="handleChangeAudioDevice"
        >
          <el-option
            v-for="item in mediaDevices.audioIn"
            :key="item.deviceId"
            :label="item.label"
            :value="item.deviceId"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="选择摄像头">
        <el-select
          v-model="deviceInfo.videoId"
          size="small"
          placeholder="请选择视频分辨率"
          @change="handleChangeVideoDevice"
        >
          <el-option
            v-for="item in mediaDevices.videoIn"
            :key="item.deviceId"
            :label="item.label"
            :value="item.deviceId"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="选择摄像头模式">
        <el-select
          v-model="deviceInfo.facingMode"
          size="small"
          placeholder="请选择摄像头模式"
          @change="handleChangeFacingMode"
        >
          <el-option
            v-for="item in FACING_MODE"
            :key="item.value"
            :label="item.label"
            :value="item.value"
            :disabled="item.disabled"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="FPS">
        <el-input
          v-model="fps"
          size="small"
          placeholder="请输入FPS"
          @change="handleChangeFps"
        ></el-input>
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          :loading-icon="Eleme"
          :loading="btnLoading"
          @click="handleGetUserMedia"
        >
          获取用户媒体流
        </el-button>
      </el-form-item>
      <el-form-item>
        <el-button type="danger" @click="handleClose">关闭</el-button>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleCreateRoom">创建房间</el-button>
      </el-form-item>
    </el-form>
    <video
      v-loading="videoLoading"
      element-loading-text="Loading..."
      :element-loading-spinner="svg"
      element-loading-svg-view-box="-10, -10, 50, 50"
      element-loading-background="rgba(122, 122, 122, 0.8)"
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
import to from 'await-to-js';
import { ElMessage } from 'element-plus';
import { Eleme } from '@element-plus/icons-vue';
import { reactive, ref, onMounted } from 'vue';
import useGetUserMedia from '../hooks/useGetUserMedia';

interface Device {
  deviceId: string;
  kind: string;
  label: string;
}

interface DeviceInfo {
  audioId: string;
  videoId: string;
  facingMode: string;
}

interface MediaDevice {
  audioIn: Array<Device>;
  videoIn: Array<Device>;
  audioOut: Array<Device>;
}

const VIDEO_TOGGLE = [
  {
    label: '开启',
    value: true,
  },
  {
    label: '关闭',
    value: false,
  },
];

const AUDIO_TOGGLE = [
  {
    label: '开启',
    value: true,
  },
  {
    label: '关闭',
    value: false,
  },
];

const VIEDO_RESOLUTION = [
  {
    label: '全高清(1920*1080)',
    value: {
      width: 1920,
      height: 1080,
    },
  },
  {
    label: '高清(1280*720)',
    value: {
      width: 1280,
      height: 720,
    },
  },
  {
    label: 'SVGA(800*600)',
    value: {
      width: 800,
      height: 600,
    },
  },
  {
    label: 'VGA(640*480)',
    value: {
      width: 640,
      height: 480,
    },
  },
];

const FACING_MODE = [
  {
    label: '前置摄像头',
    value: 'user',
  },
  {
    label: '后置摄像头(移动端设备才支持)',
    value: 'environment',
    disabled: true,
  },
];

const svg = `
        <path class="path" d="
          M 30 15
          L 28 17
          M 25.61 25.61
          A 15 15, 0, 0, 1, 15 30
          A 15 15, 0, 1, 1, 27.99 7.5
          L 15 15
        " style="stroke-width: 4px; fill: rgba(0, 0, 0, 0)"/>
      `;

const constraints = reactive<MediaStreamConstraints>({
  video: true,
  audio: true,
});

const mediaDevices = reactive<MediaDevice>({
  audioIn: [],
  videoIn: [],
  audioOut: [],
});

const deviceInfo = reactive<DeviceInfo>({
  audioId: '',
  videoId: '',
  facingMode: '',
});

const resolution = ref({
  width: 1920,
  height: 1080,
});

const fps = ref(24);

const btnLoading = ref(false);

const videoLoading = ref(false);

let video = ref<HTMLVideoElement | null>(null);

const { stream, getStream, stopStream } = useGetUserMedia(constraints);

onMounted(async () => {
  await getEnumerateDevices();
  console.log('mediaDevices', mediaDevices);
  constraints.video = !!mediaDevices.videoIn.length;
  console.log('constraints', constraints);
});

const handleError = (error: Error) => {
  ElMessage.error('摄像头无法正常使用，请检查是否占用或缺失。');
  console.error('navigator.MediaDevices error: ', error.message, error.name);
};

const handleClose = () => {
  stopStream();
};

// const checkConstraintsValid = () => {
//   return constraints.video || constraints.audio;
// };

// const checkMediaDeviceSupported = () => {
//   return navigator.mediaDevices?.enumerateDevices;
// };

/**
 * @author liangjiasheng
 * @description 获取用户媒体流
 */
// const getUserMedia = async () => {
//   if (!checkMediaDeviceSupported()) {
//     ElMessage.error('浏览器不支持获取媒体设备。');
//     return;
//   }
//   if (!checkConstraintsValid()) {
//     ElMessage.error('constraints 中必须包含音视频轨道中的其中一员。');
//     mediaStream.value = null;
//     return;
//   }
//   const [err, stream] = await to(
//     navigator.mediaDevices.getUserMedia(constraints)
//   );
//   console.log('getUserMedia >>> err, res', err, stream);
//   if (err) return handleError(err);
//   return stream;
// };

/**
 * @author liangjiasheng
 * @description 获取媒体设备
 */
const getEnumerateDevices = async () => {
  await getStream();
  stopStream();
  // if (!stream)
  //   return ElMessage.warning(
  //     '请在获取用户媒体流前先授权并同意使用设备摄像头、麦克风。'
  //   );
  // stream.getTracks().forEach(track => {
  //   track.stop();
  // });
  const [err, devices] = await to(navigator.mediaDevices.enumerateDevices());
  console.log('getEnumerateDevices >>> err, res', err, devices);
  if (err) return handleError(err);
  devices.forEach(({ deviceId, kind, label }) => {
    switch (kind) {
      case 'audioinput':
        !mediaDevices.audioIn.find(i => i.deviceId === deviceId) &&
          mediaDevices.audioIn.push({ deviceId, kind, label });
        break;
      case 'audiooutput':
        !mediaDevices.audioOut.find(i => i.deviceId === deviceId) &&
          mediaDevices.audioOut.push({ deviceId, kind, label });
        break;
      case 'videoinput':
        !mediaDevices.videoIn.find(i => i.deviceId === deviceId) &&
          mediaDevices.videoIn.push({ deviceId, kind, label });
        break;
      default:
        break;
    }
  });
};

const handleGetUserMedia = async () => {
  await getStream();
  video.value!.srcObject = stream.value;
};

const handleChangeResolution = () => {
  constraints.video = resolution.value;
};

const handleChangeAudioDevice = (deviceId: string) => {
  constraints.audio = {
    advanced: [{ deviceId }],
  };
};

const handleChangeVideoDevice = (deviceId: string) => {
  constraints.video = {
    ...(typeof constraints.video !== 'boolean'
      ? constraints.video
      : resolution.value),
    advanced: [{ deviceId }],
  };
};

const handleChangeFps = () => {
  constraints.video = {
    ...(typeof constraints.video !== 'boolean'
      ? constraints.video
      : resolution.value),
    frameRate: { ideal: fps.value },
  };
};

const handleChangeFacingMode = (mode: string) => {
  const facingMode = mode === 'user' ? mode : { exact: 'environment' };
  constraints.video = {
    ...(typeof constraints.video !== 'boolean'
      ? constraints.video
      : resolution.value),
    facingMode,
  };
};

const handleCreateRoom = () => {
  window.room.create();
};
</script>
