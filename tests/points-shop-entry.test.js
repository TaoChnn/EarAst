const fs = require('node:fs')
const path = require('node:path')
const test = require('node:test')
const assert = require('node:assert/strict')

const projectRoot = path.resolve(__dirname, '..')
const shopRoute = 'pages/profile/points-shop'
const localData = require('../miniprogram/utils/local-data')
const auth = require('../miniprogram/utils/auth')
const { SESSION_KEY } = localData
let shopPageDefinition

test('积分商城页面已注册到小程序路由', () => {
  const appConfig = JSON.parse(
    fs.readFileSync(path.join(projectRoot, 'miniprogram/app.json'), 'utf8')
  )

  assert.equal(appConfig.pages.includes(shopRoute), true)
})

test('个人中心积分商城入口跳转到已注册页面', () => {
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
  const shopItem = menuItems.find(item => item.id === 'points-shop')

  assert.ok(shopItem)
  assert.equal(shopItem.url, `/${shopRoute}`)

  profilePage.onMenuTap({
    currentTarget: {
      dataset: { url: shopItem.url }
    }
  })
  assert.equal(navigatedUrl, `/${shopRoute}`)

  delete global.Page
  delete global.wx
})

test('积分商城默认展示商品目录、分类筛选与零积分占位余额', () => {
  global.Page = definition => {
    shopPageDefinition = definition
  }
  require('../miniprogram/pages/profile/points-shop')

  assert.equal(shopPageDefinition.data.pointsBalance, 0)
  assert.deepEqual(
    shopPageDefinition.data.categories.map(item => item.id),
    ['all', 'culture', 'audio']
  )
  // 商品目录按云端目录初始化：9 款商品、0 积分时全部不可兑换
  assert.equal(shopPageDefinition.data.products.length, 9)
  const firstProduct = shopPageDefinition.data.products[0]
  assert.equal(firstProduct.id, 'zju-badge')
  assert.equal(firstProduct.canRedeem, false)
  assert.equal(firstProduct.actionText, '还差 80 分')
  assert.equal(firstProduct.soldOut, false)
  // 默认「全部」分类下可见商品与完整目录一致
  assert.deepEqual(
    shopPageDefinition.data.visibleProducts.map(item => item.id),
    shopPageDefinition.data.products.map(item => item.id)
  )

  delete global.Page
})

test('积分商城从云端账户读取余额、商品、兑换记录与积分流水', async () => {
  const calls = []
  const store = {
    // issue #36：积分账户是云端账号数据，只有已登录（会话在本地）才会读取
    [SESSION_KEY]: { user: { openid: 'test-openid' } }
  }
  const completedAt = new Date(2026, 8, 1, 9, 30).getTime()

  global.wx = {
    getStorageSync(key) {
      return key in store ? store[key] : ''
    },
    setStorageSync(key, value) {
      store[key] = value
    },
    removeStorageSync(key) {
      delete store[key]
    },
    cloud: {
      callFunction({ data }) {
        calls.push(data.type)
        if (data.type === 'getPointsShop') {
          return Promise.resolve({
            result: {
              success: true,
              data: {
                balance: 125,
                products: [
                  { id: 'zju-badge', points: 80, stock: 50, remainingStock: 0 },
                  { id: 'airpods-pro', points: 5200, stock: 8, remainingStock: 8, redeemed: true }
                ],
                orders: [{
                  id: 'order-1',
                  productId: 'zju-badge',
                  productName: '浙大校徽纪念章',
                  productImage: '',
                  points: 80,
                  status: 'shipped',
                  createdAt: completedAt
                }]
              }
            }
          })
        }
        if (data.type === 'getPointsSummary') {
          return Promise.resolve({
            result: {
              success: true,
              data: {
                balance: 125,
                entries: [{
                  id: 'ledger-1',
                  title: '护耳妙招被采纳',
                  points: 100,
                  createdAt: completedAt
                }]
              }
            }
          })
        }
        throw new Error(`unexpected cloud call: ${data.type}`)
      }
    }
  }

  const page = {
    ...shopPageDefinition,
    data: JSON.parse(JSON.stringify(shopPageDefinition.data)),
    setData(updates) {
      Object.assign(this.data, updates)
    }
  }

  await page.loadShop()

  assert.equal(page.data.needLogin, false)
  assert.equal(page.data.pointsBalance, 125)
  assert.equal(page.data.pointsLoading, false)
  assert.equal(page.data.pointsError, '')
  // 商品按云端库存/兑换状态装饰
  const [soldOutProduct, redeemedProduct] = page.data.products
  assert.equal(soldOutProduct.soldOut, true)
  assert.equal(soldOutProduct.canRedeem, false)
  assert.equal(soldOutProduct.actionText, '已兑完')
  assert.equal(redeemedProduct.redeemed, true)
  assert.equal(redeemedProduct.actionText, '已兑换')
  // 兑换记录与积分流水完成装饰
  assert.equal(page.data.orders[0].statusLabel, '已发货')
  assert.equal(page.data.orders[0].timeText, '2026.09.01')
  assert.equal(page.data.pointsEntries[0].pointsText, '+100')
  assert.equal(page.data.pointsEntries[0].direction, 'credit')
  assert.equal(page.data.pointsEntries[0].timeText, '2026.09.01')
  assert.deepEqual(calls, ['getPointsShop', 'getPointsSummary'])

  delete global.wx
})

test('游客打开积分商城只展示登录引导，不触发登录建档', async () => {
  const store = {}
  const calls = []

  global.wx = {
    getStorageSync(key) {
      return key in store ? store[key] : ''
    },
    setStorageSync(key, value) {
      store[key] = value
    },
    removeStorageSync(key) {
      delete store[key]
    },
    cloud: {
      callFunction({ data }) {
        calls.push(data.type)
        return Promise.resolve({ result: { success: true, data: {} } })
      }
    }
  }

  // 清掉上一个用例留在 auth 模块里的会话缓存，回到游客态
  auth.logout()
  localData.clearLoggedOut()

  const page = {
    ...shopPageDefinition,
    data: JSON.parse(JSON.stringify(shopPageDefinition.data)),
    setData(updates) {
      Object.assign(this.data, updates)
    }
  }

  await page.loadShop()

  assert.equal(page.data.needLogin, true)
  assert.equal(page.data.pointsLoading, false)
  assert.equal(page.data.pointsError, '')
  assert.equal(page.data.pointsBalance, 0)
  assert.deepEqual(calls, [])

  delete global.wx
})

test('云函数只开放积分查询，不开放客户端直接加积分', () => {
  const source = fs.readFileSync(
    path.join(projectRoot, 'cloudfunctions/userFunctions/index.js'),
    'utf8'
  )

  assert.match(source, /case 'getPointsSummary'/)
  assert.doesNotMatch(source, /case 'grantPoints'/)
  assert.doesNotMatch(source, /case 'addPoints'/)
})
