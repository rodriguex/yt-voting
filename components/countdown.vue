<script lang="ts" setup>
import { DEFAULT_INSPECTOR_OPTIONS } from "vite-plugin-vue-inspector";

const props = defineProps({
  message: { type: String },
  endCountdown: { type: Date },
});

const countdown = ref("");

onMounted(() => {
  setInterval(() => {
    if (props.endCountdown) {
      let currentDate = new Date();

      let countHours = props.endCountdown.getHours();
      let countMin = props.endCountdown.getMinutes();

      let currentHours = currentDate.getHours();
      let currentMin = currentDate.getMinutes();
      let currentSec = currentDate.getSeconds();

      let diffHours = countHours - currentHours;
      let diffMin = countMin - currentMin;
      let diffSec = 59 - currentSec;

      countdown.value = `${diffHours.toString().padStart(2, "0")}:${diffMin
        .toString()
        .padStart(2, "0")}:${diffSec.toString().padStart(2, "0")}`;
    }
  }, 1000);
});
</script>

<template>
  <div>
    <span class="text-3xl font-normal">{{ props.message }}</span>
    <h1 class="text-5xl text-center mt-2">{{ countdown }}</h1>
  </div>
</template>
