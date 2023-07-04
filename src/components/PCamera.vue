<template>
  <div>
    <video autoplay></video>
  </div>
</template>

<script>
import { defineComponent } from "vue";
import { onMounted } from "vue";

const setup = () => {
  onMounted(() => {
    const video = document.querySelector("video");

    navigator.mediaDevices.getUserMedia({ video: true }).then((mediaStream) => {
      video.srcObject = mediaStream;
    });
  });
};

export default defineComponent({
  name: "p-camera",
  setup,
});
</script>
