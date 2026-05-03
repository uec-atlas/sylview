<template>
  <UContainer class="py-4 space-y-4">
    <UPageHeader title="このサイトについて" />
    <UPageBody :ui="{ base: 'leading-relaxed tracking-wide' }">
      <p class="mb-4">
        UEC SylViewは、電気通信大学の講義情報や進級審査情報を提供するWebサイト(非公式)です。
        学生が履修計画を立てる際の参考情報を提供することを目的としていますが、提供される情報は完全ではない可能性があります。
        科目の詳細な説明や教員の連絡先等、著作権やプライバシーの観点から本サイトに掲載されない情報もあります。
        履修の判断にあたっては、必ずシラバス・学修要覧を確認してください。
      </p>

      <p class="mb-4">
        UEC SylViewのソースコードは、UEC Atlasプロジェクトの一貫として、オープンソースで公開されています。
        機能の提案やバグの報告、コードの貢献などを歓迎しています。詳細はGitHubリポジトリを参照してください。
        <br>
        <UButton
          class="mt-2"
          variant="outline"
          color="neutral"
          icon="mdi:github"
          href="https://github.com/uec-atlas/sylview"
          target="_blank"
          >GitHubリポジトリ</UButton
        >
      </p>

      <h2 class="text-2xl font-bold mt-12 mb-4">データについて</h2>
      <p class="mb-4">
        本サイトに掲載されている情報は、
        <ULink href="https://uec-atlas.org/" target="_blank" rel="noopener noreferrer"
          >UEC Atlas</ULink
        >プロジェクトが提供するオープンデータをもとに生成されています。 なお、UEC AtlasおよびUEC
        SylViewは、電気通信大学の公式なプロジェクトではありません。
        情報の正確性や完全性は保証されないため、最新の情報や正式な情報が必要な場合は、シラバスや学修要覧などの公式資料を参照してください。
        また、本サイトに掲載されている情報に誤りを見つけた場合は、 UEC
        Atlasの運営ポリシーに従って、GitHubリポジトリにて報告・修正をお願いします。
        <br>
        <UButton
          class="mt-2"
          variant="outline"
          color="neutral"
          icon="mdi:github"
          href="https://github.com/uec-atlas/uec-atlas"
          target="_blank"
          >GitHubリポジトリ(UEC Atlas)</UButton
        >
      </p>

      <h2 class="text-2xl font-bold mt-12 mb-4">免責事項</h2>
      <p class="mb-4">
        UEC SylViewのデータは、現状のまま提供されます。UEC SylViewは、データの正確性、完全性、信頼性を保証しません。
        データの利用により生じたいかなる損害についても、UEC SylViewは一切責任を負いません。
      </p>
    </UPageBody>
  </UContainer>
</template>
