<template>
  <div class="container-fluid">
    <form>
      <!-- video canvas -->
      <div>
        <div>
          <button class="btn btn-secondary" @click="doClickCamera">
            Camera
          </button>
        </div>
        <div>
          <img ref="refImg" />
        </div>
      </div>

      <PCameraVue
        ref="refCamera"
        v-show="ui.show"
        @init="emitedInit"
        @pause="emitedPause"
        @stop="emitedStop"
      >
        <template v-slot:close-button>
          <button class="nav-link" @click="doClickClose">
            <i class="bi bi-arrow-left"></i>
          </button>
        </template>

        <template v-slot:start-button><span /></template>

        <template v-slot:pause-button>
          <button class="btn btn-danger btn-lg" @click="doClickPause">
            <i class="bi bi-stop-circle fs-1"></i>
          </button>
        </template>

        <template v-slot:stop-button><span /></template>
      </PCameraVue>
    </form>
  </div>
</template>

<script>
import { defineComponent } from "vue";
import { ref, reactive } from "vue";
import PCameraVue from "./PCamera";
import imageCompression from "browser-image-compression";

const setup = function () {
  const refImg = ref();
  const refCamera = ref();

  const ui = reactive({
    show: false,
    camera: null,
  });

  const emitedInit = (args) => {
    ui.camera = args.data;
  };

  const emitedPause = () => {};

  const emitedStop = () => {
    ui.show = false;
  };

  const doClickClose = (event) => {
    if (event) event.preventDefault();
    ui.show = false;
    refCamera.value.stop();
  };

  const doClickPause = (event) => {
    if (event) event.preventDefault();

    const component = refCamera.value;
    const img = refImg.value;

    component.pause().then(() => {
      /* const imageURL = component.snap();
      img.src = imageURL; */
      const camera = ui.camera;

      camera
        .blob()
        .then((blob) => {
          return imageCompression(blob, {
            maxSizeMB: 0.2,
            maxWidthOrHeight: 200,
            useWebWorker: true,
          }).then((compressedFile) => {
            return {
              compressedFile,
              blob,
            };
          });
        })
        .then(({ compressedFile, blob }) => {
          console.log(
            `file size : original / compressed / ratio : ${(
              blob.size /
              1024 /
              1024
            ).toFixed(2)} MB / ${(compressedFile.size / 1024 / 1024).toFixed(
              2
            )} MB / ${((1 - compressedFile.size / blob.size) * 100).toFixed(
              2
            )} % `
          );

          return new Promise((resolve, reject) => {
            try {
              const reader = new FileReader();
              const handler = () => {
                reader.removeEventListener("load", handler);
                resolve(reader);
              };
              reader.addEventListener("load", handler);

              reader.readAsDataURL(compressedFile);
            } catch (err) {
              reject(err);
            }
          });
        })
        .then((reader) => {
          img.src = reader.result;
        })
        .catch((err) => console.error(err));

      component.stop();
    });
  };

  const doClickCamera = (event) => {
    if (event) event.preventDefault();

    ui.show = true;
    refCamera.value.start();
  };

  return {
    refImg,
    refCamera,

    ui,

    emitedInit,
    emitedPause,
    emitedStop,
    doClickClose,
    doClickPause,
    doClickCamera,
  };
};

export default defineComponent({
  name: "p-input-form",
  components: { PCameraVue },
  setup,
});
</script>
