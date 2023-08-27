<script lang="ts" setup>
const supabase: any = useSupabaseClient();
const user: any = useSupabaseUser();

const input = ref("");
const searchResults: any = ref([]);
const choosenChannels: any = ref([]);

watch(input, () => {
  if (!input.value) {
    searchResults.value = [];
  }
});

watch(user, async () => {
  if (user.value) {
    let findUsers: any = await supabase
      .from("users")
      .select("email")
      .eq("email", user.value.email);

    if (!findUsers.data.length) {
      await supabase.from("users").insert({
        name: user.value.user_metadata.full_name,
        email: user.value.user_metadata.email,
        picture: user.value.user_metadata.avatar_url,
      });
    }
  }
});

async function loginWithGoogle() {
  await supabase.auth.signInWithOAuth({
    provider: "google",
  });
}

async function logout() {
  await supabase.auth.signOut();
}

function addOrRemoveChannel(channel: any) {
  let index = choosenChannels.value.findIndex(
    (result: any) => result.id.channelId === channel.id.channelId
  );

  if (index !== -1) {
    choosenChannels.value.splice(index, 1);
  } else {
    choosenChannels.value = [...choosenChannels.value, channel];
  }
}

async function getData() {
  if (input.value) {
    let req: any = await $fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${input.value}&key=AIzaSyC7Rk-T-DVGska57yIO08jq3j9hWnY17vU`
    );
    searchResults.value = req.items;
  }
}
</script>

<template>
  <div class="flex gap-5 p-5">
    <button
      v-if="!user"
      class="w-36 h-fit mt-8 rounded border p-3"
      @click="loginWithGoogle"
    >
      Google
    </button>
    <div v-if="user" class="flex flex-col items-center gap-3">
      <img
        :src="user.user_metadata.avatar_url"
        class="rounded-full w-20"
        referrerpolicy="no-referrer"
      />
      <button @click="logout">Logout</button>
    </div>

    <div class="flex flex-col gap-3 w-[300px]">
      <div
        v-for="result in choosenChannels"
        class="w-full flex items-center gap-4 shadow p-2"
        :key="result.id.channelId"
      >
        <span class="text-xl text-black">{{
          result.snippet.channelTitle
        }}</span>
        <span
          class="cursor-pointer text-red-600"
          @click="addOrRemoveChannel(result)"
          >Remove</span
        >
      </div>
    </div>

    <div class="grow">
      <form
        class="w-full flex items-center gap-8 max-w-5xl m-auto justify-center"
        @submit.prevent="getData"
      >
        <div class="flex flex-col gap-2 grow">
          <label for="input">Search for channels</label>
          <input
            id="search"
            class="w-full focus:outline-none p-6 shadow rounded-md text-2xl"
            v-model="input"
            autofocus
          />
        </div>
        <button class="border p-3 w-[200px] mt-8 text-2xl rounded">
          Search
        </button>
      </form>

      <div
        v-if="searchResults.length"
        class="w-full max-w-5xl m-auto mt-10 flex flex-col gap-5"
      >
        <div
          v-for="result in searchResults"
          class="cursor-pointer flex items-center gap-3 rounded-md shadow p-3"
          :key="result?.id?.channelId"
          @click="addOrRemoveChannel(result)"
        >
          <img
            class="w-[100px] rounded-full"
            referrerpolicy="no-referrer"
            :src="result?.snippet?.thumbnails?.default?.url"
          />
          <span class="font-bold text-xl text-black">{{
            result?.snippet?.channelTitle
          }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
