// 护耳技能库 —— 官方指南（本地静态数据）+ 耳友妙招（云函数 tip 板块）
// mode=favorites（「我的」页入口）：只展示收藏过的官方技能，隐藏来源切换；
// 首页入口不带参数，仍是完整技能库。
const { SKILLS, SKILL_CATEGORIES } = require('../../data/skills')
const { formatTime, callCommunity } = require('../community/util')
const { callUser, isLoggedIn, mergeFavorites } = require('../../utils/auth')

const FAV_STORAGE_KEY = 'skill_favs'

Page({
  data: {
    activeSource: 'developer',
    favoritesMode: false,
    sourceTabs: [
      { key: 'developer', label: '官方指南' },
      { key: 'community', label: '耳友妙招' }
    ],
    // 分类筛选
    categories: [{ key: 'all', label: '全部' }, ...SKILL_CATEGORIES.map(c => ({ key: c, label: c }))],
    activeCategory: 'all',
    developerSkills: [],
    developerTotal: SKILLS.length,
    communitySkills: [],
    communityLoading: false,
    communityError: false,
    defaultAvatar: '/images/icons/avatar.png'
  },

  onLoad(options) {
    this.favoritesMode = Boolean(options && options.mode === 'favorites')
    if (this.favoritesMode) {
      this.setData({ favoritesMode: true })
      wx.setNavigationBarTitle({ title: '收藏的技能' })
      return this.applyFavorites()
    }
    this.applyCategory('all')
  },

  onShow() {
    // 收藏模式：从详情页新增/取消收藏返回时刷新列表
    if (this.favoritesMode) this.applyFavorites()
  },

  getFavs() {
    try {
      const favs = wx.getStorageSync(FAV_STORAGE_KEY)
      return Array.isArray(favs) ? favs : []
    } catch (e) {
      return []
    }
  },

  // 收藏模式数据：本地收藏为准，登录时与云端合并（本地独有的会顺带补同步到云端）
  applyFavorites() {
    const localFavs = this.getFavs()
    if (!isLoggedIn()) {
      this.setFavorites(localFavs)
      return Promise.resolve()
    }
    return callUser('listFavorites')
      .then(serverFavs => this.setFavorites(mergeFavorites(localFavs, serverFavs)))
      .catch(() => this.setFavorites(localFavs))
  },

  setFavorites(favIds) {
    this.favoritesSource = favIds
      .map(id => SKILLS.find(skill => skill.id === id))
      .filter(Boolean)
    this.applyCategory(this.data.activeCategory)
  },

  onSelectSource(e) {
    const source = e.currentTarget.dataset.source
    const isValidSource = this.data.sourceTabs.some(item => item.key === source)
    if (!isValidSource || source === this.data.activeSource) return

    this.setData({ activeSource: source })
    // 首次切到耳友妙招时再拉取云端数据
    if (source === 'community' && !this.data.communitySkills.length) {
      this.loadCommunitySkills()
    }
  },

  onSelectCategory(e) {
    this.applyCategory(e.currentTarget.dataset.category)
  },

  applyCategory(category) {
    const base = this.favoritesMode ? (this.favoritesSource || []) : SKILLS
    const filtered = category === 'all'
      ? base
      : base.filter(s => s.category === category)
    this.setData({
      activeCategory: category,
      developerSkills: filtered
    })
  },

  loadCommunitySkills() {
    this.setData({ communityLoading: true, communityError: false })
    callCommunity('listPosts', { tag: 'tip' })
      .then(list => {
        this.setData({
          communityLoading: false,
          communitySkills: list.map(p => ({ ...p, createTime: formatTime(p.createTime) }))
        })
      })
      .catch(() => {
        // 云函数未部署或环境异常时置空，展示空状态
        this.setData({ communityLoading: false, communitySkills: [], communityError: true })
      })
  },

  onPullDownRefresh() {
    if (this.favoritesMode) {
      this.applyFavorites().then(() => wx.stopPullDownRefresh())
      return
    }
    const tasks = [this.applyCategory(this.data.activeCategory)]
    if (this.data.activeSource === 'community') {
      tasks.push(new Promise(resolve => {
        callCommunity('listPosts', { tag: 'tip' })
          .then(list => {
            this.setData({ communitySkills: list.map(p => ({ ...p, createTime: formatTime(p.createTime) })) })
            resolve()
          })
          .catch(() => resolve())
      }))
    }
    Promise.all(tasks).then(() => wx.stopPullDownRefresh())
  },

  onTapSkill(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/skill/detail?id=${id}` })
  },

  onTapCommunityPost(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/community/detail?id=${id}` })
  },

  // 收藏模式空态：去完整技能库逛逛（栈上新开一个非收藏模式的列表页）
  onGoLibrary() {
    wx.navigateTo({ url: '/pages/skill/list' })
  }
})
