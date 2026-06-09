<script setup lang="ts">
import { onLaunch, onShow, onHide } from "@dcloudio/uni-app";
import { useUserStore } from "@/stores/user";
import { platformLog } from "@/utils/platform";

onLaunch(() => {
  const app = getApp() as { globalData?: Record<string, unknown> };
  if (!app.globalData) app.globalData = {};
  const store = useUserStore();
  store.hydrateFromStorage();
  platformLog("App", "Launch");
  if (store.isLoggedIn) {
    uni.reLaunch({ url: "/pages/index/index" });
  }
});
onShow(() => {
  console.log("App Show");
});
onHide(() => {
  console.log("App Hide");
});
</script>
<style lang="scss">
page {
  background-color: #f5f3ff;
  color: #1e1b4b;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}
</style>
