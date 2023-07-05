const DEFAULT = {
  DOM: {
    target: ".viewport",
  },
  CONSTRAINS: {
    video: {
      width: 1280,
      height: 720,
    },
  },
};

module.exports = (
  target = DEFAULT.DOM.target,
  constraints = DEFAULT.CONSTRAINS
) => {
  const dom = {
    target,
    /** @type {HTMLElement} */
    viewport: null,
    /** @type {HTMLVideoElement} */
    video: null,
    /** @type {HTMLCanvasElement} */
    canvas: null,
  };

  const initDom = (target) => {
    /**
     * @type {HTMLElement}
     */
    let viewport;

    if (!target) {
      viewport = document.querySelector(".viewport");
    } else if (typeof target === "string") {
      viewport = document.querySelector(target);
    } else {
      viewport = target;
    }

    // canvas
    let canvas = viewport.querySelector("canvas");
    if (!canvas) {
      canvas = viewport.createElement("canvas");
      viewport.appendChild(canvas);
    }

    // video
    let video = viewport.querySelector("video");
    if (!video) {
      video = document.createElement("video");
      viewport.appendChild(video);
    }

    dom.viewport = viewport;
    dom.canvas = canvas;
    dom.video = video;
  };

  const media = {
    /** @type {MediaStream} */
    stream: null,
    /** @type {} */
    videoTrack: null,
  };

  const setupMedia = async (constraints) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      media.stream = stream;

      const { video, canvas } = dom;

      video.srcObject = stream;

      stream.getVideoTracks().forEach((track) => {
        media.videoTrack = track;

        const settings = track.getSettings();

        canvas.width = settings.width;
        canvas.height = settings.height;
      });

      return stream;
    } catch (err) {
      return Promise.reject(err);
    }
  };

  const drawCanvas = (video, canvas) => {
    const ctx = canvas.getContext("2d");
    const size = { w: Math.floor(canvas.width), h: Math.floor(canvas.height) };

    ctx.clearRect(0, 0, size.w, size.h);

    ctx.drawImage(video, 0, 0, size.w, size.h);
  };

  const ui = {
    pause: false,
  };

  const start = async () => {
    try {
      let { stream } = media;

      if (!stream) {
        stream = await setupMedia(constraints);
      }

      if (stream) {
        ui.pause = false;
        stream.getVideoTracks().forEach((track) => {
          track.enabled = true;
        });
        /* window. */ requestAnimationFrame(progress);
      }

      return Promise.resolve(media.stream);
    } catch (err) {
      return Promise.reject(err);
    }
  };

  const pause = async () => {
    try {
      const { stream } = media;
      if (stream) {
        ui.pause = true;

        stream.getVideoTracks().forEach((track) => {
          track.enabled = false;
        });
      }
      return Promise.resolve(stream);
    } catch (err) {
      return Promise.reject(err);
    }
  };

  const stop = async () => {
    try {
      const { stream } = media;
      if (stream) {
        stream.getTracks().forEach((track) => {
          track.enabled = true;
          track.stop();
        });
        media.stream = null;
        ui.pause = false;
      }
      return Promise.resolve(stream);
    } catch (err) {
      return Promise.reject(err);
    }
  };

  const progress = () => {
    if (!ui.pause) {
      const { video, canvas } = dom;

      drawCanvas(video, canvas);
      setTimeout(/* window. */ requestAnimationFrame(progress), 1000 / 30);
    }
  };

  return {
    get DOM() {
      return dom;
    },

    async init() {
      return new Promise((resolve) => {
        initDom(target);
        return resolve(this);
      });
    },

    /**
     * @returns {Promise<MediaStream|DOMException>}
     */
    async start() {
      return await start();
    },

    async pause() {
      return await pause();
    },

    /**
     * @returns {Promise<MediaStream|DOMException>}
     */
    async stop() {
      return await stop();
    },
  };
};
