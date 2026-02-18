export const SITE = {
  website: "https://miniade.github.io",
  author: "阿德",
  profile: "https://github.com/edxi",
  desc: "阿德的博客 - 记录技术、思考与生活",
  title: "阿德的博客",
  ogImage: "astropaper-og.jpg",
  lightAndDarkMode: true,
  postPerIndex: 5,
  postPerPage: 10,
  scheduledPostMargin: 15 * 60 * 1000,
  showArchives: true,
  showBackButton: true,
  editPost: {
    enabled: true,
    text: "编辑",
    url: "https://github.com/miniade/edxi-blog-astro/edit/main/",
  },
  dynamicOgImage: true,
  dir: "ltr",
  lang: "zh-CN",
  timezone: "Asia/Shanghai",
  // Test deployment trigger: 2026-02-18
} as const;
