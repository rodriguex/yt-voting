<script lang="ts" setup>
defineProps({ user: { type: Object } });
const emits = defineEmits(["logout"]);
const userMenu = ref(false);
</script>

<template>
  <div class="w-full sticky top-0 z-20 bg-white shadow">
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
        :src="user.picture"
        @click="userMenu = !userMenu"
      />
      <DropdownBase v-if="userMenu" :show="userMenu" @close="userMenu = false">
        <div
          class="w-[300px] z-30 fixed top-[100px] right-[330px] bg-white shadow-lg flex flex-col gap-4 p-5 rounded-lg"
        >
          <span
            class="cursor-pointer"
            @click="
              userMenu = false;
              emits('logout');
            "
            >Logout</span
          >
        </div>
      </DropdownBase>
    </div>
  </div>
</template>
