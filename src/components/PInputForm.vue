<template>
  <div class="container-fluid">
    <form>
      <div>
        <div class="">
          <button class="btn btn-secondary" @click="doClickCamera">
            Camera
          </button>
        </div>

        <div class="row row-cols-auto" style="overflow-x: auto">
          <template v-for="(image, idx) in ui.images" :key="idx">
            <div class="col">
              <!-- preview -->
              <div
                class="photo-preview"
                @click="doClickPhoto"
                :data-idx="idx"
                :data-width="image.width"
                :data-height="image.height"
                :style="`background-image:url(${image.src})`"
              ></div>
              <div>{{ `${image.width} * ${image.height}` }}</div>
              <!-- image -->
              <div class="photo-show d-none" @click="doClickPhoto">
                <div class="photo-cover"></div>
                <div class="photo-show-container">
                  <div class="photo-wapper">
                    <img
                      class="photo-image"
                      :src="`${image.src}`"
                      :width="image.width"
                      :height="`${image.height}`"
                    />
                  </div>
                </div>
              </div>
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
  min-width: 64px;
  min-height: 64px;
  max-width: 100vw;
  max-height: 100vh;
  cursor: pointer;
  background-image: none;
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;
}

.photo-show {
  cursor: pointer;
}

.photo-cover {
  position: absolute;
  top: 0;
  left: 0;
  min-width: 100%;
  min-height: 100%;
  background-color: black;
  opacity: 0.5;
}
.photo-show-container {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  margin: 0;
  padding: 0;
  max-width: 100vw;
  max-height: 100vh;
  width: 100%;
  height: auto;

  overflow: hidden;
}

.photo-wapper {
  position: relative;
  display: inline-block;
  max-width: 100%;
  max-height: 100%;
  width: auto;
  height: 100%;
  aspect-ratio: 16/9;
}

/* height > width */
@media (orientation: portrait) {
  .photo {
    width: 100%;
    height: auto;
    aspect-ratio: 9/16;
  }
}

.photo-image {
  display: block;
  margin: auto;
  max-width: 100%;
  height: auto;
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
    show: ref(false),
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

    const component = refCamera.value;
    component.doClickStop(event);
  };

  const doClickPause = (event) => {
    if (event) event.preventDefault();

    const component = refCamera.value;

    component.setState("pausing");

    const camera = ui.camera;

    camera.snap();

    const { imageBuffer } = camera.DOM;
    const base64 = camera.dataURL();

    ui.images.push({
      src: base64,
      width: imageBuffer.width,
      height: imageBuffer.height,
    });

    component.doClickStop();
  };

  const doClickCamera = (event) => {
    if (event) event.preventDefault();

    ui.show = true;

    const component = refCamera.value;
    component.doClickStart(event);
  };

  /**
   *
   * @param {MouseEvent} event
   */
  const doClickPhoto = (event) => {
    if (event) event.preventDefault();

    /** @type {HTMLElement} */
    const target = event.currentTarget;

    const col = target.parentElement;

    //const preview = target;
    const photo = col.querySelector(":scope>div.photo-show");

    if (photo.classList.toggle("d-none")) {
      // hidden
    } else {
      //show
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
