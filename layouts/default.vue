<script lang="ts" setup>
const supabase: any = useSupabaseClient();
const user: any = useSupabaseUser();

async function loginWithGoogle() {
  await supabase.auth.signInWithOAuth({
    provider: "google",
  });
}

async function logout() {
  await supabase.auth.signOut();
}
</script>

<template>
  <header class="border w-full p-2 shadow">
    <div class="max-w-7xl m-auto flex justify-between">
      <div class="flex items-center gap-8">
        <NuxtLink to="/" class="text-xl">Home</NuxtLink>
        <NuxtLink to="/results" class="text-xl">Results</NuxtLink>
      </div>

      <button
        v-if="!user"
        class="w-36 h-fit rounded border p-3"
        @click="loginWithGoogle"
      >
        Google
      </button>

      <img
        v-if="user"
        class="cursor-pointer rounded-full w-16"
        referrerpolicy="no-referrer"
        :src="user.user_metadata.avatar_url"
        @click="logout"
      />
    </div>
  </header>

  <main class="w-full max-w-7xl m-auto">
    <slot />
  </main>
</template>
