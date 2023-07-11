<template src="./template.html"></template>

<style scoped src="./style.css"></style>

<script>
import { defineComponent } from "vue";
import { onMounted, onUnmounted, ref, reactive, computed } from "vue";
import { useRouter } from "vue-router";
import generator from "./camera";

const setup = (props, context) => {
  const $router = useRouter();

  const refCamera = ref({
    instance: null,
  });

  const ui = reactive({
    settings: reactive({
      aspectRatio: ref("16/9"),
      facingMode: "",
    }),
    loaded: ref(false),
    state: ref(""),
    error: ref(""),
  });

  const memorySettings = (name, value) => {
    if (name === "aspectRatio") {
      if (value === 16 / 9) {
        ui.settings[name] = "16/9";
      } else if (value === 4 / 3) {
        ui.settings[name] = "4/3";
      } else {
        ui.settings[name] = "1/1";
      }
    } else {
      ui.settings[name] = value;
    }
  };

  // computed

  const compCoverShow = computed(() => {
    if (ui.state === "pausing" || ui.state === "paused") {
      return true;
    } else if (ui.state === "stoping") {
      return true;
    } else if (ui.state === "stoped") {
      return false;
    } else {
      return !ui.loaded;
    }
  });

  const compDisplayMessage = computed(() => {
    if (ui.state === "pausing" || ui.state === "paused") {
      return "ビデオをキャプチャ中...";
    } else if (ui.state === "stoping" || ui.state === "stoped") {
      return "ビデオを停止中...";
    } else {
      return "カメラ権限を確認中...";
    }
  });

  // events
  const doClickClose = (event) => {
    if (event) event.preventDefault();

    $router.back();
  };

  const doClickStart = (event) => {
    if (event) event.preventDefault();

    ui.state = "starting";

    const camera = refCamera.value.instance;

    return camera
      .start()
      .then((stream) => {
        stream.getVideoTracks().find((track) => {
          const settings = track.getSettings();
          memorySettings("facingMode", settings.facingMode);
        });

        ui.state = "started";
        ui.loaded = true;

        context.emit("start", { data: camera });
        return stream;
      })
      .catch((err) => {
        console.error(err);
        ui.error = err;
        return err;
      });
  };

  const doClickPause = (event) => {
    if (event) event.preventDefault();
    ui.state = "pausing";

    const camera = refCamera.value.instance;

    return camera.pause().then((stream) => {
      if (camera.mediaState === "pause") {
        ui.state = "paused";
      } else {
        ui.state = "started";
      }

      context.emit("pause", { data: camera });

      return stream;
    });
  };

  const doClickStop = (event) => {
    if (event) event.preventDefault();

    ui.state = "stoping";

    const camera = refCamera.value.instance;

    return camera.stop().then((stream) => {
      ui.state = "stoped";
      ui.loaded = false;

      context.emit("stop", { data: camera });

      return stream;
    });
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
    ui.state = "initializing";

    const camera = generator(
      ".viewport",
      {
        video: {
          width: { min: 160, ideal: 2400, max: 10240 },
          height: { min: 120, ideal: 1440, max: 4320 },
          facingMode: { ideal: "environment" },
          /* aspectRatio: { ideal: 16 / 9 }, */
          aspectRatio: { exact: 1 / 1 },
        },
      },
      { grid: 3 }
    );

    refCamera.value.instance = camera;

    camera.init().then(() => {
      ui.state = "initialized";
      context.emit("init", { data: camera });
    });
  });

  onUnmounted(() => {
    doClickStop();
  });

  return {
    ui,

    compCoverShow,
    compDisplayMessage,

    setState(state) {
      ui.state = state;
    },

    doClickClose,
    doClickStart,
    doClickPause,
    doClickStop,

    doClickChangeAspectRatio,
    doClickFacingMode,
  };
};

export default defineComponent({
  name: "p-camera",
  setup,
});
</script>
