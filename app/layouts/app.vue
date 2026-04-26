<template>
  <NavHeader />
  <div class="flex flex-row w-full h-[calc(100%-var(--ui-header-height))] overflow-hidden">
    <NavSidebar />
    <div class="flex flex-1 flex-col w-[calc(100%-16rem)] h-full min-h-0 overflow-hidden">
      <div class="flex-1 min-h-0 w-full overflow-y-auto"> <slot /> </div>
      <NavBottom />
    </div>
  </div>
</template>
