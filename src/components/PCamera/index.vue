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
    loaded: false,
    error: "",
  });

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
        console.log("start");
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

  onMounted(() => {
    const camera = (refCamera.value.instance = generator(".viewport", {
      video: {
        width: { min: 160, ideal: 1200, max: 10240 },
        height: { min: 120, ideal: 720, max: 4320 },
        facingMode: "environment",
      },
    }));

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
  };
};

export default defineComponent({
  name: "p-camera",
  setup,
});
</script>
