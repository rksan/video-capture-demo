<template src="./template.html"></template>

<style scoped src="./style.css"></style>

<script>
import { defineComponent } from "vue";
import { onMounted, onUnmounted, ref, reactive } from "vue";
import { useRouter } from "vue-router";
import generator from "./camera";

const setup = (props, context) => {
  const $router = useRouter();

  const refCamera = ref({
    instance: null,
  });

  const ui = reactive({
    settings: reactive({
      aspectRatio: "16/9",
      facingMode: "",
    }),
    loaded: false,
    error: "",
  });

  const memorySettings = (name, value) => {
    ui.settings[name] = value;
  };

  const close = (event) => {
    if (event) event.preventDefault();

    $router.back();
  };

  const start = (event) => {
    if (event) event.preventDefault();

    const camera = refCamera.value.instance;

    return camera
      .start()
      .then((stream) => {
        ui.loaded = true;
        stream.getVideoTracks().find((track) => {
          const settings = track.getSettings();
          memorySettings("facingMode", settings.facingMode);
        });
        context.emit("start", { data: camera });
        return stream;
      })
      .catch((err) => {
        console.error(err);
        ui.error = err;
        return err;
      });
  };

  const pause = (event) => {
    if (event) event.preventDefault();
    const camera = refCamera.value.instance;
    return camera.pause().then((stream) => {
      context.emit("pause", { data: camera });
      return stream;
    });
  };

  const stop = (event) => {
    if (event) event.preventDefault();

    ui.loaded = false;

    const camera = refCamera.value.instance;

    return camera.stop().then((stream) => {
      context.emit("stop", { data: camera });
      return stream;
    });
  };

  const snap = () => {
    const camera = refCamera.value.instance;

    return camera.snap();
  };

  // menus
  const doClickChangeAspectRatio = (event) => {
    if (event) event.preventDefault();

    const elem = event.target;
    const aspect = elem.dataset.aspectRatio;

    const camera = refCamera.value.instance;

    (() => {
      switch (aspect) {
        case "16/9":
          return camera.applyAspectRatio(16 / 9);
        case "4/3":
          return camera.applyAspectRatio(4 / 3);

        case "1/1":
          return camera.applyAspectRatio(1 / 1);

        default:
          return Promise.reject();
      }
    })().then(() => {
      memorySettings("aspectRatio", aspect);
    });
  };

  const doClickFacingMode = (event) => {
    if (event) event.preventDefault();

    const camera = refCamera.value.instance;

    camera.toggleFacingMode().then((/** @type {MediaStream} */ stream) => {
      stream.getVideoTracks().find((track) => {
        const settings = track.getSettings();

        memorySettings("facingMode", settings.facingMode);
      });
    });
  };

  onMounted(() => {
    const camera = generator(".viewport", {
      video: {
        width: { min: 160, ideal: 2400, max: 10240 },
        height: { min: 120, ideal: 1440, max: 4320 },
        facingMode: { ideal: "environment" },
        aspectRatio: { ideal: 16 / 9 },
      },
    });

    refCamera.value.instance = camera;

    camera.init().then(() => {
      context.emit("init", { data: camera });
    });
  });

  onUnmounted(() => {
    stop();
  });

  return {
    ui,

    close,
    start,
    pause,
    stop,
    snap,

    doClickChangeAspectRatio,
    doClickFacingMode,
  };
};

export default defineComponent({
  name: "p-camera",
  setup,
});
</script>
