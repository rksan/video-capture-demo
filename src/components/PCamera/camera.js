const merge = require("lodash/merge");

/**
 * @alias structuredClone
 * @see https://developer.mozilla.org/ja/docs/Web/API/structuredClone
 */
const deepClone = structuredClone;

const DEFAULT = {
  DOM: {
    target: ".viewport",
  },
  CONSTRAINS: {
    audio: false,
    video: {
      width: { min: 160, ideal: 2400, max: 10240 },
      height: { min: 120, ideal: 1440, max: 4320 },
      facingMode: { ideal: "environment" },
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
  //constraints.audio = false;

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
    imageBuffer: null,
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

    const createDom = (parent, selector, tag, { classs, attrs } = {}) => {
      let elem = parent.querySelector(selector);

      if (!elem) {
        elem = document.createElement(tag);

        parent.appendChild(elem);
      }

      if (classs) {
        if (Array.isArray(classs)) {
          for (let cls in classs) {
            elem.classList.add(cls);
          }
        } else if (typeof classList === "string") {
          elem.classList.add(classs);
        }
      }

      if (attrs) {
        Object.entries(attrs).forEach(([key, value]) => {
          elem[key] = value;
        });
      }
      return elem;
    };

    // canvas
    let canvas = createDom(viewport, ":scope>canvas", "canvas");

    // video
    let video = createDom(viewport, ":scope>video", "video", {
      attrs: { autoplay: true, playsinline: true },
    });

    // imageBuffer
    let imageBuffer = createDom(
      viewport,
      ":scope>canvas.image-buffer",
      "canvas",
      { classs: "image-buffer" }
    );

    merge(dom, { viewport, canvas, video, imageBuffer });
  };

  const setupDom = (settings) => {
    const { viewport, canvas, imageBuffer } = dom;

    viewport.style.aspectRatio = settings.aspectRatio;

    canvas.width = settings.width;
    canvas.height = settings.height;

    const size = { width: settings.width, height: settings.height };

    merge(canvas, size);

    merge(imageBuffer, size);
  };

  const media = {
    constraints: {
      init: merge(true, DEFAULT.CONSTRAINS, constraints, { audio: false }),
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

  /**
   * applyConstrains
   *
   * get applyConstrains()
   *
   * set applyConstrains(constraints)
   *
   * @param {MediaTrackConstraints} [constraints]
   * @returns {MediaTrackConstraints}
   */
  const applyConstrains = (constraints) => {
    if (!media.constraints.apply) {
      media.constraints.apply = {};
      merge(media.constraints.apply, media.constraints.init);
    }

    if (constraints) {
      return (media.constraints.apply = constraints);
    } else {
      return deepClone(media.constraints.apply);
    }
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

    try {
      const stream = await setupMedia(constraints);

      applyConstrains(constraints);

      return stream;
    } catch (err) {
      if (err instanceof OverconstrainedError) {
        const constraints = applyConstrains();
        await stop();
        return await setupMedia(constraints);
      } else {
        return err;
      }
    }
  };

  const toggleFacingMode = async () => {
    const { stream } = media;

    if (!stream) {
      return stream;
    }

    const settings = stream
      .getVideoTracks()
      .find((track) => track.getSettings());

    if (!settings) {
      return stream;
    }

    const facingMode = settings.facingMode === "user" ? "environment" : "user";

    const constraints = applyConstrains();

    constraints.video.facingMode = { exact: facingMode };

    console.log("constraints", constraints);

    await stop();

    try {
      const stream = await setupMedia(constraints);

      applyConstrains(constraints);

      return stream;
    } catch (err) {
      if (err instanceof OverconstrainedError) {
        const constraints = applyConstrains();

        await stop();

        return await setupMedia(constraints);
      } else {
        return err;
      }
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
