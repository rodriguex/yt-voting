<script lang="ts" setup>
defineProps({
  show: { type: Boolean },
  setShow: { type: Function, default: () => {} },
});
</script>

<template>
  <Transition v-if="show">
    <div
      class="absolute top-0 w-full h-full z-30 bg-[#000000b8] flex items-center justify-center"
      @click.self="setShow(false)"
    >
      <div
        class="flex flex-col rounded-lg items-center relative bg-white text-black font-bold w-full max-w-3xl h-full max-h-[380px] m-auto"
      >
        <img
          src="closeIcon.png"
          alt="Close modal icon"
          class="w-6 absolute right-10 top-8 cursor-pointer"
          @click="setShow(false)"
        />
        <slot />
      </div>
    </div>
  </Transition>
</template>
