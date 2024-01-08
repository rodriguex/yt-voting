<script lang="ts" setup>
const allStore = useAllStore();
const {
  user,
  scrollTop,
  isCountdownOver,
  countdownDay,
  countdownHour,
  countdownMin,
  countdownSec,
  activeWeek,
  intervalId,
  previousIntervalId,
} = storeToRefs(allStore);
const router = useRoute();

onMounted(() => {
  document.addEventListener("scroll", () => {
    scrollTop.value = document.documentElement.scrollTop;
  });
});

watchEffect(() => {
  if (activeWeek.value && previousIntervalId !== intervalId.value) {
    intervalId.value = setInterval(() => {
      if (
        countdownDay.value !== 0 ||
        countdownHour.value !== 0 ||
        countdownMin.value !== 0 ||
        countdownSec.value !== 0
      ) {
        allStore.countdown();
      } else {
        allStore.restartInterval();
      }
    }, 1000);
  }
});

watchEffect(() => {
  if (process.client) {
    let userFromStorage = JSON.parse(<string>localStorage.getItem("user"));
    if (!user.value && !userFromStorage && router.fullPath !== "/login") {
      navigateTo("/login");
    } else if (!user.value && userFromStorage) {
      user.value = userFromStorage;
    }
  }
});
</script>

<template>
  <div class="w-full">
    <Loading />
    <NewWeekInfoModal
      :show="isCountdownOver"
      :setShow="allStore.setNewWeekModal"
    />
    <Header />
    <main>
      <slot />
    </main>
  </div>
</template>
