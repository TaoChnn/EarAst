const fs = require('node:fs')
const path = require('node:path')
const test = require('node:test')
const assert = require('node:assert/strict')

const projectRoot = path.resolve(__dirname, '..')
const {
  NORMAL_POST_RULE,
  getPostRewardRule,
  buildPostLedgerId,
  getBeijingDateStr,
  buildDailyCounterId,
  buildPostLedger
} = require('../cloudfunctions/communityFunctions/postReward')

test('发帖积分规则与积分规则弹窗一致', () => {
  assert.deepEqual(
    { points: getPostRewardRule('tip').points, dailyLimit: getPostRewardRule('tip').dailyLimit },
    { points: 15, dailyLimit: 1 }
  )
  assert.deepEqual(
    { points: getPostRewardRule('report').points, dailyLimit: getPostRewardRule('report').dailyLimit },
    { points: 10, dailyLimit: 1 }
  )
  assert.deepEqual(NORMAL_POST_RULE, { points: 5, dailyLimit: 2, title: '发布普通帖子', category: 'normal' })

  // 未单列规则的板块一律按普通帖子计
  for (const tag of ['fail', 'recommend', 'checkin', 'question', 'device', 'hospital', 'mood', undefined, '']) {
    assert.equal(getPostRewardRule(tag).points, 5)
    assert.equal(getPostRewardRule(tag).dailyLimit, 2)
  }
})

test('测听报告与听力科普共享每日额度', () => {
  assert.equal(getPostRewardRule('report').category, getPostRewardRule('science').category)
  // 实际流程传的是规则归一后的 category，两类应命中同一个额度计数文档
  assert.equal(
    buildDailyCounterId('oA', '2026-09-09', getPostRewardRule('report').category),
    buildDailyCounterId('oA', '2026-09-09', getPostRewardRule('science').category)
  )
})

test('同一帖子生成固定流水号，额度计数键按用户和日期隔离', () => {
  assert.equal(buildPostLedgerId('post-123'), buildPostLedgerId('post-123'))
  assert.ok(buildPostLedgerId('post-123').length <= 32)
  assert.notEqual(buildPostLedgerId('post-1'), buildPostLedgerId('post-2'))

  assert.notEqual(
    buildDailyCounterId('oA', '2026-09-09', 'normal'),
    buildDailyCounterId('oB', '2026-09-09', 'normal')
  )
  assert.notEqual(
    buildDailyCounterId('oA', '2026-09-09', 'normal'),
    buildDailyCounterId('oA', '2026-09-10', 'normal')
  )
})

test('每日额度按北京时间自然日隔离', () => {
  // UTC 16:30 = 北京时间次日 00:30，应归入次日
  assert.equal(getBeijingDateStr(new Date('2026-09-01T16:30:00.000Z')), '2026-09-02')
  assert.equal(getBeijingDateStr(new Date('2026-09-01T15:59:00.000Z')), '2026-09-01')
})

test('发帖流水记录指向原帖并按规则命名', () => {
  const createdAt = new Date('2026-09-01T00:00:00.000Z')
  const ledger = buildPostLedger({ postId: 'post-9', authorOpenid: 'oA', tag: 'tip', createdAt })

  assert.equal(ledger.points, 15)
  assert.equal(ledger.title, '发布护耳妙招')
  assert.equal(ledger.sourceId, 'post-9')
  assert.equal(ledger.sourceType, 'post-published')
  assert.equal(ledger.openid, 'oA')
  assert.equal(ledger.createdAt, createdAt)
})

test('发帖接口在发布成功后自动发放积分，且客户端无法传入积分数值', () => {
  const source = fs.readFileSync(
    path.join(projectRoot, 'cloudfunctions/communityFunctions/index.js'),
    'utf8'
  )

  assert.match(source, /case 'addPost'/)
  assert.match(source, /awardPostReward/)
  assert.match(source, /points_daily_counters/)
  assert.match(source, /db\.runTransaction/)
  assert.match(source, /buildPostLedgerId/)
  // 返回给前端的发放数值只能来自云端规则
  assert.doesNotMatch(source, /event\.points/)
})
