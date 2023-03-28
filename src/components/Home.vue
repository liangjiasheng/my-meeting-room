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
        <el-button type="primary" @click="handleGetUserMedia">
          获取用户媒体流
        </el-button>
      </el-form-item>
      <el-form-item>
        <el-button type="danger" @click="handleClose">关闭</el-button>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleCreateUser">创建房间</el-button>
      </el-form-item>
    </el-form>
    <video
      v-show="stream"
      w-100
      h-50
      ref="video"
      autoplay
      controls
      muted
    ></video>

    <el-form w-screen pl5 pr5 :model="userInfo" :inline="true">
      <el-form-item label="房间号">
        <el-input
          v-model="userInfo.roomId"
          size="small"
          placeholder="请输入房间号"
        ></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleCreateUser">创建房间</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import to from 'await-to-js';
import { ElMessage } from 'element-plus';
import { reactive, ref, onMounted } from 'vue';
import { useUserMedia } from '@/hooks/useUserMedia';
import {
  VIDEO_TOGGLE,
  AUDIO_TOGGLE,
  VIEDO_RESOLUTION,
  FACING_MODE,
} from '@/constants';

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

const userInfo = reactive({
  roomId: '',
});

const resolution = ref({
  width: 1920,
  height: 1080,
});

const fps = ref(24);

const video = ref<HTMLVideoElement | null>(null);

const { stream, getStream, stopStream } = useUserMedia(constraints);

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
  if (video.value) {
    video.value.srcObject = null;
  }
};

/**
 * @author liangjiasheng
 * @description 获取媒体设备
 */
const getEnumerateDevices = async () => {
  await getStream();
  stopStream();
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

const handleCreateUser = () => {
  window.user.create(new URLSearchParams(userInfo).toString());
};
</script>
