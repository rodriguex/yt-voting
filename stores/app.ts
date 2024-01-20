import { setScrollBody } from "~/helpers/functions";

export const useAllStore = defineStore("all", () => {
  const supabase = useSupabaseClient();

  const user = ref<any>(null);
  const activeWeek = ref<any>(null);
  const vote = ref<any>(null);
  const alreadyVoted = ref<any>(null);
  const isLoading = ref(false);
  const scrollTop = ref(0);
  const searchInput = ref("");
  const searchResults = ref<any>([]);
  const prevWeeks = ref<any>([]);

  const previousIntervalId = ref<any>(null);
  const intervalId = ref<any>(null);
  const countdownDay = ref<any>(null);
  const countdownHour = ref<any>(null);
  const countdownMin = ref<any>(null);
  const countdownSec = ref<any>(null);
  const isCountdownOver = ref(false);

  async function getActiveWeek() {
    let today = new Date();
    let firstDay = new Date(today.setDate(today.getDate() - today.getDay()));
    let lastDay = new Date(today.setDate(today.getDate() - today.getDay() + 6));

    let fdYear = firstDay.getFullYear();
    let fdMonth = firstDay.getMonth() + 1;
    let fdDay = firstDay.getDate();

    let ldYear = lastDay.getFullYear();
    let ldMonth = lastDay.getMonth() + 1;
    let ldDay = lastDay.getDate();

    let fDayFull = `${fdYear}-${fdMonth.toString().padStart(2, "0")}-${fdDay
      .toString()
      .padStart(2, "0")} 00:00:00`;

    let lDayFull = `${ldYear}-${ldMonth.toString().padStart(2, "0")}-${ldDay
      .toString()
      .padStart(2, "0")} 23:59:59`;

    try {
      let getActiveWeek: any = await supabase
        .from("weeks")
        .select("*")
        .eq("beginning", fDayFull)
        .eq("ending", lDayFull);

      if (getActiveWeek.data.length) {
        activeWeek.value = getActiveWeek.data[0];
      }
    } catch (err) {
      return err;
    }
  }

  async function addVote() {
    let data: any = [];

    data.push({
      user_id: user.value.id,
      week_id: activeWeek.value.id,
      yt_id: vote.value.id.channelId,
      yt_username: vote.value.snippet.channelTitle,
      yt_thumb: vote.value.snippet.thumbnails.high.url,
    });

    isLoading.value = true;
    let insert = await supabase.from("votes").insert(data).select();
    if (insert.status === 201) {
      alreadyVoted.value = true;
    }

    isLoading.value = false;
    navigateTo("/results");
  }

  async function getUserVotes(weekId: number, userId: any) {
    let userVotes: any = await supabase
      .from("votes")
      .select("*")
      .eq("week_id", weekId)
      .eq("user_id", userId);

    return userVotes.data.length ? userVotes.data.length : 0;
  }

  function countdown() {
    if (activeWeek.value?.ending) {
      let now = new Date();
      let evenDate = new Date(activeWeek.value.ending);

      let actualTime = now.getTime();
      let eventTime = evenDate.getTime();
      let remTime = eventTime - actualTime;

      let s = Math.floor(remTime / 1002);
      let m = Math.floor(s / 59);
      let h = Math.floor(m / 60);
      let d = Math.floor(h / 24);

      h %= 24;
      m %= 59;
      s %= 60;

      countdownDay.value = d;
      countdownHour.value = h;
      countdownMin.value = m;
      countdownSec.value = s;
    }
  }

  function restartInterval() {
    previousIntervalId.value = intervalId.value;
    clearInterval(intervalId.value);
    intervalId.value = 0;

    isCountdownOver.value = true;
    setScrollBody("remove");
  }

  async function setNewWeekModal() {
    isCountdownOver.value = false;
    setScrollBody("add");
    setTimeout(async () => {
      await getActiveWeek();
      await getPrevWeeks();
    }, 2000);

    countdownDay.value = null;
    countdownHour.value = null;
    countdownMin.value = null;
    countdownSec.value = null;
  }

  async function getPrevWeeks() {
    try {
      let req = await supabase
        .from("weeks")
        .select("*")
        .lte("beginning", activeWeek.value.beginning)
        .order("id", { ascending: false });
      prevWeeks.value = req.data;
    } catch (err) {
      return err;
    }
  }

  return {
    user,
    activeWeek,
    alreadyVoted,
    getActiveWeek,
    isLoading,
    scrollTop,
    vote,
    addVote,
    getUserVotes,
    searchInput,
    searchResults,
    intervalId,
    countdownDay,
    countdownHour,
    countdownMin,
    countdownSec,
    isCountdownOver,
    countdown,
    restartInterval,
    previousIntervalId,
    setNewWeekModal,
    prevWeeks,
    getPrevWeeks,
  };
});
