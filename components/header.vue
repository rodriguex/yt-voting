<script lang="ts" setup>
const allStore = useAllStore();
const { user } = storeToRefs(allStore);
const userMenu = ref(false);

async function logout() {
  localStorage.removeItem("user");
  user.value = null;
  navigateTo("/login");
}
</script>

<template>
  <ClientOnly>
    <div
      v-if="user"
      class="h-[80px] px-4 xl:px-0 w-full sticky top-0 z-20 bg-white shadow"
    >
      <div
        class="w-full m-auto max-w-6xl flex items-center py-3 justify-between relative"
      >
        <NuxtLink
          to="/"
          class="font-bold text-2xl border-b-4 border-double border-[#40c7a3] pb-1"
        >
          YT Voting
        </NuxtLink>
        <img
          alt="User Picture"
          class="cursor-pointer rounded-full w-[60px]"
          referrerpolicy="no-referrer"
          :src="user.picture"
          @click="userMenu = !userMenu"
        />
        <DropdownBase
          v-if="userMenu"
          :show="userMenu"
          @close="userMenu = false"
        >
          <div
            class="w-[300px] z-30 fixed top-[80px] right-[5%] 2xl:right-[15%] bg-white shadow-lg flex flex-col gap-2"
          >
            <NuxtLink
              to="/my-votes"
              class="p-4 hover:bg-gray-100 cursor-pointer"
              @click="userMenu = false"
              >My votes</NuxtLink
            >
            <span
              class="cursor-pointer p-4 hover:bg-gray-100"
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
  </ClientOnly>
</template>
