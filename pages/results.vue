<script lang="ts" setup>
const supabase: any = useSupabaseClient();
const data: any = ref([]);

onMounted(async () => {
  let getVotes = await supabase.from("votes").select("*");
  data.value = sortVotes(getVotes.data);

  supabase
    .channel("custom-insert-channel")
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "votes" },
      (payload: any) => {
        let newData = {
          yt_username: payload.new.yt_username,
          yt_thumb: payload.new.yt_thumb,
        };
        data.value = sortVotes([...data.value, newData]);
      }
    )
    .subscribe();
});

function sortVotes(votes: any) {
  let results: any = [];

  votes.forEach((vote: any) => {
    let index = results.findIndex(
      (result: any) => result.yt_username === vote.yt_username
    );

    if (index === -1) {
      results.push({
        yt_username: vote.yt_username,
        yt_thumb: vote.yt_thumb,
        count: 1,
      });
    } else {
      results[index] = { ...results[index], count: results[index].count + 1 };
    }
  });

  results.sort((a: any, b: any) => b.count - a.count);
  return results;
}

async function add() {
  await supabase.from("votes").insert({
    user_id: 3,
    week_id: 1,
    yt_username: "First search channel result",
    yt_thumb:
      "https://www.creativefabrica.com/wp-content/uploads/2022/07/11/YouTube-Thumbnail-Design-Web-Banner-Graphics-33987580-1.jpg",
  });
}
</script>

<template>
  <button class="mt-5 border p-3 text-xl" @click="add">Add one more</button>
  <div class="flex flex-wrap gap-6 mt-10">
    <div
      v-for="d in data"
      :key="data.id"
      class="w-[300px] rounded-md flex flex-col shadow-md"
    >
      <div class="flex flex-col gap-2">
        <span class="p-4 font-bold text-lg">{{ d.yt_username }}</span>
        <img
          class="w-full h-full"
          referrerpolicy="no-referrer"
          :src="d.yt_thumb"
        />
      </div>

      <span class="p-4 mt-5 font-bold text-2xl">{{
        `${d.count} ${d.count === 1 ? "vote" : "votes"}`
      }}</span>
    </div>
  </div>
</template>
