<template>
  <form>
    <!-- capture image -->
    <div class="mb-3">
      <div class="mb-3">
        <button class="btn btn-primary" @click="doClickCapture">capture</button>
      </div>
      <div class="mb-3">
        <input type="file" name="input-capture" accept="image/*" capture />
      </div>
    </div>

    <!-- select image -->
    <div class="mb-3">
      <div class="mb-3">
        <button class="btn btn-success" @click="doClickInput">Select</button>
      </div>
      <div class="mb-3">
        <input type="file" name="input-image" accept="image" />
      </div>
    </div>
  </form>
</template>

<script>
import { defineComponent } from "vue";

const setup = () => {
  const doClickCapture = (event) => {
    if (event) {
      event.preventDefault();
    }
  };

  return {
    doClickCapture,
  };
};

export default defineComponent({
  name: "p-input-form",
  setup,
});
</script>
