export const useAllStore = defineStore("all", () => {
  const supabase = useSupabaseClient();

  const user = ref<any>(null);
  const activeWeek = ref<any>(null);
  const alreadyVoted = ref<any>(null);
  const isLoading = ref(false);
  const scrollTop = ref(0);

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
      .padStart(2, "0")} 23:59:00`;

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

  return {
    user,
    activeWeek,
    alreadyVoted,
    getActiveWeek,
    isLoading,
    scrollTop,
  };
});
