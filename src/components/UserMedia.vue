<template>
  <div flex flex-col items-center>
    <el-form w-screen pl5 pr5 :model="constraints" :inline="true">
      <el-form-item label="视频开关">
        <el-select v-model="constraints.video" size="small" placeholder="请选择视频开关" @change="handleChangeConstraints">
          <el-option v-for="item in VIDEO_TOGGLE" :key="item.label" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="音频开关">
        <el-select v-model="constraints.audio" size="small" placeholder="请选择音频开关" @change="handleChangeConstraints">
          <el-option v-for="item in AUDIO_TOGGLE" :key="item.label" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="分辨率">
        <el-select v-model="resolution.width" size="small" placeholder="请选择视频分辨率" @change="handleChangeResolution">
          <el-option v-for="item in VIEDO_RESOLUTION" :key="item.label" :label="item.label" :value="item.value.width" />
        </el-select>
      </el-form-item>
      <el-form-item v-if="mediaStream">
        <el-button type="danger" @click="handleClose">
          关闭
        </el-button>
      </el-form-item>
      <el-form-item v-else>
        <el-button type="primary" :loading-icon="Eleme" :loading="btnLoading" @click="handleGetUserMedia">
          获取用户媒体
        </el-button>
      </el-form-item>
    </el-form>
    <video v-loading="videoLoading" element-loading-text="Loading..." :element-loading-spinner="svg"
      element-loading-svg-view-box="-10, -10, 50, 50" element-loading-background="rgba(122, 122, 122, 0.8)"
      v-show="mediaStream" ref="video" autoplay controls muted></video>

  </div>
</template>

<script setup lang="ts">
import to from "await-to-js";
import { ElMessage } from "element-plus";
import { Eleme } from '@element-plus/icons-vue'
import { reactive, ref, onMounted } from "vue";

interface MediaDevice {
  audioIn: Array<any>,
  videoIn: Array<any>,
  audioOut: Array<any>,
}

const VIDEO_TOGGLE = [{
  label: '开启',
  value: true
}, {
  label: '关闭',
  value: false
}];

const AUDIO_TOGGLE = [{
  label: '开启',
  value: true
}, {
  label: '关闭',
  value: false
}];

const VIEDO_RESOLUTION = [{
  label: '全高清(1920*1080)',
  value: {
    width: 1920,
    height: 1080
  }
}, {
  label: '高清(1280*720)',
  value: {
    width: 1280,
    height: 720
  }
}, {
  label: 'SVGA(800*600)',
  value: {
    width: 800,
    height: 600
  }
}, {
  label: 'VGA(640*480)',
  value: {
    width: 640,
    height: 480
  }
}];

const svg = `
        <path class="path" d="
          M 30 15
          L 28 17
          M 25.61 25.61
          A 15 15, 0, 0, 1, 15 30
          A 15 15, 0, 1, 1, 27.99 7.5
          L 15 15
        " style="stroke-width: 4px; fill: rgba(0, 0, 0, 0)"/>
      `

const constraints = reactive<MediaStreamConstraints>({ video: true, audio: true })

const mediaDevices = reactive<MediaDevice>({
  audioIn: [],
  videoIn: [],
  audioOut: [],
});

const resolution = ref({
  width: 1920,
  height: 1080
})

let mediaStream = ref<MediaStream | null>(null);

const btnLoading = ref(false);

const videoLoading = ref(false);

let video = ref<HTMLVideoElement | null>(null);

onMounted(async () => {
  await getEnumerateDevices();
  console.log('mediaDevices', mediaDevices);
  constraints.video = !!mediaDevices.videoIn.length;
  console.log('constraints', constraints)
});

const handleError = (error: Error) => {
  ElMessage.error('摄像头无法正常使用，请检查是否占用或缺失。');
  console.error('navigator.MediaDevices.getUserMedia error: ', error.message, error.name);
}

const handleClose = () => {
  mediaStream.value = null;
}

/**
 * @author liangjiasheng
 * @description 获取用户媒体流
 */
const getUserMedia = async () => {
  if (!navigator.mediaDevices?.enumerateDevices) {
    ElMessage.error('浏览器不支持获取媒体设备。');
    return;
  }
  const [err, stream] = await to(navigator.mediaDevices.getUserMedia(constraints));
  console.log('getUserMedia >>> err, res', err, stream);
  if (err) return handleError(err);
  return stream;
}

/**
 * @author liangjiasheng
 * @description 获取媒体设备
 */
const getEnumerateDevices = async () => {
  const stream = await getUserMedia();
  if (!stream) return ElMessage.warning('请在获取用户媒体前先授权并同意使用设备摄像头、麦克风。');
  stream.getTracks().forEach(track => {
    track.stop();
  })
  const [err, devices] = await to(navigator.mediaDevices.enumerateDevices());
  console.log('getEnumerateDevices >>> err, res', err, devices);
  if (err) return handleError(err);
  devices.forEach(({ deviceId, kind, label }) => {
    switch (kind) {
      case 'audioinput':
        !mediaDevices.audioIn.find(i => i.id === deviceId) && mediaDevices.audioIn.push({ deviceId, kind, label });
        break;
      case 'audiooutput':
        !mediaDevices.audioOut.find(i => i.id === deviceId) && mediaDevices.audioOut.push({ deviceId, kind, label });
        break;
      case 'videoinput':
        !mediaDevices.videoIn.find(i => i.id === deviceId) && mediaDevices.videoIn.push({ deviceId, kind, label });
        break;
      default:
        break;
    }
  });
}

const setUserMedia = async () => {
  const stream = await getUserMedia();
  if (!stream) return ElMessage.warning('请在获取用户媒体前先授权并同意使用设备摄像头、麦克风。');
  mediaStream.value = video.value!.srcObject = stream;
}

const handleGetUserMedia = async () => {
  btnLoading.value = true;
  await setUserMedia();
  btnLoading.value = false
}

const handleChangeConstraints = async () => {
  videoLoading.value = true;
  await setUserMedia();
  videoLoading.value = false
}

const handleChangeResolution = () => {
  constraints.video = resolution.value;
  handleChangeConstraints()
}
</script>
