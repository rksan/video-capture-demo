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
      </div>

      <PCameraVue
        ref="refCamera"
        v-show="ui.show"
        @init="emitedInit"
        @pause="emitedPause"
        @stop="emitedStop"
      >
        <template v-slot:close-button>
          <button class="btn btn-dark btn-lg" @click="doClickClose">
            <i class="bi bi-arrow-left fs-1"></i>
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
import { ref } from "vue";
import PCameraVue from "./PCamera";

const setup = function () {
  const refCamera = ref();

  const ui = ref({
    show: false,
    camera: null,
  });

  const emitedInit = (args) => {
    ui.value.camera = args.data;
  };

  const emitedPause = () => {};

  const emitedStop = () => {
    ui.value.show = false;
  };

  const doClickClose = (event) => {
    if (event) event.preventDefault();
    ui.value.show = false;
    refCamera.value.stop();
  };

  const doClickPause = (event) => {
    if (event) event.preventDefault();

    refCamera.value.stop();
  };

  const doClickCamera = (event) => {
    if (event) event.preventDefault();

    ui.value.show = true;
    refCamera.value.start();
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
  };
};

export default defineComponent({
  name: "p-input-form",
  components: { PCameraVue },
  setup,
});
</script>
