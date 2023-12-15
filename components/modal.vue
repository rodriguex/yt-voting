<script lang="ts" setup>
defineProps({ show: { type: Boolean }, channelName: { type: String } });
const emits = defineEmits(["setShow"]);
</script>

<template>
  <Transition v-if="show">
    <div
      class="absolute top-0 w-full h-full z-30 bg-[#000000b8] flex items-center justify-center"
      @click.self="emits('setShow', false, false)"
    >
      <div
        class="flex flex-col rounded-lg items-center opacity-100 relative bg-white text-black font-bold w-full max-w-3xl h-full max-h-[380px] m-auto"
      >
        <img
          src="closeIcon.png"
          alt="Close modal icon"
          class="w-6 absolute right-10 top-8 cursor-pointer"
          @click="emits('setShow', false, false)"
        />
        <h1 class="font-bold text-3xl mt-32 text-center w-full max-w-[600px]">
          Are you sure you to want to vote in
          <span
            class="font-gloria border-b-4 border-double border-[#40c7a3] text-black"
            >{{ channelName }}</span
          >?
        </h1>
        <div class="absolute text-lg bottom-12 flex items-center gap-16">
          <button
            class="border-2 p-3 w-36 rounded-lg border-black crazyBg text-white"
            @click="emits('setShow', false, true)"
          >
            Confirm vote
          </button>
          <button
            class="border-2 p-3 w-36 rounded-lg border-red-800 text-red-800 hover:bg-red-800 hover:text-white"
            @click="emits('setShow', false, false)"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>
