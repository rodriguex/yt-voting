<script lang="ts" setup>
import { decodeHtml, setScrollBody } from "~/helpers/functions";
import { channelPageDataMock, channelVideosMock } from "./../../mock";

const config = useRuntimeConfig();
const id = useRoute().params.id;
const supabase = useSupabaseClient();

const channelData = ref<any>(null);
const channelVideos = ref<any>([]);
const channelHistory = ref<any>(null);

const weekList = ref<any>([]);
const weekInput = ref<any>(null);

const showModal = ref(false);
const currentVideoUrl = ref("");

const allStore = useAllStore();
const { activeWeek, isLoading } = storeToRefs(allStore);

onMounted(async () => {
  let mainDiv = document.getElementById("__nuxt");
  if (mainDiv) {
    mainDiv.scrollTop = 0;
  }

  isLoading.value = true;
  try {
    if (!activeWeek.value) {
      await allStore.getActiveWeek();
    }
    await getWeeks();
    // await getChannelData();
    // await getChannelStats();
    // await getChannelVideos();
    await getChannelVotes();
    setTimeout(() => {
      channelData.value = channelPageDataMock;
      channelVideos.value = channelVideosMock;
      isLoading.value = false;
    }, 400);
  } catch (err) {
    return err;
  }
  isLoading.value = false;
});

async function getWeeks() {
  try {
    let req: any = await supabase
      .from("weeks")
      .select("*")
      .lte("beginning", activeWeek.value.beginning)
      .order("id", { ascending: false });
    weekList.value = req.data;
    weekInput.value = req.data[0];
  } catch (err) {
    return err;
  }
}

async function getChannelData() {
  try {
    let req: any = await $fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=snippet&id=${id}&key=${config.public.GOOGLE_API_KEY}`
    );
    if (req.items.length) {
      channelData.value = req.items[0].snippet;
    }
  } catch (err) {
    return err;
  }
}

async function getChannelStats() {
  try {
    let req: any = await $fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${id}&key=${config.public.GOOGLE_API_KEY}`
    );
    if (req.items.length) {
      channelData.value.stats = req.items[0].statistics;
    }
  } catch (err) {
    return err;
  }
}

async function getChannelVideos() {
  try {
    let req: any = await $fetch(
      `https://www.googleapis.com/youtube/v3/search?key=${config.public.GOOGLE_API_KEY}&channelId=${id}&part=snippet,id&order=date&maxResults=6&type=video`
    );
    if (req.items.length) {
      channelVideos.value = req.items;
    }
  } catch (err) {
    return err;
  }
}

async function getChannelVotes() {
  try {
    let req: any = await supabase
      .from("votes")
      .select("*")
      .eq("week_id", activeWeek.value.id);
    if (req.data.length) {
      channelHistory.value = sortVotes(req.data);
      channelHistory.value = sortChannelsPosition(channelHistory.value);
      channelHistory.value = channelHistory.value.filter(
        (channel: any) => channel.yt_id === id
      )[0];
    }
  } catch (err) {
    return err;
  }
}

function sortVotes(votes: any) {
  let results: any = [];

  votes.forEach((vote: any) => {
    let index = results.findIndex((result: any) => result.yt_id === vote.yt_id);

    if (index === -1) {
      results = [
        ...results,
        {
          yt_id: vote.yt_id,
          yt_username: vote.yt_username,
          yt_thumb: vote.yt_thumb,
          count: 1,
        },
      ];
    } else {
      results[index] = {
        ...results[index],
        count: results[index].count + 1,
      };
    }
  });

  return results.sort((a: any, b: any) => b.count - a.count);
}

function sortChannelsPosition(votesArray: any) {
  if (votesArray.length) {
    let arr: any = [];
    let order: any = [];

    votesArray.forEach((channel: any) => {
      if (!arr.includes(channel.count)) {
        arr.push(channel.count);
      }
    });

    votesArray.forEach((channel: any) => {
      arr.forEach((vote: any, voteIndex: number) => {
        if (channel.count === vote) {
          order.push({
            yt_id: channel.yt_id,
            yt_username: channel.yt_username,
            yt_thumb: channel.yt_thumb,
            count: channel.count,
            position: voteIndex + 1,
          });
        }
      });
    });

    return order;
  }
}

async function getChannelPosition() {
  try {
    let req: any = await supabase
      .from("votes")
      .select("*")
      .eq("week_id", weekInput.value.id);
    let data: any = sortVotes(req.data);
    if (data.length) {
      data = sortChannelsPosition(data);
      data = data.filter((channel: any) => channel.yt_id === id);
      if (data) {
        channelHistory.value = data[0];
      } else {
        channelHistory.value = null;
      }
    } else {
      channelHistory.value = null;
    }
  } catch (err) {
    return err;
  }
}

function formatNumbers(value: number) {
  return new Intl.NumberFormat().format(value);
}

function setupModal(video: any) {
  currentVideoUrl.value = video.id.videoId;
  showModal.value = true;
  setScrollBody("remove");
}

function setModal(value: boolean) {
  showModal.value = value;
  setScrollBody("add");
}
</script>

<template>
  <ClientOnly>
    <div
      v-if="channelData && !isLoading"
      class="px-4 xl:px-0 flex flex-col w-full max-w-6xl m-auto pb-20"
    >
      <div class="mt-10">
        <h1 class="font-bold text-center md:text-start text-5xl">
          {{ channelData.title }}
        </h1>
        <div
          class="mt-10 flex flex-col md:flex-row border bg-white border-gray-200 w-full md:max-w-[1000px] rounded-lg"
        >
          <img
            :src="channelData.thumbnails.high.url"
            alt="Channel picture"
            class="w-full md:w-[300px] rounded-t-lg md:rounded-s-lg"
            referrerpolicy="no-referrer"
          />
          <div class="flex flex-col gap-3 justify-center text-lg mx-5 py-2">
            <div class="flex flex-col gap-1">
              <span class="font-bold">Description:</span>
              <span
                class="max-w-[600px] line-clamp-2 overflow-hidden text-ellipsis"
                >{{ decodeHtml(channelData.description) }}</span
              >
            </div>
            <div class="flex gap-2">
              <span class="font-bold">Subscribers:</span>
              <span>{{
                formatNumbers(channelData.stats.subscriberCount)
              }}</span>
            </div>
            <div class="flex gap-2">
              <span class="font-bold">Total Videos:</span>
              <span>{{ formatNumbers(channelData.stats.videoCount) }}</span>
            </div>
            <div class="flex gap-2">
              <span class="font-bold">Total views:</span>
              <span>{{ formatNumbers(channelData.stats.viewCount) }}</span>
            </div>
            <div class="flex gap-2">
              <span class="font-bold">Youtube url:</span>
              <a
                class="underline text-blue-700"
                target="_blank"
                :href="`http://www.youtube.com/${channelData.customUrl}`"
                >{{ `youtube.com/${channelData.customUrl}` }}</a
              >
            </div>
            <div class="flex gap-2">
              <span class="font-bold">Created at:</span>
              <span>{{
                `${(new Date(channelData.publishedAt).getMonth() + 1)
                  .toString()
                  .padStart(2, "0")}-${new Date(channelData.publishedAt)
                  .getDate()
                  .toString()
                  .padStart(2, "0")}-${new Date(
                  channelData.publishedAt
                ).getFullYear()}`
              }}</span>
            </div>
          </div>
        </div>
      </div>
      <div class="mt-16">
        <h2 class="font-bold text-5xl text-center md:text-start">
          Latest Videos
        </h2>
        <div
          class="mt-10 flex justify-center md:justify-normal flex-wrap gap-8"
        >
          <div
            v-for="(video, index) in channelVideos"
            class="flex flex-col h-[350px] text-lg gap-3 shadow rounded-lg relative cursor-pointer"
            :key="index"
            @click="setupModal(video)"
          >
            <div
              class="relative w-full md:w-[480px] rounded-t-lg h-[204px]"
              :style="`background: url('${video.snippet.thumbnails.high.url}') center no-repeat`"
            ></div>
            <div
              class="absolute top-0 w-full h-[204px] flex items-center justify-center fill-white"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="40"
                width="40"
                viewBox="0 0 512 512"
              >
                <path
                  d="M0 256a256 256 0 1 1 512 0A256 256 0 1 1 0 256zM188.3 147.1c-7.6 4.2-12.3 12.3-12.3 20.9V344c0 8.7 4.7 16.7 12.3 20.9s16.8 4.1 24.3-.5l144-88c7.1-4.4 11.5-12.1 11.5-20.5s-4.4-16.1-11.5-20.5l-144-88c-7.4-4.5-16.7-4.7-24.3-.5z"
                />
              </svg>
            </div>
            <div class="flex flex-col gap-1 px-3 pb-4">
              <span
                class="max-w-[400px] font-bold text-xl line-clamp-2 overflow-hidden"
                >{{ decodeHtml(video.snippet.title) }}</span
              >
              <span class="mt-3 absolute bottom-5"
                >Published at:
                {{
                  `${(new Date(video.snippet.publishedAt).getMonth() + 1)
                    .toString()
                    .padStart(2, "0")}-${new Date(video.snippet.publishedAt)
                    .getDate()
                    .toString()
                    .padStart(2, "0")}-${new Date(
                    video.snippet.publishedAt
                  ).getFullYear()}`
                }}</span
              >
            </div>
          </div>
        </div>
      </div>
      <div class="mt-12 flex flex-col gap-5">
        <h1 class="text-4xl text-center md:text-start">
          <span class="font-bold">{{ channelData.title }}</span>
          votes history
        </h1>
      </div>
      <div class="flex flex-col gap-1 w-full md:w-[400px] mt-10">
        <label for="input">Sort by week</label>
        <select
          id="input"
          v-model="weekInput"
          class="focus:outline-none p-3"
          @change="getChannelPosition"
        >
          <option :value="null" disabled>Select an option</option>
          <option v-for="week in weekList" :key="week.id" :value="week">
            {{
              `${new Date(week.beginning)
                .getDate()
                .toString()
                .padStart(2, "0")}/${(new Date(week.beginning).getMonth() + 1)
                .toString()
                .padStart(2, "0")} - ${new Date(week.ending)
                .getDate()
                .toString()
                .padStart(2, "0")}/${(new Date(week.ending).getMonth() + 1)
                .toString()
                .padStart(2, "0")}`
            }}
          </option>
        </select>
      </div>
      <div
        v-if="channelHistory"
        class="mt-8 border md:border-none rounded-lg md:shadow w-full md:w-[400px] flex flex-col"
      >
        <img
          :src="channelData.thumbnails.high.url"
          alt="Channel's Thumb"
          class="w-full rounded"
          referrerpolicy="no-referrer"
        />
        <div class="p-4">
          <div class="mt-5 flex items-center text-3xl">
            <h2 class="font-bold">Position:</h2>
            <span class="ml-2">{{ channelHistory?.position }}</span>
          </div>
          <div class="mt-5 flex text-3xl items-center">
            <h2 class="font-bold">Votes:</h2>
            <span class="ml-2">{{ channelHistory?.count }}</span>
          </div>
        </div>
      </div>
      <span v-else class="font-bold text-2xl mt-8"
        >No votes computed in the selected week</span
      >

      <VideoModal
        :show="showModal"
        :setShow="setModal"
        :videoUrl="currentVideoUrl"
        :hideCloseIconBigScreen="true"
      />
    </div>
  </ClientOnly>
</template>
