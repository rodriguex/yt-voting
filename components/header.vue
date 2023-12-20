<script lang="ts" setup>
const allStore = useAllStore();
const { user } = storeToRefs(allStore);
const userMenu = ref(false);

onMounted(() => {
  if (process.client) {
    let userStorage = JSON.parse(<string>localStorage.getItem("user"));
    if (userStorage) {
      user.value = userStorage;
    } else {
      navigateTo("/login");
    }
  }
});

async function logout() {
  localStorage.removeItem("user");
  user.value = null;
  navigateTo("/login");
}
</script>

<template>
  <div v-if="user" class="h-[100px] w-full sticky top-0 z-20 bg-white shadow">
    <div class="w-full m-auto max-w-6xl flex items-center py-3 justify-between">
      <NuxtLink
        to="/"
        class="font-bold text-3xl border-b-4 border-double border-[#40c7a3] pb-1"
      >
        YT Voting
      </NuxtLink>
      <img
        v-if="user"
        alt="User Picuter"
        class="relative cursor-pointer rounded-full w-[70px]"
        referrerpolicy="no-referrer"
        :src="user.picture"
        @click="userMenu = !userMenu"
      />
      <DropdownBase v-if="userMenu" :show="userMenu" @close="userMenu = false">
        <div
          class="w-[300px] z-30 fixed top-[100px] right-[330px] bg-white shadow-lg flex flex-col gap-2"
        >
          <NuxtLink
            to="/my-votes"
            class="p-3 hover:bg-gray-100 cursor-pointer"
            @click="userMenu = false"
            >My votes</NuxtLink
          >
          <span
            class="cursor-pointer p-3 hover:bg-gray-100"
            @click="
              userMenu = false;
              logout();
            "
            >Logout</span
          >
        </div>
      </DropdownBase>
    </div>
  </div>
</template>
