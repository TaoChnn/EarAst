const fs = require('node:fs')
const path = require('node:path')
const test = require('node:test')
const assert = require('node:assert/strict')

const projectRoot = path.resolve(__dirname, '..')
const favoritesRoute = 'pages/profile/my-favorites'
const localData = require('../miniprogram/utils/local-data')

test('我的收藏页面已注册到小程序路由', () => {
  const appConfig = JSON.parse(
    fs.readFileSync(path.join(projectRoot, 'miniprogram/app.json'), 'utf8')
  )

  assert.equal(appConfig.pages.includes(favoritesRoute), true)
})

test('个人中心提供我的收藏入口并跳转到已注册页面', () => {
  let profilePage
  let navigatedUrl = ''

  global.wx = {
    getStorageSync() {
      return null
    },
    navigateTo({ url }) {
      navigatedUrl = url
    }
  }
  global.Page = definition => {
    profilePage = definition
  }

  require('../miniprogram/pages/profile/profile')

  const menuItems = profilePage.data.menuGroups.flatMap(group => group.items)
  const favItem = menuItems.find(item => item.id === 'my-favorites')

  assert.ok(favItem)
  assert.equal(favItem.url, `/${favoritesRoute}`)

  profilePage.onMenuTap({
    currentTarget: {
      dataset: { url: favItem.url }
    }
  })
  assert.equal(navigatedUrl, `/${favoritesRoute}`)

  delete global.Page
  delete global.wx
})

test('详情页收藏记录归属关系，不再走裸计数接口', () => {
  const source = fs.readFileSync(
    path.join(projectRoot, 'miniprogram/pages/community/detail.js'),
    'utf8'
  )

  // 收藏/取消走云端关系接口（按方向二选一）；favCount 计数由云函数随关系增减，
  // 客户端不再直接 updateCount 修改 favCount，否则「我的收藏」查不到归属
  assert.match(source, /callCommunity\(nextFaved \? 'favoritePost' : 'unfavoritePost'/)
  assert.doesNotMatch(source, /field: 'favCount'/)
  // 收藏同时落本机，键在清理清单里登记
  assert.match(source, /'post_favs'/)
  assert.equal(localData.SYNCED_KEYS.includes('post_favs'), true)
})

test('游客进入我的收藏按本机收藏拉取内容，登录用户以云端为准', () => {
  const source = fs.readFileSync(
    path.join(projectRoot, 'miniprogram/pages/profile/my-favorites.js'),
    'utf8'
  )

  assert.match(source, /isLoggedIn\(\)/)
  // 游客分支只带 ids 拉内容，登录分支才能触发补同步写入
  assert.match(source, /listPostFavorites', \{ ids: localIds \}/)
  assert.match(source, /listPostFavorites', \{\}/)
  assert.match(source, /callCommunity\('favoritePost', \{ postId: id \}\)/)
})

test('云函数按服务端 OPENID 记录收藏关系并提供列表', () => {
  const source = fs.readFileSync(
    path.join(projectRoot, 'cloudfunctions/communityFunctions/index.js'),
    'utf8'
  )

  assert.match(source, /case 'favoritePost'/)
  assert.match(source, /case 'unfavoritePost'/)
  assert.match(source, /case 'listPostFavorites'/)
  assert.match(source, /collection\('post_favorites'\)/)

  // 归属只能来自服务端 OPENID，不接受客户端传入 openid
  const favoriteFn = source.match(/async function favoritePost[\s\S]*?\n\}/)
  assert.ok(favoriteFn)
  assert.match(favoriteFn[0], /cloud\.getWXContext\(\)/)
  assert.doesNotMatch(favoriteFn[0], /event\.openid/)

  // 收藏列表对游客也开放（按 ids 拉公开帖子），但个人收藏仍按 OPENID 收敛
  const listFn = source.match(/async function listPostFavorites[\s\S]*?\n\}/)
  assert.ok(listFn)
  assert.match(listFn[0], /where\(\{ openid: OPENID \}\)/)
})
