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

export { VIDEO_TOGGLE, AUDIO_TOGGLE, VIEDO_RESOLUTION, FACING_MODE };
