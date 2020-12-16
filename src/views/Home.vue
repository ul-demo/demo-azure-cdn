<template>
  <div class="home">
    <HelloWorld
      msg="Bienvenue à cette démo de Azure, Pulumi et Github :')))"
    />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

import HelloWorld from "@/components/HelloWorld.vue"; // @ is an alias to /src

@Component({
  components: {
    HelloWorld,
  },
})
export default class Home extends Vue {}
</script>
