<script lang="ts" setup>
import { channelsList } from "./../mock";

const props = defineProps({
  user: Object as any,
  activeWeek: Object as any,
  isWeekActive: Boolean,
  alreadyVoted: Boolean,
  isUserSignedIn: Boolean,
});

const emits = defineEmits(["setAlreadyVoted"]);
const supabase: any = useSupabaseClient();

const input = ref("");
const searchResults: any = ref([]);
const choosenChannels: any = ref([]);

watch(input, () => {
  if (!input.value) {
    searchResults.value = [];
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
    // let req: any = await $fetch(
    //   `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${input.value}&key=${config.public.GOOGLE_KEY}`
    // );
    // searchResults.value = req.items;
    setTimeout(() => {
      searchResults.value = channelsList;
    }, 400);
  }
}

async function vote() {
  let data: any = [];

  choosenChannels.value.forEach((choosen: any) => {
    data.push({
      user_id: props.user.id,
      week_id: props.activeWeek.id,
      yt_username: choosen.snippet.channelTitle,
      yt_thumb: choosen.snippet.thumbnails.default.url,
    });
  });

  let insert = await supabase.from("votes").insert(data).select();
  if (insert.status === 201) {
    emits("setAlreadyVoted", true);
  }
}
</script>

<template>
  <div>
    <div
      v-if="!isUserSignedIn"
      class="w-full flex flex-col items-center justify-center font-bold text-4xl"
      style="height: calc(100vh - 100px)"
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

    <div
      v-else-if="!alreadyVoted && isWeekActive"
      class="gap-10 py-5 w-full flex"
    >
      <div class="flex flex-col w-full max-w-3xl">
        <form
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

              <span>{{
                isInList(result.id.channelId) ? "Remove" : "Add"
              }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="grow flex flex-col gap-3">
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

        <span
          v-if="choosenChannels.length === 5"
          class="mt-4 text-lg font-bold"
        >
          You just can add 5 channels at max
        </span>
      </div>
    </div>

    <h2
      v-else-if="alreadyVoted && isWeekActive"
      class="w-full flex items-center justify-center mb-5 font-bold text-4xl"
      style="height: calc(100vh - 100px)"
    >
      <Countdown
        message="Countdown for the end of this voting week:"
        :endCountdown="new Date(activeWeek.ending)"
      />
    </h2>

    <h1
      v-else-if="!isWeekActive"
      class="w-full flex items-center justify-center font-bold text-5xl"
      style="height: calc(100vh - 100px)"
    >
      <Countdown message="Countdown for the next voting week:" />
    </h1>
  </div>
</template>
