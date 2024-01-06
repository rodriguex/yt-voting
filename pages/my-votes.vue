<script lang="ts" setup>
import { formatDate } from "~/helpers/functions";

const allStore = useAllStore();
const { user, activeWeek, isLoading } = storeToRefs(allStore);

const supabase = useSupabaseClient();
const votes = ref<any>([]);
const filteredVotes = ref<any>([]);
const weekInput = ref<any>(null);
const allPrevWeeks = ref<any>([]);

onMounted(async () => {
  if (!activeWeek.value) {
    await allStore.getActiveWeek();
  }

  isLoading.value = true;
  try {
    let weeksReq = await supabase
      .from("weeks")
      .select("*")
      .lte("beginning", activeWeek.value?.beginning)
      .order("id", { ascending: false });

    allPrevWeeks.value = weeksReq.data;

    try {
      let req = await supabase
        .from("votes")
        .select("*, weeks (id, beginning, ending)")
        .eq("user_id", user.value?.id)
        .order("id", { ascending: false });

      votes.value = req.data;
      filteredVotes.value = req.data;
    } catch (err) {
      return err;
    }
  } catch (err) {
    return err;
  }
  isLoading.value = false;
});

function filterVotesHistory() {
  filteredVotes.value = votes.value.filter(
    (vote: any) => vote.weeks.id === weekInput.value.id
  );
}
</script>

<template>
  <div class="h-full">
    <div class="px-4 xl:px-4 flex flex-col pb-20 w-full max-w-6xl m-auto">
      <h1 class="mt-12 text-3xl font-gloria">My votes page</h1>
      <div class="mt-10 flex flex-col gap-2">
        <label for="input">Sort by week</label>
        <select
          id="input"
          v-model="weekInput"
          class="w-full md:w-[350px] p-3 text-black focus:outline-none"
          @change="filterVotesHistory"
        >
          <option :value="null" disabled>Choose an option</option>
          <option v-for="week in allPrevWeeks" :key="week.id" :value="week">
            {{ `${formatDate(week.beginning)} / ${formatDate(week.ending)}` }}
          </option>
        </select>
      </div>
      <div class="mt-10 flex flex-col gap-5">
        <div
          v-for="vote in filteredVotes"
          :key="vote.id"
          class="bg-white border md:border-none md:shadow p-7 rounded-xl flex flex-col w-full max-w-[700px]"
        >
          <div class="flex flex-col">
            <span>Voting week</span>
            <h2 class="font-bold text-2xl mt-2">
              {{
                `${formatDate(vote.weeks.beginning)} / ${formatDate(
                  vote.weeks.ending
                )}`
              }}
            </h2>
            <span class="italic font-normal text-lg"
              >(voted in {{ `${formatDate(vote.created_at)}` }})</span
            >
          </div>
          <img
            :src="vote.yt_thumb"
            alt="Channel Picture"
            class="w-[300px] rounded-lg mt-4"
          />
          <span class="mt-4 text-xl font-gloria">{{ vote.yt_username }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
