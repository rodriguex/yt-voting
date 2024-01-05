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
    class="px-4 xl:px-0 absolute top-[100px] w-full flex items-center crazyBg justify-center"
    style="height: calc(100% - 100px)"
  >
    <div class="w-full max-w-4xl flex items-end gap-7">
      <img
        src="~/assets/imgs/resultsIcon.png"
        alt="Results Icon"
        class="hidden md:block w-56"
      />
      <h1 class="text-6xl text-center md:text-start text-white">
        You already voted this week. Check out all
        <NuxtLink to="/results"
          ><span class="font-gloria text-[#40c7a3] underline"
            >results</span
          ></NuxtLink
        >
        here.
      </h1>
    </div>
  </div>
</template>
