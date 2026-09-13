const fs = require('node:fs')
const path = require('node:path')
const test = require('node:test')
const assert = require('node:assert/strict')

const projectRoot = path.resolve(__dirname, '..')
const { SKILLS } = require('../miniprogram/data/skills')
const auth = require('../miniprogram/utils/auth')
const localData = require('../miniprogram/utils/local-data')
const { SESSION_KEY } = localData

let listPageDefinition

function loadListPage() {
  global.Page = definition => {
    listPageDefinition = definition
  }
  require('../miniprogram/pages/skill/list')
  delete global.Page
  return () => ({
    ...listPageDefinition,
    data: JSON.parse(JSON.stringify(listPageDefinition.data)),
    setData(updates) {
      Object.assign(this.data, updates)
    }
  })
}

test('个人中心技能入口指向收藏模式，首页入口保持完整技能库', () => {
  const profileSource = fs.readFileSync(
    path.join(projectRoot, 'miniprogram/pages/profile/profile.js'),
    'utf8'
  )
  const homeSource = fs.readFileSync(
    path.join(projectRoot, 'miniprogram/pages/home/home.js'),
    'utf8'
  )

  assert.match(profileSource, /url: '\/pages\/skill\/list\?mode=favorites'/)
  assert.match(profileSource, /title: '收藏的技能'/)
  // 首页入口不带收藏参数，仍是完整技能库
  assert.match(homeSource, /url: '\/pages\/skill\/list'/)
  assert.doesNotMatch(homeSource, /mode=favorites/)
})

test('收藏模式只展示收藏过的技能，分类筛选在收藏范围内生效', () => {
  const makePage = loadListPage()
  global.wx = {
    getStorageSync(key) {
      return key === 'skill_favs' ? ['habit-6060', 'noise-commute'] : ''
    },
    setStorageSync() {},
    setNavigationBarTitle() {}
  }

  const page = makePage()
  page.onLoad({ mode: 'favorites' })

  assert.equal(page.data.favoritesMode, true)
  assert.deepEqual(
    page.data.developerSkills.map(item => item.id),
    ['habit-6060', 'noise-commute']
  )

  // 分类筛选只在收藏范围内过滤
  page.onSelectCategory({ currentTarget: { dataset: { category: '噪声防护' } } })
  assert.deepEqual(page.data.developerSkills.map(item => item.id), ['noise-commute'])

  delete global.wx
})

test('登录后收藏模式与云端合并，本地独有收藏补同步', async () => {
  const makePage = loadListPage()
  const calls = []
  const store = {}
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
    setNavigationBarTitle() {},
    cloud: {
      callFunction({ data }) {
        calls.push(data.type)
        if (data.type === 'listFavorites') {
          return Promise.resolve({ result: { success: true, data: ['device-anc'] } })
        }
        return Promise.resolve({ result: { success: true, data: { _id: 'x' } } })
      }
    }
  }
  // 清掉上一个用例留在 auth 模块里的会话缓存，回到游客态，再播种登录会话与本机收藏
  auth.logout()
  localData.clearLoggedOut()
  store[SESSION_KEY] = { user: { openid: 'test-openid' } }
  store.skill_favs = ['habit-6060']

  const page = makePage()
  await page.onLoad({ mode: 'favorites' })

  assert.deepEqual(
    page.data.developerSkills.map(item => item.id),
    ['habit-6060', 'device-anc']
  )
  // 本地独有收藏已补同步到云端，并回写合并结果
  assert.equal(calls.includes('addFavorite'), true)
  assert.deepEqual(store.skill_favs, ['habit-6060', 'device-anc'])

  delete global.wx
})

test('非收藏模式保持完整技能库，游客收藏模式只读本机', () => {
  const makePage = loadListPage()
  global.wx = {
    getStorageSync(key) {
      return key === 'skill_favs' ? ['habit-6060'] : ''
    },
    setStorageSync() {},
    setNavigationBarTitle() {}
  }

  const fullPage = makePage()
  fullPage.onLoad()
  assert.equal(fullPage.data.favoritesMode, false)
  assert.equal(fullPage.data.developerSkills.length, SKILLS.length)

  // 清掉上一个用例留在 auth 模块里的会话缓存，回到游客态
  auth.logout()
  localData.clearLoggedOut()
  const guestPage = makePage()
  guestPage.onLoad({ mode: 'favorites' })
  assert.deepEqual(guestPage.data.developerSkills.map(item => item.id), ['habit-6060'])

  delete global.wx
})
