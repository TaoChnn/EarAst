// 我的收藏 —— 收藏的社区帖子
// 登录用户以云端收藏关系（communityFunctions.listPostFavorites）为准；
// 游客收藏只在本机（pages/community/detail 的 post_favs），进入本页时按 id 拉取内容。
// 本机有、云端没有的收藏（登录前收藏的）会补同步到云端后并入展示。
const { formatTime, callCommunity } = require('../community/util')
const { isLoggedIn } = require('../../utils/auth')

const POST_FAVS_KEY = 'post_favs'

Page({
  data: {
    defaultAvatar: '/images/icons/avatar.png',
    posts: [],
    loading: true
  },

  onShow() {
    this.loadFavorites()
  },

  getLocalFavs() {
    try {
      const favs = wx.getStorageSync(POST_FAVS_KEY)
      return Array.isArray(favs) ? favs : []
    } catch (e) {
      return []
    }
  },

  removeLocalFav(postId) {
    try {
      const favs = this.getLocalFavs().filter(id => id !== postId)
      wx.setStorageSync(POST_FAVS_KEY, favs)
    } catch (e) {
      // 本机清理失败不影响列表展示
    }
  },

  loadFavorites() {
    this.setData({ loading: true })
    const localIds = this.getLocalFavs()

    // 游客：本机收藏按 id 拉内容（帖子公开读）
    if (!isLoggedIn()) {
      if (!localIds.length) {
        this.setData({ loading: false, posts: [] })
        return Promise.resolve()
      }
      return callCommunity('listPostFavorites', { ids: localIds })
        .then(list => this.setData({ loading: false, posts: this.decorate(list) }))
        .catch(() => this.setData({ loading: false, posts: [] }))
    }

    // 登录：云端收藏为准；本机多出的收藏补同步后并入展示
    return callCommunity('listPostFavorites', {})
      .then(list => {
        const serverIds = (list || []).map(p => p._id)
        const localOnly = localIds.filter(id => !serverIds.includes(id))
        localOnly.forEach(id => callCommunity('favoritePost', { postId: id }).catch(() => {}))
        const hydrate = localOnly.length
          ? callCommunity('listPostFavorites', { ids: localOnly }).catch(() => [])
          : Promise.resolve([])
        return hydrate.then(extra => {
          this.setData({
            loading: false,
            posts: this.decorate([...(list || []), ...(extra || [])])
          })
        })
      })
      .catch(() => this.setData({ loading: false, posts: [] }))
  },

  decorate(list) {
    return (list || []).map(p => ({
      ...p,
      createTime: formatTime(p.createTime),
      cover: p.cover || (p.images && p.images.length ? p.images[0] : '')
    }))
  },

  onTapPost(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/community/detail?id=${id}` })
  },

  onRemoveFav(e) {
    const id = e.currentTarget.dataset.id
    if (!id) return
    this.removeLocalFav(id)
    this.setData({ posts: this.data.posts.filter(p => p._id !== id) })
    if (isLoggedIn()) {
      callCommunity('unfavoritePost', { postId: id }).catch(() => {})
    }
    wx.showToast({ title: '已取消收藏', icon: 'none' })
  },

  onGoCommunity() {
    wx.switchTab({ url: '/pages/community/community' })
  }
})
