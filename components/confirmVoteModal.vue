<script lang="ts" setup>
defineProps({
  show: { type: Boolean },
  channelName: { type: String },
  channelPic: { type: String },
  setShow: { type: Function, default: () => {} },
});
const emits = defineEmits(["confirmVote"]);
</script>

<template>
  <modal :show="show" :setShow="setShow">
    <h1
      class="font-normal text-3xl mt-10 sm:mt-[130px] text-center w-[95%] md:w-full max-w-[600px]"
    >
      Are you sure you to want to vote in
      <span class="font-gloria font-bold text-black">{{ channelName }}</span
      >?
    </h1>
    <div class="h-full absolute top-0 flex items-center justify-center">
      <img
        :src="channelPic"
        alt="Channel Picture"
        class="w-[300px] sm:hidden rounded-full"
      />
    </div>
    <div class="absolute text-lg bottom-12 flex items-center gap-16">
      <button
        class="border-2 font-normal p-3 w-[150px] sm:w-[180px] rounded-lg crazyBg text-white"
        @click="emits('confirmVote')"
      >
        Confirm vote
      </button>
      <button
        class="border-2 p-3 w-[130px] sm:w-[180px] font-normal rounded-lg border-red-800 text-red-800 hover:bg-red-800 hover:text-white"
        @click="setShow(false)"
      >
        Cancel
      </button>
    </div>
  </modal>
</template>
