<script lang="ts" setup>
import { channelsList } from "./../mock";

const supabase: any = useSupabaseClient();
const user: any = useSupabaseUser();

const input = ref("");
const searchResults: any = ref([]);
const choosenChannels: any = ref([]);

const isWeekActive = ref(false);
const alreadyVoted = ref(false);
const isUserSignedIn = ref(false);
const loading = ref(true);

onMounted(async () => {
  if (user.value) {
    isUserSignedIn.value = true;

    let getActiveWeek: any = await supabase
      .from("weeks")
      .select("*")
      .eq("active", true);

    if (getActiveWeek.data.length) {
      let beginning = getActiveWeek.data[0].beginning;
      let ending = getActiveWeek.data[0].ending;

      let date = new Date();
      let today = `${date.getFullYear()}-${(date.getMonth() + 1)
        .toString()
        .padStart(2, "0")}-${date
        .getDate()
        .toString()
        .padStart(
          2,
          "0"
        )}T${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;

      let isTodayValid = today >= beginning && today < ending;
      if (isTodayValid) {
        let getUser: any = await supabase
          .from("users")
          .select("*")
          .eq("email", user.value.email);

        if (getUser.data.length) {
          let userVotes: any = await supabase
            .from("votes")
            .select("*")
            .eq("week_id", getActiveWeek.data[0].id)
            .eq("user_id", getUser.data[0].id);

          if (userVotes.data.length < 5) {
            isWeekActive.value = true;
          } else {
            isWeekActive.value = true;
            alreadyVoted.value = true;
          }
        }
      }
    }
  } else {
    isWeekActive.value = true;
  }
  loading.value = false;
});

watch(input, () => {
  if (!input.value) {
    searchResults.value = [];
  }
});

watch(user, async () => {
  if (user.value) {
    if (!isUserSignedIn.value) {
      isUserSignedIn.value = true;
    }

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

function isInList(id: number) {
  return (
    choosenChannels.value.findIndex(
      (channel: any) => channel.id.channelId === id
    ) !== -1
  );
}

async function loginWithGoogle() {
  await supabase.auth.signInWithOAuth({
    provider: "google",
  });
}

function addOrRemoveChannel(channel: any) {
  let index = choosenChannels.value.findIndex(
    (result: any) => result.id.channelId === channel.id.channelId
  );

  if (index !== -1) {
    choosenChannels.value.splice(index, 1);
  } else if (choosenChannels.value.length < 5) {
    choosenChannels.value = [...choosenChannels.value, channel];
  }
}

async function getData() {
  if (input.value) {
    // let req: any = await $fetch(); //   `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${input.value}&key=AIzaSyC7Rk-T-DVGska57yIO08jq3j9hWnY17vU`
    // searchResults.value = req.items;
    setTimeout(() => {
      searchResults.value = channelsList;
    }, 400);
  }
}

async function vote() {
  let getUser: any = await supabase
    .from("users")
    .select("id")
    .eq("email", user.value.email);

  if (getUser.data.length) {
    let getWeek: any = await supabase
      .from("weeks")
      .select("id")
      .eq("active", true);

    if (getWeek.data.length) {
      let data: any = [];

      choosenChannels.value.forEach((choosen: any) => {
        data.push({
          user_id: getUser.data[0].id,
          week_id: getWeek.data[0].id,
          yt_username: choosen.snippet.channelTitle,
          yt_thumb: choosen.snippet.thumbnails.default.url,
        });
      });

      let insert = await supabase.from("votes").insert(data).select();
      if (insert.status === 201) {
        alreadyVoted.value = true;
      }
    }
  }
}
</script>

<template>
  <span
    v-if="loading"
    class="w-full h-screen flex items-center justify-center font-bold text-4xl"
    >Loading...</span
  >

  <div
    v-else-if="!isUserSignedIn"
    class="w-full h-screen flex flex-col items-center justify-center font-bold text-4xl"
  >
    <h2>Please, sign in to be able to vote</h2>
    <button
      v-if="!user"
      class="w-36 h-fit mt-8 rounded border p-3"
      @click="loginWithGoogle"
    >
      Google
    </button>
  </div>

  <div v-else-if="!loading && isWeekActive" class="gap-10 py-5 w-full flex">
    <div class="flex flex-col w-full max-w-3xl">
      <h2
        v-if="alreadyVoted"
        class="w-full h-screen flex items-center justify-center mb-5 font-bold text-4xl"
      >
        Your votes were computed! You can see the results here
      </h2>

      <form
        v-else
        class="flex items-center gap-8 justify-center"
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
        <button class="shadow-md p-5 w-[200px] mt-8 text-2xl rounded-lg">
          Search
        </button>
      </form>

      <div v-if="searchResults.length" class="mt-10 flex flex-wrap gap-5">
        <div
          v-for="result in searchResults"
          class="flex w-full max-w-[370px] items-center gap-3 rounded-md shadow"
          :key="result?.id?.channelId"
          :class="[
            choosenChannels.length === 5 && !isInList(result.id.channelId)
              ? 'cursor-not-allowed bg-gray-200 '
              : 'cursor-pointer bg-white',
          ]"
          @click="addOrRemoveChannel(result)"
        >
          <img
            class="w-[160px] h-full"
            referrerpolicy="no-referrer"
            :src="result?.snippet?.thumbnails?.default?.url"
          />

          <div class="p-3 flex flex-col gap-3">
            <span class="font-bold text-xl text-black">{{
              result?.snippet?.channelTitle
            }}</span>

            <span>{{ isInList(result.id.channelId) ? "Remove" : "Add" }}</span>
          </div>
        </div>
      </div>
    </div>

    <div v-if="!alreadyVoted" class="grow flex flex-col gap-3">
      <span>My voting list</span>

      <div
        v-for="result in choosenChannels"
        class="w-full flex justify-between items-center gap-4 shadow p-4 rounded"
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

      <button
        v-if="choosenChannels.length === 5 && user"
        class="cursor-pointer shadow base shadow-black p-5 mt-5 font-bold text-xl bg-black text-white w-[250px] rounded-lg"
        @click="vote"
      >
        Vote
      </button>

      <span v-if="choosenChannels.length === 5" class="mt-4 text-lg font-bold">
        You just can add 5 channels at max
      </span>
    </div>
  </div>

  <h1
    v-else
    class="w-full h-screen flex items-center justify-center font-bold text-5xl"
  >
    This week is not active for voting, try next week.
  </h1>
</template>
