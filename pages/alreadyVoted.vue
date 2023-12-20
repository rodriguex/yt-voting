<script lang="ts" setup>
const allStore = useAllStore();
const { alreadyVoted } = storeToRefs(allStore);

onMounted(() => {
  if (alreadyVoted.value === null) {
    alreadyVoted.value = true;
  }
});
</script>

<template>
  <div
    v-if="alreadyVoted"
    class="w-full flex items-center crazyBg justify-center"
    style="height: calc(100%)"
  >
    <div class="w-full max-w-4xl flex items-end gap-7">
      <img src="resultsIcon.png" alt="Results Icon" class="w-56" />
      <h1 class="text-6xl text-white">
        You already voted this week. Click
        <NuxtLink to="/results"
          ><span class="font-gloria font-bold text-[#40c7a3] underline"
            >here</span
          ></NuxtLink
        >
        to see the results.
      </h1>
    </div>
  </div>
</template>
