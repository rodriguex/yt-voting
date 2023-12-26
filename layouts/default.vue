<script lang="ts" setup>
const allStore = useAllStore();
const { user, scrollTop } = storeToRefs(allStore);
const router = useRoute();

onMounted(() => {
  document.addEventListener("scroll", () => {
    scrollTop.value = document.documentElement.scrollTop;
  });
});

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
  <div class="w-full">
    <Loading />
    <Header />
    <main>
      <slot />
    </main>
  </div>
</template>
