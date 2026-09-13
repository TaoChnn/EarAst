// 帖子详情页 —— 数据来自云函数 communityFunctions
const { formatTime, callCommunity } = require('./util')
const { isLoggedIn } = require('../../utils/auth')

// 本机收藏的帖子 id 列表：游客收藏只留本机，登录用户云端与本机各记一份
const POST_FAVS_KEY = 'post_favs'

function getLocalPostFavs() {
  try {
    const favs = wx.getStorageSync(POST_FAVS_KEY)
    return Array.isArray(favs) ? favs : []
  } catch (e) {
    return []
  }
}

function setLocalPostFav(postId, faved) {
  const favs = getLocalPostFavs().filter(id => id !== postId)
  if (faved) favs.unshift(postId)
  try {
    wx.setStorageSync(POST_FAVS_KEY, favs)
  } catch (e) {
    // 存储失败时仅保留本次会话内的状态
  }
}

Page({
  data: {
    defaultAvatar: '/images/icons/avatar.png',
    post: null,
    comments: [],
    liked: false,
    faved: false,
    inputValue: '',
    canSend: false,
    loading: true
  },

  onLoad(options) {
    this.postId = options.id || ''
    this.loadPost(this.postId)
    this.loadComments(this.postId)
  },

  loadPost(id) {
    const notFound = () => {
      this.setData({ loading: false, post: null, notFound: true })
    }
    if (!id) return notFound()

    callCommunity('getPost', { id })
      .then(post => {
        if (post) {
          // 兼容旧数据：无 images 数组时回退到单张 cover
          const displayImages = post.images && post.images.length
            ? post.images
            : (post.cover ? [post.cover] : [])
          // 收藏状态：云端记录优先（登录），游客回落到本机收藏
          const faved = post.faved === true || getLocalPostFavs().includes(id)
          this.setData({
            loading: false,
            faved,
            post: { ...post, createTime: formatTime(post.createTime), displayImages }
          })
        } else {
          notFound()
        }
      })
      .catch(notFound)
  },

  // 预览帖子图片
  onPreviewImage(e) {
    const current = e.currentTarget.dataset.src
    wx.previewImage({ current, urls: this.data.post.displayImages })
  },

  loadComments(postId) {
    callCommunity('listComments', { postId })
      .then(list => {
        this.setData({
          comments: list.map(c => ({ ...c, createTime: formatTime(c.createTime) }))
        })
      })
      .catch(() => {
        this.setData({ comments: [] })
      })
  },

  onLike() {
    const { post, liked } = this.data
    const delta = liked ? -1 : 1
    this.setData({
      liked: !liked,
      'post.likeCount': post.likeCount + delta
    })
    // 云函数同步计数（失败静默，本地已即时反馈）
    callCommunity('updateCount', { id: this.postId, field: 'likeCount', delta }).catch(() => {})
  },

  onFav() {
    const { post, faved } = this.data
    if (!post) return
    const nextFaved = !faved
    this.setData({
      faved: nextFaved,
      'post.favCount': Math.max(0, (post.favCount || 0) + (nextFaved ? 1 : -1))
    })
    // 收藏关系落本机；登录用户再记到云端（favCount 由云函数随收藏关系增减，
    // 不再走裸计数接口，否则「我的收藏」查不到归属）
    setLocalPostFav(this.postId, nextFaved)
    if (isLoggedIn()) {
      callCommunity(nextFaved ? 'favoritePost' : 'unfavoritePost', { postId: this.postId })
        .catch(() => {})
    }
    wx.showToast({
      title: faved ? '已取消收藏' : (isLoggedIn() ? '收藏成功' : '已收藏，登录后同步'),
      icon: 'none'
    })
  },

  onInputComment(e) {
    const value = e.detail.value
    this.setData({ inputValue: value, canSend: !!value.trim() })
  },

  onSendComment() {
    const content = this.data.inputValue.trim()
    if (!content) {
      wx.showToast({ title: '说点什么吧', icon: 'none' })
      return
    }
    // 先本地上屏，即时反馈
    const comment = {
      _id: 'local-' + Date.now(),
      nickname: '耳友',
      avatar: '',
      createTime: formatTime(new Date()),
      content
    }
    this.setData({
      comments: [...this.data.comments, comment],
      inputValue: '',
      canSend: false,
      'post.commentCount': this.data.post.commentCount + 1
    })
    // 云函数写入（失败静默并提示）
    callCommunity('addComment', { postId: this.postId, content })
      .catch(() => {
        wx.showToast({ title: '评论同步失败，请检查云函数部署', icon: 'none' })
      })
  },

  onShareAppMessage() {
    const post = this.data.post
    // 用户帖没有标题（发帖页无标题输入），回退到正文摘要，避免分享卡片标题为空
    const contentSnippet = post && post.content ? String(post.content).slice(0, 30) : ''
    return {
      title: (post && post.title) || contentSnippet || '耳友圈',
      path: `/pages/community/detail?id=${this.postId}`
    }
  },

  onBack() {
    wx.navigateBack({ delta: 1 })
  },

  // 头像加载失败（云存储权限/文件缺失等）时回落到默认头像
  onPostAvatarError() {
    if (this.data.post && this.data.post.avatar) {
      this.setData({ 'post.avatar': '' })
    }
  },

  onCommentAvatarError(e) {
    const { index } = e.currentTarget.dataset
    const comment = this.data.comments[index]
    if (comment && comment.avatar) {
      this.setData({ [`comments[${index}].avatar`]: '' })
    }
  }
})
