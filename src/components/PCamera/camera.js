/**
 * deepClone
 * @alias structuredClone
 * @see https://developer.mozilla.org/ja/docs/Web/API/structuredClone
 */
const deepClone = structuredClone;

const merge = require("lodash/merge");

const DEFAULT = {
  DOM: {
    target: ".viewport",
  },

  CONSTRAINS: {
    /** @type {MediaTrackConstraints} */
    audio: false,
    /** @type {MediaTrackConstraints} */
    video: {
      width: { min: 160, ideal: 2400, max: 10240 },
      height: { min: 120, ideal: 1440, max: 4320 },
      facingMode: "environment",
      aspectRatio: { ideal: 16 / 9 },
      frameRate: { min: 1, ideal: 16, max: 30 },
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
  /**
   * @type {{
   * target:string,
   * viewport:HTMLElement,
   * video:HTMLVideoElement,
   * canvas:HTMLCanvasElement
   * imageBuffer:HTMLCanvasElement
   * }}
   */
  const dom = {
    target,
    viewport: null,
    canvas: null,
    video: null,
    imageBuffer: null,
  };

  const createDom = (parent, selector, tag, { classes, attrs } = {}) => {
    let elem = parent.querySelector(selector);
    if (!elem) {
      elem = document.createElement(tag);
      parent.appendChild(elem);
    }

    if (elem) {
      if (classes) {
        if (Array.isArray(classes)) {
          classes.forEach((cls) => elem.classList.add(cls));
        } else if (typeof classes === "string") {
          elem.classList.add(classes);
        }
      }

      if (attrs) {
        Object.entries(attrs).forEach(([key, value]) => (elem[key] = value));
      }
    }

    return elem;
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
    let canvas = createDom(viewport, ":scope>canvas", "canvas");

    // video
    let video = createDom(viewport, ":scope>video", "video", {
      autoplay: true,
    });

    let imageBuffer = createDom(
      viewport,
      ":scope>canvas.image-buffer",
      "canvas",
      {
        classes: "image-buffer",
      }
    );

    merge(dom, { viewport, canvas, video, imageBuffer });
  };

  const setupDom = (settings) => {
    const { viewport, canvas, imageBuffer } = dom;

    viewport.style.aspectRatio = settings.aspectRatio;

    const size = { width: settings.width, height: settings.height };

    merge(canvas, size);
    merge(imageBuffer, size);
  };

  const media = {
    constraints: {
      init: merge(DEFAULT.CONSTRAINS, constraints, { audio: false }),
      apply: null,
    },
    /** @type {MediaStream} */
    stream: null,
    /** @type {"init"|"start"|"pause"|"stop"} */
    state: "",
  };

  /**
   *
   * @@param {{audio?:false,video?:MediaTrackConstraints}} constraints
   * @returns {Promise<MediaStream>}
   */
  const setupMedia = async (constraints) => {
    try {
      const { video } = dom;

      const stream =
        (video.srcObject =
        media.stream =
          await navigator.mediaDevices.getUserMedia(constraints));

      stream.getVideoTracks().find((track) => {
        const settings = track.getSettings();

        setupDom(settings);

        return settings;
      });

      return stream;
    } catch (err) {
      return Promise.reject(err);
    }
  };

  /**
   * applyConstrains
   * @param {MediaTrackConstraints} constraints
   * @returns {MediaTrackConstraints}
   */
  const applyConstrains = (constraints) => {
    if (!media.constraints.apply) {
      media.constraints.apply = deepClone(media.constraints.init);
    }

    if (constraints) {
      return (media.constraints.apply = deepClone(constraints));
    }

    return deepClone(media.constraints.apply);
  };

  /**
   *
   * @param {Number} aspectRatio 16/9 | 4/3 | 1/1
   * @returns {Promise<MediaStream>}
   */
  const applyAspectRatio = async (aspectRatio) => {
    const constraints = applyConstrains();

    constraints.video.aspectRatio = { exact: aspectRatio };

    await stop();

    try {
      const stream = await setupMedia(constraints);

      applyConstrains(constraints);

      return stream;
    } catch (err) {
      if (err instanceof OverconstrainedError) {
        await stop();
        return await setupMedia(constraints);
      } else {
        throw err;
      }
    }
  };

  /**
   * @returns {Promise<MediaStream>}
   */
  const toggleFacingMode = async () => {
    const { stream } = media;
    if (!stream) return stream;

    const track = stream.getVideoTracks().find((track) => track);
    if (!track) return stream;

    const settings = track.getSettings();
    if (!settings) return stream;

    console.log("toggleFacingMode() settings", settings);

    const facingMode = settings.facingMode === "user" ? "environment" : "user";

    const constraints = applyConstrains();

    constraints.video.facingMode = { exact: facingMode };

    await stop();

    try {
      const stream = await setupMedia(constraints);

      applyConstrains(constraints);

      return stream;
    } catch (err) {
      if (err instanceof OverconstrainedError) {
        await stop();
        return await setupMedia(media.constraints.init);
      } else {
        throw err;
      }
    }
  };

  /**
   * drawCanvas
   * @param {HTMLVideoElement} video
   * @param {HTMLCanvasElement} canvas
   */
  const transferCanvas = (video, canvas) => {
    const ctx = canvas.getContext("2d");
    const size = { w: Math.floor(canvas.width), h: Math.floor(canvas.height) };

    ctx.clearRect(0, 0, size.w, size.h);

    ctx.drawImage(video, 0, 0, size.w, size.h);
  };

  const clearCanvas = (canvas) => {
    const ctx = canvas.getContext("2d");
    const size = { w: Math.floor(canvas.width), h: Math.floor(canvas.height) };

    ctx.clearRect(0, 0, size.w, size.h);
  };

  const ui = {
    pause: false,
  };

  /**
   * @returns {Promise<MediaStream>}
   */
  const start = async () => {
    try {
      if (!media.stream) {
        await setupMedia(media.constraints.init);
      }

      media.constraints.apply = null;

      const { stream } = media;

      if (stream) {
        ui.pause = false;

        stream.getVideoTracks().forEach((track) => {
          track.enabled = true;
        });

        media.state = "start";
      }

      return Promise.resolve(stream);
    } catch (err) {
      return Promise.reject(err);
    }
  };

  /**
   * @param {(enabled)=>void} [before]
   * @returns {Promise<MediaStream>}
   */
  const pause = async (before) => {
    try {
      const { stream } = media;

      if (stream) {
        let enabled = false;

        stream.getVideoTracks().forEach((track) => {
          if (typeof before === "function") before(track.enabled);

          enabled = !track.enabled;
          track.enabled = enabled;
        });

        ui.pause = enabled;

        if (enabled) {
          media.state = "start";
        } else {
          media.state = "pause";
        }
      }

      return Promise.resolve(stream);
    } catch (err) {
      return Promise.reject(err);
    }
  };

  /**
   * @returns {Promise<MediaStream>}
   */
  const stop = async () => {
    try {
      const { stream } = media;
      if (stream) {
        stream.getTracks().forEach((track) => {
          const { imageBuffer } = dom;
          clearCanvas(imageBuffer);
          track.enabled = true;
          track.stop();
        });
        media.stream = null;
        ui.pause = false;
        media.state = "stop";
      }
      return Promise.resolve(stream);
    } catch (err) {
      return Promise.reject(err);
    }
  };

  /**
   *
   * @param {String} [type] image/*
   * @param {Number} [quality] 0 < quality < 1
   * @returns
   */
  const blob = async (type, quality) => {
    const { imageBuffer } = dom;

    return new Promise((resolve, reject) => {
      try {
        imageBuffer.toBlob(
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

  /**
   *
   * @param {String} [type] image/*
   * @param {Number} [quality] 0 < quality < 1
   * @returns
   */
  const dataURL = (type, quality) => {
    const { imageBuffer } = dom;

    return imageBuffer.toDataURL(type, quality);
  };

  const snap = async () => {
    const { video, imageBuffer } = dom;

    transferCanvas(video, imageBuffer);

    return;
  };

  return {
    get DOM() {
      return dom;
    },

    get mediaState() {
      return media.state;
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

    /**
     * @returns {Promise<MediaStream|DOMException>}
     */
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

    dataURL() {
      return dataURL();
    },

    snap() {
      return snap();
    },

    /**
     * @returns {Promise<MediaStream>}
     */
    async applyAspectRatio(constraints) {
      return await applyAspectRatio(constraints);
    },

    /**
     * @returns {Promise<MediaStream>}
     */
    async toggleFacingMode(constraints) {
      return await toggleFacingMode(constraints);
    },
  };
};
