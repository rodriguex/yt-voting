<script lang="ts" setup>
defineProps({ show: { type: Boolean } });
const emits = defineEmits(["close"]);
</script>

<template>
  <Teleport to="#__nuxt">
    <div
      v-if="show"
      class="top-0 z-30 absolute w-full h-full bg-[transparent]"
      @click.self="emits('close')"
    >
      <slot />
    </div>
  </Teleport>
</template>
