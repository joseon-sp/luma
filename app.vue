<template>
  <div>
    <NuxtPage />
  </div>
</template>

<style lang="css">
*::-webkit-scrollbar {
  height: 10px;
  width: 10px;
}
*::-webkit-scrollbar-track {
  border-radius: 0px;
  background-color: theme("colors.background");
}

*::-webkit-scrollbar-thumb {
  border-radius: 5px;
  background-color: theme("colors.gray.400 / 30%");
}

*::-webkit-scrollbar-thumb:hover {
  background-color: theme("colors.gray.400 / 50%");
}
</style>
