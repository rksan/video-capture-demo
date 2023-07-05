<template src="./template.html"></template>

<style scoped src="./style.css"></style>

<script>
import { defineComponent } from "vue";
import { onMounted, ref } from "vue";
import generator from "./camera";

const setup = () => {
  const refCamera = ref({
    instance: null,
  });

  const start = () => {
    const camera = refCamera.value.instance;

    camera.start();
  };

  const pause = () => {
    const camera = refCamera.value.instance;

    camera.pause();
  };

  const stop = () => {
    const camera = refCamera.value.instance;
    camera.stop();
  };

  onMounted(() => {
    const camera = (refCamera.value.instance = generator(".viewport", {
      video: { width: 1200, height: 720 },
    }));

    camera.init().then((ins) => {
      ins.start();
    });
  });

  return {
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
