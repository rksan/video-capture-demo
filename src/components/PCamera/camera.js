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

        setupDom(settings);
      });

      return stream;
    } catch (err) {
      return Promise.reject(err);
    }
  };

  const applyConstrains = () => {
    if (!media.constraints.apply) {
      media.constraints.apply = deepClone(media.constraints.init);
    }

    return media.constraints.apply;
  };

  /**
   *
   * @param {Number} aspectRatio
   * @returns
   */
  const applyAspectRatio = async (aspectRatio) => {
    const constraints = applyConstrains();

    constraints.video.aspectRatio = { exact: aspectRatio };

    await stop();

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

        const constraints = applyConstrains();

        constraints.video.facingMode = { ideal: facingMode };

        await stop();

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
        stream = await setupMedia(media.constraints.init);
      }

      media.constraints.apply = null;

      if (stream) {
        ui.pause = false;
        stream.getVideoTracks().forEach((track) => {
          track.enabled = true;
        });
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

  /**
   *
   * @param {"image/png"} [type]
   * @param {0|1} [quality]
   * @returns
   */
  const blob = async (type, quality) => {
    const { video, imageBuffer } = dom;

    drawCanvas(video, imageBuffer);

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

  const snap = () => {
    const { video, imageBuffer } = dom;

    drawCanvas(video, imageBuffer);

    return imageBuffer.toDataURL();
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
