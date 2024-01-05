<script lang="ts" setup>
defineProps({
  show: { type: Boolean },
  setShow: { type: Function, default: () => {} },
});

const allStore = useAllStore();
const { activeWeek } = storeToRefs(allStore);

const countDays = ref<any>("");
const countHours = ref<any>("");
const countMinutes = ref<any>("");
const countSeconds = ref<any>("");
const intervalId = ref<any>(null);

onMounted(() => {
  countdown();
  intervalId.value = setInterval(() => {
    countdown();
  }, 1000);
});

onUnmounted(() => {
  clearInterval(intervalId.value);
});

function countdown() {
  if (activeWeek.value.ending) {
    let now = new Date();
    let evenDate = new Date(activeWeek.value.ending);

    let actualTime = now.getTime();
    let eventTime = evenDate.getTime();
    let remTime = eventTime - actualTime;

    let s = Math.floor(remTime / 1000);
    let m = Math.ceil(s / 60);
    let h = Math.floor(m / 60);
    let d = Math.floor(h / 24);

    h %= 24;
    m %= 60;
    s %= 60;

    countDays.value = d.toString().padStart(2, "0");
    countHours.value = h.toString().padStart(2, "0");
    countMinutes.value = m.toString().padStart(2, "0");
    countSeconds.value = s.toString().padStart(2, "0");
  }
}
</script>

<template>
  <modal :show="show" :setShow="setShow">
    <div class="w-full flex h-full">
      <div
        class="hidden crazyBg sm:flex items-center justify-center p-10 rounded-s-md"
      >
        <img
          src="~/assets/imgs/clock.png"
          alt="Cool clock image"
          class="w-[150px] h-fit"
        />
      </div>
      <div
        class="crazyBg sm:bg-none sm:bg-white text-white sm:text-black w-full h-full flex items-center justify-center"
      >
        <div class="flex flex-col items-center">
          <span class="font-gloria text-2xl mt-3"
            >This week is gonna end in:</span
          >
          <div
            class="flex flex-col sm:flex-row items-center mt-12 text-2xl md:text-3xl gap-3 md:gap-8 font-normal"
          >
            <div class="flex flex-col items-center">
              <span>{{ countDays }}</span>
              <span>{{ countDays <= 1 ? "day" : "days" }}</span>
            </div>
            <div class="flex flex-col items-center">
              <span>{{ countHours }}</span>
              <span>{{ countHours < 1 ? "hour" : "hours" }}</span>
            </div>
            <div class="flex flex-col items-center">
              <span>{{ countMinutes }}</span>
              <span>{{ countMinutes <= 1 ? "minute" : "minutes" }}</span>
            </div>
            <div class="flex flex-col items-center">
              <span>{{ countSeconds }}</span>
              <span>seconds</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </modal>
</template>
