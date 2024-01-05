<script lang="ts" setup>
defineProps({
  show: { type: Boolean },
  channelName: { type: String },
  setShow: { type: Function, default: () => {} },
});
const emits = defineEmits(["confirmVote"]);
</script>

<template>
  <modal :show="show" :setShow="setShow">
    <h1
      class="font-bold text-3xl mt-32 text-center w-[95%] m-auto md:w-full max-w-[600px]"
    >
      Are you sure you to want to vote in
      <span
        class="font-gloria border-b-4 border-double border-[#40c7a3] text-black"
        >{{ channelName }}</span
      >?
    </h1>
    <div class="absolute text-lg bottom-12 flex items-center gap-16">
      <button
        class="border-2 p-3 w-36 rounded-lg border-black crazyBg text-white"
        @click="emits('confirmVote')"
      >
        Confirm vote
      </button>
      <button
        class="border-2 p-3 w-36 rounded-lg border-red-800 text-red-800 hover:bg-red-800 hover:text-white"
        @click="setShow(false)"
      >
        Cancel
      </button>
    </div>
  </modal>
</template>
