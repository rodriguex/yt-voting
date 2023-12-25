<script lang="ts" setup>
const allStore = useAllStore();
const { user } = storeToRefs(allStore);
const router = useRoute();

watchEffect(() => {
  if (process.client) {
    let userFromStorage = JSON.parse(<string>localStorage.getItem("user"));
    if (!user.value && !userFromStorage && router.fullPath !== "/login") {
      navigateTo("/login");
    } else if (!user.value && userFromStorage) {
      user.value = userFromStorage;
    }
  }
});
</script>

<template>
  <div class="w-full h-full">
    <Header />
    <main :style="user ? 'height: calc(100% - 100px)' : 'height: 100%'">
      <slot />
    </main>
  </div>
</template>
