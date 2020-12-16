<template>
  <div id="app">
    <div id="nav">
      <router-link to="/">
        Home
      </router-link> |
      <router-link to="/about">
        About
      </router-link> |
      <button
        v-if="!securityCtx.authenticated"
        @click="$emit('ouvrir-session')"
      >
        Ouvrir une session
      </button>
      <div
        v-if="securityCtx.authenticated"
        style="display: inline"
      >
        Bonjour {{ securityCtx.nickName }}
        <span v-if="securityCtx.hasDevopsRole">(membre DevOps)</span> |
        <button @click="$emit('fermer-session')">
          Logout
        </button>
      </div>
    </div>
    <router-view />
  </div>
</template>

<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

#nav {
  padding: 30px;

  a {
    font-weight: bold;
    color: #2c3e50;

    &.router-link-exact-active {
      color: #42b983;
    }
  }
}
</style>
