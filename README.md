# Web API Only で Video から Image をキャプチャするデモ

デモ画面：About にあります

## HTML

```html
<!-- view port -->
<div class="viewport">
  <!-- camera contents -->
  <canvas></canvas>
  <video autoplay playsinline></video>
  <canvas class="image-buffer"></canvas>
</div>
```

## javascript

### VideoStream の取得

```javascript
const constraints = {
  audio: false,
  video: {
    // VideoStreamの幅{最小、希望、最大}
    width: { min: 160, ideal: 2400, max: 10240 },

    // VdeoStreamの高さ{最小、希望、最大}
    height: { min: 120, ideal: 1440, max: 4320 },

    // 希望するカメラデバイス
    // user ... フロントカメラ
    // environment ... メインカメラ（バックカメラ）
    facingMode: "environment",

    // 希望する縦横比
    aspectRatio: { ideal: 16 / 9 },

    //フレームレート (fps){最小、希望、最大}
    frameRate: { min: 1, ideal: 16, max: 30 },
  },
};

/** @type {HTMLDivElement} */
const viewport = document.querySelector(".viewport");
/** @type {HTMLVideoElement} */
const video = viewport.querySelector(":scope>video");
/** @type {HTMLCanvasElement} */
const imageBuffer = viewport.querySelector(":scope>canvas.image-buffer");

/** @type {MediaStream} */
const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);

// video に転送
video.srcObject = mediaStream;

mediaStream.getVideoTracks().find((videoStreamTrack) => {
  // 有効化
  track.enabled = false;

  // 実際に取得された VideoStream の設定内容
  const settings = track.getSettings();

  // dom の setup 等
  imageBuffer.width = setting.width;
  imageBuffer.height = setting.height;
});
```

### VideoStream の 一時停止

```javascript
mediaStream.getVideoTracks().forEach((videoStreamTrack) => {
  // 無効化
  videoStreamTrack.enabled = false;
});
```

### VideoStream の 終了

```javascript
mediaStream.getVideoTracks().forEach((videoStreamTrack) => {
  // 有効化
  videoStreamTrack.enabled = true;

  // 停止
  videoStreamTrack.stop();
});
```

### VideoStream の キャプチャ

```javascript
// VideoStream を一時停止
mediaStream.getVideoTracks().forEach((videoStreamTrack) => {
  // 無効化
  videoStreamTrack.enabled = false;
});

// canvas 要素
const context = imageBuffer.getContext("2d");

// canvas のサイズ
const size = {
  width: Math.floor(imageBuffer.width),
  height: Math.floor(imageBuffer.height),
};

// canvas を クリア（全面）
context.clearRect(0, 0, size.width, size.height);

// 停止中のvideoをcanvasに転写
context.drawImage(video, 0, 0, size.width, size.height);
```

# 参考

[MediaDevices.getUserMedia | MDN](https://developer.mozilla.org/ja/docs/Web/API/MediaDevices/getUserMedia)
