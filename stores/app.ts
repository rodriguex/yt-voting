export const useAllStore = defineStore("all", () => {
  const supabase = useSupabaseClient();

  const user = ref<any>(null);
  const activeWeek = ref<any>(null);
  const alreadyVoted = ref<any>(null);
  const isLoading = ref(false);
  const scrollTop = ref(0);

  async function getActiveWeek() {
    try {
      let getActiveWeek: any = await supabase
        .from("weeks")
        .select("*")
        .eq("active", true);

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
