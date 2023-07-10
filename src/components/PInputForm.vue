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
        <div class="d-flex" style="overflow-y: auto">
          <template v-for="(image, idx) in ui.images" :key="idx">
            <div>
              <div
                class="photo-preview"
                @click="doClickPhoto"
                :data-idx="idx"
                :data-width="image.width"
                :data-height="image.height"
                :style="`background-image:url(${image.src})`"
              ></div>
              <div>{{ `${image.width} * ${image.height}` }}</div>
            </div>
          </template>
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

<style scoped>
.photo-preview {
  display: inline-block;
  min-width: 100px;
  min-height: 100px;
  max-width: 100vw;
  max-height: 100vh;
  cursor: pointer;
  background-image: none;
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;
}
.photo-show {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
</style>

<script>
import { defineComponent } from "vue";
import { ref, reactive } from "vue";
import PCameraVue from "./PCamera";
//import imageCompression from "browser-image-compression";

const setup = function () {
  //const refImg = ref();
  const refCamera = ref();

  const ui = reactive({
    show: false,
    camera: null,
    images: reactive([]),
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

    component.pause().then(() => {
      const camera = ui.camera;
      const { imageBuffer } = camera.DOM;

      camera.snap().then((base64) => {
        //const div = document.querySelector("div.photo-preview");

        ui.images.push({
          src: base64,
          width: imageBuffer.width,
          height: imageBuffer.height,
        });
      });

      component.stop();
    });
  };

  const doClickCamera = (event) => {
    if (event) event.preventDefault();

    ui.show = true;
    refCamera.value.start();
  };

  /**
   *
   * @param {MouseEvent} event
   */
  const doClickPhoto = (event) => {
    if (event) event.preventDefault();

    /** @type {HTMLDivElement} */
    const div = event.target;

    if (div.classList.toggle("photo-show") === true) {
      //add
      div.style.width = `${div.dataset.width}px`;
      div.style.height = `${div.dataset.height}px`;
    } else {
      //remove
      //add
      div.style.width = null;
      div.style.height = null;
    }
  };
  return {
    refCamera,

    ui,

    emitedInit,
    emitedPause,
    emitedStop,
    doClickClose,
    doClickPause,
    doClickCamera,

    doClickPhoto,
  };
};

export default defineComponent({
  name: "p-input-form",
  components: { PCameraVue },
  setup,
});
</script>
