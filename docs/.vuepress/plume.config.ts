/**
 * 查看以下文档了解主题配置
 * - @see https://theme-plume.vuejs.press/config/intro/ 配置说明
 * - @see https://theme-plume.vuejs.press/config/theme/ 主题配置项
 *
 * 请注意，对此文件的修改不会重启 vuepress 服务，而是通过热更新的方式生效
 * 但同时部分配置项不支持热更新，请查看文档说明
 * 对于不支持热更新的配置项，请在 `.vuepress/config.ts` 文件中配置
 *
 * 特别的，请不要在两个配置文件中重复配置相同的项，当前文件的配置项会覆盖 `.vuepress/config.ts` 文件中的配置
 */

import { defineThemeConfig } from 'vuepress-theme-plume'
import navbar from './navbar'
import notes from './notes'

/**
 * @see https://theme-plume.vuejs.press/config/basic/
 */
export default defineThemeConfig({
  logo: '/logo.png',

  appearance: true,  // 配置 深色模式

  social: [
    { icon: 'github', link: '/' },
  ],
  // navbarSocialInclude: ['github'], // 允许显示在导航栏的 social 社交链接
  // aside: true, // 页内侧边栏， 默认显示在右侧
  // outline: [2, 3], // 页内大纲， 默认显示 h2, h3

  /**
   * 文章版权信息
   * @see https://theme-plume.vuejs.press/guide/features/copyright/
   */
  // copyright: true,

  // prevPage: true,   // 是否启用上一页链接
  // nextPage: true,   // 是否启用下一页链接
  // createTime: true, // 是否显示文章创建时间

  /* 站点页脚 */
  footer: {
    message: (
      `<div style="display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 8px;">` +
        `<span style="white-space: nowrap;">` +
          `<a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer">豫ICP备2025116534号-1</a>` +
        `</span>` +
        `<span>|</span>` +
        `<span style="white-space: nowrap;">` +
          `<a href="https://www.beian.gov.cn/portal/registerSystemInfo?recordcode=41031102000868" target="_blank" rel="noopener noreferrer" style="display: inline-flex; align-items: center;">` +
            `<img src="https://www.xiaozhuhouses.asia/ga.webp" alt="公安备案图标" style="height: 14px; width: 14px; margin-right: 4px;" />` +
            `豫公网安备41031102000868号` +
          `</a>` +
        `</span>` +
      `</div>`
    ),
    copyright: 'Power by <a target="_blank" href="https://v2.vuepress.vuejs.org/">VuePress</a> & <a target="_blank" href="https://theme-plume.vuejs.press">vuepress-theme-plume</a>',
  },

  /**
   * @see https://theme-plume.vuejs.press/config/basic/#profile
   */
  profile: {
    avatar: '/logo.png',
    name: '码上星辰的技术札记',
    description: '码上星辰的技术札记',
    // circle: true,
    // location: '',
    // organization: '',
  },

  navbar,
  notes,

  /**
   * 公告板
   * @see https://theme-plume.vuejs.press/guide/features/bulletin/
   */
  // bulletin: {
  //   layout: 'top-right',
  //   contentType: 'markdown',
  //   title: '公告板标题',
  //   content: '公告板内容',
  // },

  /* 过渡动画 @see https://theme-plume.vuejs.press/config/basic/#transition */
  // transition: {
  //   page: true,        // 启用 页面间跳转过渡动画
  //   postList: true,    // 启用 博客文章列表过渡动画
  //   appearance: 'fade',  // 启用 深色模式切换过渡动画, 或配置过渡动画类型
  // },

})
