<script lang="ts" setup>
defineProps({ show: Boolean, setShow: { type: Function, default: () => {} } });
const allStore = useAllStore();
</script>

<template>
  <modal :show="show" :setShow="setShow">
    <div
      class="flex flex-col items-center h-full crazyBg sm:bg-none sm:text-black text-white px-4 sm:px-0"
    >
      <h1
        class="mt-[180px] text-center sm:text-inherit sm:mt-32 text-5xl font-bold font-gloria"
      >
        Hello, this week is over!
      </h1>
      <div
        class="mt-14 text-xl flex flex-col items-center font-normal text-center sm:text-inherit"
      >
        <span
          >You can check out the results
          <NuxtLink
            class="underline text-blue-400 sm:text-blue-600"
            to="/results"
            @click="allStore.setNewWeekModal"
            >here.</NuxtLink
          ></span
        >
        <span
          >From now on your vote is going to this new week leaderboard.</span
        >
      </div>
    </div>
  </modal>
</template>
