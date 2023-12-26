<script lang="ts" setup>
const supabase = useSupabaseClient();
const username = useRoute().params.username;

const channelData = ref<any>(null);
const weekList = ref<any>([]);
const channelHistory = ref<any>(null);
const weekInput = ref<any>(null);
const loadingState = ref(false);

const allStore = useAllStore();
const { activeWeek } = storeToRefs(allStore);

onMounted(async () => {
  let mainDiv = document.getElementById("__nuxt");
  if (mainDiv) {
    mainDiv.scrollTop = 0;
  }

  loadingState.value = true;
  try {
    let channelDataReq: any = await supabase
      .from("votes")
      .select("*")
      .eq("yt_username", username);
    channelData.value = channelDataReq.data[0];

    if (!activeWeek.value) {
      await allStore.getActiveWeek();
    }

    try {
      let weekListReq: any = await supabase
        .from("weeks")
        .select("*")
        .lte("beginning", activeWeek.value.beginning)
        .order("id", { ascending: false });
      weekList.value = weekListReq.data;
      weekInput.value = weekListReq.data[0];

      try {
        let channelHistoryReq: any = await supabase
          .from("votes")
          .select("*")
          .eq("week_id", activeWeek.value.id);
        channelHistory.value = sortVotes(channelHistoryReq.data);
        channelHistory.value = sortChannelsPosition(channelHistory.value);
        channelHistory.value = channelHistory.value.filter(
          (channel: any) =>
            channel.yt_username === channelData.value.yt_username
        )[0];
      } catch (err) {
        return err;
      }
    } catch (err) {
      return err;
    }
  } catch (err) {
    return err;
  }
  loadingState.value = false;
});

function sortVotes(votes: any) {
  let results: any = [];

  votes.forEach((vote: any) => {
    let index = results.findIndex(
      (result: any) => result.yt_username === vote.yt_username
    );

    if (index === -1) {
      results = [
        ...results,
        {
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
  loadingState.value = true;
  try {
    let req: any = await supabase
      .from("votes")
      .select("*")
      .eq("week_id", weekInput.value.id);
    let data: any = sortVotes(req.data);
    if (data.length) {
      data = sortChannelsPosition(data);
      data = data.filter(
        (channel: any) => channel.yt_username === channelData.value.yt_username
      );
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
  loadingState.value = false;
}
</script>

<template>
  <ClientOnly>
    <Loading :show="loadingState" />
    <div v-if="channelData" class="flex flex-col w-full max-w-6xl m-auto pb-20">
      <div class="mt-12 flex flex-col gap-5">
        <h1 class="text-4xl font-gloria">
          <span class="font-bold">{{ username }}</span> votes history
        </h1>
      </div>
      <div class="flex flex-col gap-1 w-[400px] mt-10">
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
              `${new Date(week.beginning).getDate()}/${
                new Date(week.beginning).getMonth() + 1
              } - ${new Date(week.ending).getDate()}/${
                new Date(week.ending).getMonth() + 1
              }`
            }}
          </option>
        </select>
      </div>
      <div
        v-if="channelHistory"
        class="mt-8 shadow-lg rounded w-[400px] flex flex-col"
      >
        <img
          :src="channelData.yt_thumb"
          alt="Channel's Thumb"
          class="w-full rounded"
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
    </div>
  </ClientOnly>
</template>
