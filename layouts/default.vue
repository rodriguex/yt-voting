<script lang="ts" setup>
const allStore = useAllStore();
const { user } = storeToRefs(allStore);
</script>

<template>
  <div class="w-full h-full">
    <Header />
    <main :style="user ? 'height: calc(100% - 100px)' : 'height: 100%'">
      <slot />
    </main>
  </div>
</template>
