<script lang="ts" setup>
defineProps({
  show: { type: Boolean },
  setShow: { type: Function, default: () => {} },
  activeWeek: { type: Object },
});
</script>

<template>
  <modal :show="show" :setShow="setShow">
    <div class="w-full flex h-full">
      <div class="crazyBg flex items-center justify-center p-10 rounded-s-md">
        <img src="./clock.png" alt="" class="w-[150px] h-fit" />
      </div>
      <div class="w-full h-full flex items-center justify-center">
        <Countdown
          v-if="activeWeek"
          message="This voting week is going to end in:"
          :endCountdown="new Date(activeWeek.ending)"
        />
      </div>
    </div>
  </modal>
</template>
