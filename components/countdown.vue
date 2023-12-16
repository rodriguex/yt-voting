<script lang="ts" setup>
const props = defineProps({
  message: { type: String },
  endCountdown: { type: Date },
});

const countDays = ref<any>("");
const countHours = ref<any>("");
const countMinutes = ref<any>("");
const countSeconds = ref<any>("");

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

      countDays.value = days;
      countHours.value = h;
      countMinutes.value = m[0].toString().padStart(2, "0");
      countSeconds.value = currentSec.toString().padStart(2, "0");
    }
  }, 1000);
});
</script>

<template>
  <div class="flex flex-col items-center">
    <span class="font-gloria font-normal text-2xl mt-3">{{
      props.message
    }}</span>
    <div class="flex items-center mt-12 text-4xl gap-8">
      <div class="flex flex-col items-center">
        <span>{{ countDays }}</span>
        <span>days</span>
      </div>
      <div class="flex flex-col items-center">
        <span>{{ countHours }}</span>
        <span>hours</span>
      </div>
      <div class="flex flex-col items-center">
        <span>{{ countMinutes }}</span>
        <span>minutes</span>
      </div>
      <div class="flex flex-col items-center">
        <span>{{ countSeconds }}</span>
        <span>seconds</span>
      </div>
    </div>
  </div>
</template>
