<script lang="ts" setup>
defineProps({
  show: { type: Boolean },
  setShow: { type: Function, default: () => {} },
  hideCloseIconBigScreen: { type: Boolean, default: false },
});

const allStore = useAllStore();
const { scrollTop } = storeToRefs(allStore);
</script>

<template>
  <Teleport to="body" v-if="show">
    <div
      class="absolute w-full h-screen z-30 bg-[#000000b8] flex items-center justify-center"
      :style="[scrollTop > 0 ? `top: ${scrollTop}px` : `top: 0px`]"
      @click.self="setShow(false)"
    >
      <div
        class="flex flex-col rounded-lg items-center relative bg-white text-black font-bold w-full max-w-3xl h-full sm:max-h-[380px] m-auto"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="30"
          height="30"
          viewBox="0 0 24 24"
          :class="[hideCloseIconBigScreen ? 'absolute sm:hidden' : 'absolute']"
          class="text-white sm:text-red-700 right-10 top-[60px] cursor-pointer"
          @click="setShow(false)"
        >
          <path
            fill="currentColor"
            d="M6.4 19L5 17.6l5.6-5.6L5 6.4L6.4 5l5.6 5.6L17.6 5L19 6.4L13.4 12l5.6 5.6l-1.4 1.4l-5.6-5.6z"
          />
        </svg>
        <slot />
      </div>
    </div>
  </Teleport>
</template>
