<template>
  <NavHeader />
  <div class="flex flex-row w-full h-full">
    <NavSidebar />
    <div class="flex-1">
      <div class="h-full"><slot /></div>
      <NavBottom />
    </div>
  </div>
</template>
