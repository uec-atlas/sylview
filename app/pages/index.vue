<template>
  <UPageHero
    :ui="{
      root: 'bg-primary-100 dark:bg-primary-950 text-center py-16',
    }"
    description="UEC SylViewは、電気通信大学の講義情報や進級審査の情報を提供するWebサイト(非公式)です。"
  >
    <template #title>
      <h1 class="text-4xl font-bold break-keep wrap-anywhere">履修計画を、<wbr>もっと<wbr>スマートに。</h1>
    </template>
    <template #body>
      <form action="/lectures" method="GET">
        <UFieldGroup size="xl">
          <UInput type="search" name="q" placeholder="講義名、担当教員名で検索" />
          <UButton type="submit" icon="mdi:magnify">検索</UButton>
        </UFieldGroup>
      </form>
    </template>
  </UPageHero>
  <UPageSection headline="Features" title="主な機能">
    <UPageColumns>
      <UPageCard title="直感的な科目検索" icon="mdi:magnify" class="items-start" to="/lectures">
        <p>講義名や担当教員名、開講時限など、さまざまな条件で科目を検索できます。</p>
      </UPageCard>
      <UPageCard title="進級審査チェック" icon="mdi:folder-check-outline" class="items-start" to="/checkpoints">
        <p>進級審査の要件を確認できます。必要な単位数や対象科目を把握して、効率的に履修計画を立てましょう。</p>
      </UPageCard>
      <UPageCard title="履修シミュレーション(実装中)" icon="mdi:school" class="items-start">
        <p>履修計画をシミュレーションできます。履修したい科目を選択して、進級審査の要件を満たせるか確認しましょう。</p>
      </UPageCard>
    </UPageColumns>
  </UPageSection>
</template>
