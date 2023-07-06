const DEFAULT = {
  DOM: {
    target: ".viewport",
  },
  CONSTRAINS: {
    audio: false,
    video: {
      width: { min: 160, ideal: 2400, max: 10240 },
      height: { min: 120, ideal: 1440, max: 4320 },
      facingMode: "environment",
    },
  },
};

/**
 *
 * @param {String|HTMLElement} target
 * @param {{audio?:false,video?:MediaTrackConstraints}} constraints
 * @returns
 */
module.exports = (
  target = DEFAULT.DOM.target,
  constraints = DEFAULT.CONSTRAINS
) => {
  constraints.audio = false;

  /**
   * @type {{
   * target:string,
   * viewport:HTMLElement,
   * video:HTMLVideoElement,
   * canvas:HTMLCanvasElement
   * }}
   */
  const dom = {
    target,
    viewport: null,
    video: null,
    canvas: null,
  };

  /**
   *
   * @param {String | HTMLElement} target
   */
  const initDom = (target) => {
    /** @type {HTMLElement} */
    let viewport;

    if (!target) {
      viewport = document.querySelector(".viewport");
    } else if (typeof target === "string") {
      viewport = document.querySelector(target);
    } else {
      viewport = target;
    }

    // canvas
    let canvas = viewport.querySelector(":scope>canvas");
    if (!canvas) {
      canvas = viewport.createElement("canvas");
      viewport.appendChild(canvas);
    }

    // video
    let video = viewport.querySelector(":scope>video");
    if (!video) {
      video = document.createElement("video");
      viewport.appendChild(video);
    }

    dom.viewport = viewport;
    dom.canvas = canvas;
    dom.video = video;
  };

  const setupDom = (settings) => {
    const { viewport, canvas } = dom;

    viewport.style.aspectRatio = settings.aspectRatio;

    canvas.width = settings.width;
    canvas.height = settings.height;
  };

  const media = {
    constraints: Object.assign(DEFAULT.CONSTRAINS, constraints),
    /** @type {MediaStream} */
    stream: null,
    /** @type {} */
    videoTrack: null,
  };

  /**
   *
   * @@param {{audio?:false,video?:MediaTrackConstraints}} constraints
   * @returns {Promise<MediaStream>}
   */
  const setupMedia = async (constraints) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      media.stream = stream;

      const { video } = dom;

      video.srcObject = stream;

      stream.getVideoTracks().forEach((track) => {
        media.videoTrack = track;

        const settings = track.getSettings();

        console.log(settings);

        setupDom(settings);
      });

      return stream;
    } catch (err) {
      return Promise.reject(err);
    }
  };

  /**
   *
   * @param {ConstrainDOMString} aspectRatio
   * @returns
   */
  const applyAspectRatio = async (aspectRatio) => {
    const constraints = Object.assign(media.constraints, {
      video: {
        aspectRatio,
      },
    });

    return await setupMedia(constraints);
  };

  const toggleFacingMode = async () => {
    const { stream } = media;

    if (stream) {
      const track = stream.getVideoTracks()[0];

      const settings = track.getSettings();

      if (settings) {
        let facingMode = settings.facingMode;

        if (facingMode === "user") {
          facingMode = "environment";
        } else {
          facingMode === "user";
        }

        const constraints = Object.assign(media.constraints, {
          video: {
            facingMode,
          },
        });

        return await setupMedia(constraints);
      }
    }

    return stream;
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
        stream = await setupMedia(media.constraints);
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

  /**
   *
   * @param {"image/png"} [type]
   * @param {0|1} [quality]
   * @returns
   */
  const blob = async (type, quality) => {
    const { canvas } = dom;

    return new Promise((resolve, reject) => {
      try {
        canvas.toBlob(
          (blob) => {
            resolve(blob);
          },
          type,
          quality
        );
      } catch (err) {
        reject(err);
      }
    });
  };

  const snap = () => {
    const { canvas } = dom;

    return canvas.toDataURL();
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

    async blob() {
      return await blob();
    },

    snap() {
      return snap();
    },

    async applyAspectRatio(constraints) {
      return await applyAspectRatio(constraints);
    },

    async toggleFacingMode(constraints) {
      return await toggleFacingMode(constraints);
    },
  };
};
