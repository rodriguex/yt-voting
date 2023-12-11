<script lang="ts" setup>
const props = defineProps({
  message: { type: String },
  endCountdown: { type: Date },
});

const countdown = ref("");

onMounted(() => {
  setInterval(() => {
    if (props.endCountdown) {
      let diff = props.endCountdown.getTime() - new Date().getTime();
      let [days, hours] = (diff / (1000 * 60 * 60 * 24)).toString().split(".");
      let hoursMinutes = ((parseInt(hours) / 100) * 24).toString();
      let h = hoursMinutes.slice(0, 2);
      let m = ((parseInt(hoursMinutes.slice(2, 5)) / 1000) * 60)
        .toString()
        .split(".");
      let currentSec = 59 - new Date().getSeconds();

      countdown.value = `${days} days, ${h} hours, ${
        m[0]
      } minutes and ${currentSec.toString().padStart(2, "0")} seconds`;
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
