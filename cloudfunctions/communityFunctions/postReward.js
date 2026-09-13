const crypto = require('crypto')

// 发帖积分规则（与小程序端 community.js 的 POINTS_RULES「社区贡献」保持一致）：
// - 发布护耳妙招 +15，每日最多 1 次
// - 发布测听报告或科普内容 +10，每日最多 1 次（两类共享每日额度）
// - 其余板块视为普通帖子 +5，每日最多 2 次
const POST_REWARD_RULES = {
  tip: { points: 15, dailyLimit: 1, title: '发布护耳妙招', category: 'tip' },
  report: { points: 10, dailyLimit: 1, title: '发布测听报告', category: 'report' },
  science: { points: 10, dailyLimit: 1, title: '发布听力科普', category: 'report' }
}
const NORMAL_POST_RULE = { points: 5, dailyLimit: 2, title: '发布普通帖子', category: 'normal' }
const POST_REWARD_SOURCE_TYPE = 'post-published'

function normalizePostId(value) {
  return typeof value === 'string' ? value.trim().slice(0, 100) : ''
}

// 按板块取奖励规则；未列出的一律按普通帖子计
function getPostRewardRule(tag) {
  return POST_REWARD_RULES[tag] || NORMAL_POST_RULE
}

function hashId(prefix, raw) {
  const digest = crypto.createHash('sha256').update(raw).digest('hex').slice(0, 24)
  return `${prefix}_${digest}`
}

// 同一帖子的流水号固定，重复发放时按流水号幂等拦截
function buildPostLedgerId(postId) {
  const normalizedId = normalizePostId(postId)
  if (!normalizedId) return ''
  return hashId('pp', normalizedId)
}

// 每日额度按北京时间自然日隔离（云函数跑在 UTC，需 +8 归一日）
function getBeijingDateStr(now) {
  return new Date(now.getTime() + 8 * 60 * 60 * 1000).toISOString().slice(0, 10)
}

// 每日额度计数文档 _id：openid + 日期 + 规则分类
function buildDailyCounterId(openid, dateStr, category) {
  return hashId('pc', `${openid}|${dateStr}|${category}`)
}

function buildPostLedger({ postId, authorOpenid, tag, createdAt }) {
  const rule = getPostRewardRule(tag)
  return {
    openid: authorOpenid,
    title: rule.title,
    points: rule.points,
    sourceType: POST_REWARD_SOURCE_TYPE,
    sourceId: normalizePostId(postId),
    createdAt
  }
}

module.exports = {
  POST_REWARD_RULES,
  NORMAL_POST_RULE,
  POST_REWARD_SOURCE_TYPE,
  normalizePostId,
  getPostRewardRule,
  buildPostLedgerId,
  getBeijingDateStr,
  buildDailyCounterId,
  buildPostLedger
}
