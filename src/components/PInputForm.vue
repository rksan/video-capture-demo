<template>
  <form>
    <!-- video canvas -->
    <div>
      <div>
        <button class="btn btn-secondary" @click="doClickCamera">Camera</button>
      </div>
      <div>
        <canvas></canvas>
      </div>
    </div>

    <!-- capture image -->
    <div class="mb-3">
      <div class="mb-3">
        <button class="btn btn-primary" @click="doClickCapture">capture</button>
      </div>
      <div class="mb-3">
        <input
          type="file"
          name="input-capture"
          accept="image/*"
          capture
          @change="doChangeCapture"
        />
      </div>
    </div>

    <!-- select image -->
    <div class="mb-3">
      <div class="mb-3">
        <button class="btn btn-success" @click="doClickInput">Select</button>
      </div>
      <div class="mb-3">
        <input type="file" name="input-image" accept="image/*" />
      </div>
    </div>

    <div>
      <textarea id="log"></textarea>
    </div>
  </form>
</template>

<script>
import { defineComponent } from "vue";
import { useRouter } from "vue-router";

const setup = () => {
  const $router = useRouter();

  const doClickCamera = (event) => {
    if (event) event.preventDefault();
    $router.push({ path: "/camera" });
  };

  const outputConsole = (text) => {
    const textarea = document.querySelector("#log");

    textarea.value = text.toString
      ? text.toString()
      : text.toJSON
      ? JSON.stringify(text.toJSON())
      : text;
  };

  const doClickCapture = (event) => {
    if (event) {
      event.preventDefault();
    }
  };

  const doChangeCapture = (event) => {
    outputConsole(event.type);
  };

  return {
    doClickCamera,
    doClickCapture,
    doChangeCapture,
    outputConsole,
  };
};

export default defineComponent({
  name: "p-input-form",
  setup,
});
</script>
