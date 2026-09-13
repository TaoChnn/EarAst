const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const _ = db.command
const {
  SEED_POSTS,
  SEED_COMMENTS,
  SEED_USERS,
  LEGACY_SEED_POST_IDS,
  LEGACY_SEED_COMMENT_IDS,
  LEGACY_SEED_USER_IDS
} = require('./seedData')
const {
  TIP_ADOPTION_REWARD,
  normalizePostId,
  buildAdoptionLedgerId,
  getAdoptionIssue,
  buildAdoptionLedger
} = require('./tipAdoption')
const {
  getPostRewardRule,
  buildPostLedgerId,
  getBeijingDateStr,
  buildDailyCounterId,
  buildPostLedger
} = require('./postReward')

const TAGS = {
  tip: '护耳妙招',
  fail: '用耳翻车',
  recommend: '耳机安利',
  checkin: '护耳打卡',
  question: '求助提问',
  report: '测听报告',
  science: '听力科普',
  device: '助听设备',
  hospital: '就医经验',
  mood: '心情树洞'
}

// 确保集合存在（不存在则创建，已存在则忽略报错）
async function ensureCollection(name) {
  try {
    await db.createCollection(name)
  } catch (e) {
    // 集合已存在
  }
}

// 种子数据同步（幂等，每个云函数实例只执行一次）：
// 1. 固定 _id 覆盖写入当前种子内容，保证耳友圈演示内容始终最新、可控；
// 2. 种子用户档案同步写入 users 集合（积分榜有内容、妙招采纳的作者积分账户可命中）；
// 3. 清理旧版本已删除的种子帖/评论/用户（仅限 seed- 前缀的演示数据，真实用户数据不受影响）；
// 4. 版本指纹：内容不变时跳过全部写入（seed_meta.version），冷启动不再重复 200+ 次写库；
// 5. 同步失败不阻塞读接口：listPosts 等调用方对 ensureSeedData 单独 catch。
const crypto = require('crypto')
let seedSynced = false

// 种子内容指纹（剔除每次冷启动都会重算的时间字段）
function currentSeedVersion() {
  const strip = (list, drop) => list.map(doc => {
    const copy = { ...doc }
    drop.forEach(key => delete copy[key])
    return copy
  })
  const payload = JSON.stringify({
    p: strip(SEED_POSTS, ['createTime']),
    c: strip(SEED_COMMENTS, ['createTime']),
    u: strip(SEED_USERS, ['createdAt', 'lastLoginAt', 'profileUpdatedAt'])
  })
  return 'v1-' + crypto.createHash('sha256').update(payload).digest('hex').slice(0, 16)
}

async function ensureSeedData() {
  if (seedSynced) return
  seedSynced = true

  await ensureCollection('community')
  await ensureCollection('comments')
  await ensureCollection('users')
  await ensureCollection('seed_meta')

  const version = currentSeedVersion()
  try {
    const meta = await db.collection('seed_meta').doc('version').get()
    if (meta.data && meta.data.version === version) return
  } catch (e) {
    // meta 文档不存在（首次同步），继续执行写入
  }

  await Promise.all([
    ...SEED_POSTS.map(({ _id, ...data }) =>
      db.collection('community').doc(_id).set({ data }).catch(() => {})),
    ...SEED_COMMENTS.map(({ _id, ...data }) =>
      db.collection('comments').doc(_id).set({ data }).catch(() => {})),
    ...SEED_USERS.map(({ _id, ...data }) =>
      db.collection('users').doc(_id).set({ data }).catch(() => {}))
  ])

  const currentPostIds = new Set(SEED_POSTS.map(p => p._id))
  const currentCommentIds = new Set(SEED_COMMENTS.map(c => c._id))
  const currentUserIds = new Set(SEED_USERS.map(u => u._id))
  const stalePostIds = LEGACY_SEED_POST_IDS.filter(id => !currentPostIds.has(id))
  const staleCommentIds = LEGACY_SEED_COMMENT_IDS.filter(id => !currentCommentIds.has(id))
  const staleUserIds = LEGACY_SEED_USER_IDS.filter(id => !currentUserIds.has(id))

  const cleanups = []
  if (stalePostIds.length) {
    cleanups.push(
      db.collection('community').where({ _id: _.in(stalePostIds) }).remove(),
      db.collection('comments').where({ postId: _.in(stalePostIds) }).remove()
    )
  }
  if (staleCommentIds.length) {
    cleanups.push(db.collection('comments').where({ _id: _.in(staleCommentIds) }).remove())
  }
  if (staleUserIds.length) {
    cleanups.push(db.collection('users').where({ _id: _.in(staleUserIds) }).remove())
  }
  await Promise.all(cleanups.map(p => p.catch(() => {})))

  await db.collection('seed_meta').doc('version')
    .set({ data: { version, syncedAt: new Date() } })
    .catch(() => {})
}

function withTagLabel(post) {
  return { ...post, tagLabel: TAGS[post.tag] || '' }
}

// 根据 comments 集合实时统计每个帖子的真实评论数，返回 { [postId]: count }
async function countCommentsByPosts(postIds) {
  if (!postIds.length) return {}
  // 云数据库 command.in 单次上限 100，分片查询后合并
  const result = {}
  const CHUNK = 100
  for (let i = 0; i < postIds.length; i += CHUNK) {
    const ids = postIds.slice(i, i + CHUNK)
    const res = await db.collection('comments').where({ postId: _.in(ids) }).limit(1000).get()
    res.data.forEach(c => {
      result[c.postId] = (result[c.postId] || 0) + 1
    })
    // 评论总数超过单页上限时翻页累加
    let total = res.data.length
    while (total === 1000) {
      const more = await db.collection('comments')
        .where({ postId: _.in(ids) })
        .skip(total)
        .limit(1000)
        .get()
      more.data.forEach(c => {
        result[c.postId] = (result[c.postId] || 0) + 1
      })
      total = more.data.length
    }
  }
  return result
}

// 帖子列表：tag 传 'all' 或具体板块 key
async function listPosts(event) {
  await ensureSeedData().catch(e => {
    console.error('[seed] 种子同步失败（不影响读取）:', e && e.message)
  })
  const collection = db.collection('community')
  const condition = event.tag && event.tag !== 'all' ? collection.where({ tag: event.tag }) : collection
  const res = await condition.orderBy('createTime', 'desc').limit(50).get()
  const posts = res.data.map(withTagLabel)
  // 用真实评论数覆盖存储字段，保证与详情页一致
  const counts = await countCommentsByPosts(posts.map(p => p._id))
  posts.forEach(p => {
    p.commentCount = counts[p._id] || 0
  })
  return { success: true, data: posts }
}

// 帖子详情
async function getPost(event) {
  await ensureSeedData().catch(e => {
    console.error('[seed] 种子同步失败（不影响读取）:', e && e.message)
  })
  try {
    const res = await db.collection('community').doc(event.id).get()
    if (!res.data) return { success: true, data: null }
    const post = withTagLabel(res.data)
    // 用真实评论数覆盖存储字段，保证与广场列表一致
    const count = await db.collection('comments').where({ postId: event.id }).count()
    post.commentCount = count.total
    // 当前用户是否已收藏（未登录/集合不存在时为 false）
    const { OPENID } = cloud.getWXContext()
    if (OPENID) {
      try {
        const favRes = await db.collection('post_favorites')
          .where({ openid: OPENID, postId: event.id })
          .limit(1)
          .get()
        post.faved = favRes.data.length > 0
      } catch (e) {
        post.faved = false
      }
    }
    return { success: true, data: post }
  } catch (e) {
    // doc 不存在时 SDK 会抛错
    return { success: true, data: null }
  }
}

// 收藏帖子：按 OPENID 记录收藏关系，并同步帖子 favCount 计数。
// 客户端只传 postId，归属一律取服务端 OPENID；重复收藏幂等返回。
async function favoritePost(event) {
  const { OPENID } = cloud.getWXContext()
  const postId = normalizePostId(event.postId)
  if (!OPENID) return { success: false, errMsg: '登录后才能收藏' }
  if (!postId) return { success: false, errMsg: '缺少帖子 ID' }

  await ensureCollection('post_favorites')

  const exists = await db.collection('post_favorites')
    .where({ openid: OPENID, postId })
    .count()
  if (exists.total > 0) return { success: true, data: { faved: true, duplicated: true } }

  await db.collection('post_favorites').add({
    data: { openid: OPENID, postId, createTime: new Date() }
  })
  await db.collection('community').doc(postId)
    .update({ data: { favCount: _.inc(1) } })
    .catch(() => {})
  return { success: true, data: { faved: true } }
}

// 取消收藏：删除收藏关系并同步计数（关系不存在时幂等返回）
async function unfavoritePost(event) {
  const { OPENID } = cloud.getWXContext()
  const postId = normalizePostId(event.postId)
  if (!OPENID) return { success: false, errMsg: '登录后才能操作收藏' }
  if (!postId) return { success: false, errMsg: '缺少帖子 ID' }

  await ensureCollection('post_favorites')

  const exists = await db.collection('post_favorites')
    .where({ openid: OPENID, postId })
    .count()
  if (!exists.total) return { success: true, data: { faved: false } }

  await db.collection('post_favorites').where({ openid: OPENID, postId }).remove()
  await db.collection('community').doc(postId)
    .update({ data: { favCount: _.inc(-1) } })
    .catch(() => {})
  return { success: true, data: { faved: false } }
}

// 收藏列表：登录用户按收藏时间倒序返回云端收藏；event.ids 用于游客按本机收藏
// 拉取帖子内容（帖子本身是公开读，不泄露他人数据），登录用户也可用 ids 补拉
// 本机尚未同步到云端的收藏。返回帖子按请求顺序排列，方便端上保序展示。
async function listPostFavorites(event) {
  const { OPENID } = cloud.getWXContext()
  let favIds = []
  if (OPENID) {
    const res = await db.collection('post_favorites')
      .where({ openid: OPENID })
      .orderBy('createTime', 'desc')
      .limit(50)
      .get()
      .catch(() => ({ data: [] }))
    favIds = res.data.map(item => normalizePostId(item.postId)).filter(Boolean)
  }
  const extraIds = Array.isArray(event.ids)
    ? event.ids.map(normalizePostId).filter(Boolean)
    : []
  const mergedIds = []
  ;[...favIds, ...extraIds].forEach(id => {
    if (id && !mergedIds.includes(id) && mergedIds.length < 50) mergedIds.push(id)
  })
  if (!mergedIds.length) return { success: true, data: [] }

  const res = await db.collection('community')
    .where({ _id: _.in(mergedIds) })
    .limit(mergedIds.length)
    .get()
  const byId = {}
  res.data.forEach(post => { byId[post._id] = withTagLabel(post) })
  return { success: true, data: mergedIds.map(id => byId[id]).filter(Boolean) }
}

// 按 openid 读取 users 集合中的用户档案；未建档时返回 null
async function getUserProfileByOpenid(openid) {
  if (!openid) return null
  try {
    const res = await db.collection('users').where({ openid }).limit(1).get()
    return res.data[0] || null
  } catch (e) {
    // users 集合尚未创建等异常时不阻塞发帖
    return null
  }
}

// 管理员名单只能由项目维护者在云数据库中配置，客户端无法自行加入。
// app_admins 支持用 OPENID 作为文档 _id，或存为 { openid, active }。
async function isAdmin(openid) {
  if (!openid) return false
  await ensureCollection('app_admins')

  try {
    const direct = await db.collection('app_admins').doc(openid).get()
    if (direct.data && direct.data.active !== false) return true
  } catch (e) {
    // 未使用 OPENID 作为文档 _id 时，继续按 openid 字段查找。
  }

  const result = await db.collection('app_admins').where({ openid }).limit(1).get()
  return Boolean(result.data[0] && result.data[0].active !== false)
}

async function getDocumentOrNull(collection, id) {
  try {
    const result = await collection.doc(id).get()
    return result.data || null
  } catch (e) {
    return null
  }
}

// 官方采纳护耳妙招并奖励固定积分。权限、奖励数值和幂等性全部由云端控制。
async function adoptTip(event) {
  const { OPENID } = cloud.getWXContext()
  const postId = normalizePostId(event.postId)
  if (!OPENID) return { success: false, errMsg: '无法识别当前用户' }
  if (!postId) return { success: false, errMsg: '缺少帖子 ID' }

  await Promise.all([
    ensureCollection('community'),
    ensureCollection('users'),
    ensureCollection('points_ledger')
  ])

  if (!(await isAdmin(OPENID))) {
    return { success: false, errMsg: '无采纳权限' }
  }

  // 事务只支持 doc 查询，因此先定位作者账户文档，事务内再重新校验帖子和账户。
  const preliminaryPost = await getDocumentOrNull(db.collection('community'), postId)
  const preliminaryIssue = getAdoptionIssue(preliminaryPost)
  if (preliminaryIssue === 'already-adopted') {
    return {
      success: true,
      data: { adopted: true, duplicate: true, pointsAwarded: 0 }
    }
  }
  if (preliminaryIssue) return { success: false, errMsg: preliminaryIssue }

  const author = await getUserProfileByOpenid(preliminaryPost.openid)
  if (!author || !author._id) {
    return { success: false, errMsg: '作者尚未建立积分账户' }
  }

  const ledgerId = buildAdoptionLedgerId(postId)
  const transactionResult = await db.runTransaction(async transaction => {
    const postRef = transaction.collection('community').doc(postId)
    const userRef = transaction.collection('users').doc(author._id)
    const ledgerRef = transaction.collection('points_ledger').doc(ledgerId)
    const post = await getDocumentOrNull(transaction.collection('community'), postId)
    const issue = getAdoptionIssue(post)

    if (issue === 'already-adopted') {
      return { adopted: true, duplicate: true, pointsAwarded: 0 }
    }
    if (issue) throw new Error(issue)
    if (post.openid !== preliminaryPost.openid) throw new Error('帖子作者信息已发生变化')

    const existingLedger = await getDocumentOrNull(
      transaction.collection('points_ledger'),
      ledgerId
    )
    if (existingLedger) {
      return { adopted: true, duplicate: true, pointsAwarded: 0 }
    }

    const userResult = await userRef.get()
    const user = userResult.data
    if (!user || user.openid !== post.openid) throw new Error('作者积分账户不可用')

    const now = new Date()
    const currentBalance = Math.max(0, Math.round(Number(user.pointsBalance) || 0))
    const ledger = buildAdoptionLedger({
      postId,
      authorOpenid: post.openid,
      createdAt: now
    })

    await postRef.update({
      data: {
        adopted: true,
        adoptedAt: now,
        adoptedBy: OPENID,
        adoptionReward: TIP_ADOPTION_REWARD,
        adoptionLedgerId: ledgerId
      }
    })
    await userRef.update({
      data: {
        pointsBalance: currentBalance + TIP_ADOPTION_REWARD,
        pointsUpdatedAt: now
      }
    })
    await ledgerRef.set({ data: ledger })

    return {
      adopted: true,
      duplicate: false,
      pointsAwarded: TIP_ADOPTION_REWARD,
      authorOpenid: post.openid
    }
  })

  return { success: true, data: transactionResult.result || transactionResult }
}

// 发布帖子（images 为云存储 fileID 数组，cover 取第一张）
// 身份信息以云端 users 档案为准，避免伪造与默认“耳友”问题
async function addPost(event) {
  const { OPENID } = cloud.getWXContext()
  const { tag, title, content, summary, images } = event
  const userProfile = await getUserProfileByOpenid(OPENID)
  const imgList = Array.isArray(images) ? images : []
  const post = {
    tag,
    title,
    content: content || '',
    summary: summary || (content && content.length > 60 ? content.slice(0, 60) + '…' : content || ''),
    nickname: (userProfile && userProfile.nickname) || '耳友',
    avatar: (userProfile && userProfile.avatar) || '',
    device: (userProfile && userProfile.deviceModel) || '',
    openid: OPENID || '',
    images: imgList,
    cover: imgList[0] || '',
    likeCount: 0,
    commentCount: 0,
    favCount: 0,
    createTime: new Date()
  }
  const res = await db.collection('community').add({ data: post })
  // 帖子落库后按积分规则自动发放奖励；发放失败只影响本次奖励，不回滚发帖
  const reward = await awardPostReward({ postId: res._id, openid: OPENID, tag })
    .catch(() => ({ pointsAwarded: 0 }))
  return { success: true, data: { _id: res._id, pointsAwarded: reward.pointsAwarded || 0 } }
}

// 发帖积分发放：规则金额与每日额度由云端决定（postReward.js），客户端无法传积分数值。
// 事务内幂等防重（流水号锁定单篇帖子）并校验每日额度，防止并发发帖绕过限额。
async function awardPostReward({ postId, openid, tag }) {
  if (!openid || !postId) return { pointsAwarded: 0, reason: 'no-openid' }

  await Promise.all([
    ensureCollection('users'),
    ensureCollection('points_ledger'),
    ensureCollection('points_daily_counters')
  ])

  const author = await getUserProfileByOpenid(openid)
  if (!author || !author._id) return { pointsAwarded: 0, reason: 'no-account' }

  const rule = getPostRewardRule(tag)
  const ledgerId = buildPostLedgerId(postId)
  const dateStr = getBeijingDateStr(new Date())
  const counterId = buildDailyCounterId(openid, dateStr, rule.category)

  const transactionResult = await db.runTransaction(async transaction => {
    const post = await getDocumentOrNull(transaction.collection('community'), postId)
    if (!post || post.openid !== openid) return { pointsAwarded: 0, reason: 'post-missing' }

    const existingLedger = await getDocumentOrNull(
      transaction.collection('points_ledger'),
      ledgerId
    )
    if (existingLedger) return { pointsAwarded: 0, reason: 'duplicate' }

    const user = await getDocumentOrNull(transaction.collection('users'), author._id)
    if (!user || user.openid !== openid) return { pointsAwarded: 0, reason: 'no-account' }

    const counter = await getDocumentOrNull(
      transaction.collection('points_daily_counters'),
      counterId
    )
    const used = Math.max(0, Math.round(Number(counter && counter.count) || 0))
    if (used >= rule.dailyLimit) {
      // 超出每日额度仍要落帖子标记，便于排查“为什么这篇没发分”
      await transaction.collection('community').doc(postId).update({
        data: { rewardPoints: 0, rewardSkipReason: 'daily-limit', rewardEvaluatedAt: new Date() }
      })
      return { pointsAwarded: 0, reason: 'daily-limit' }
    }

    const now = new Date()
    const nextBalance = Math.max(0, Math.round(Number(user.pointsBalance) || 0)) + rule.points

    await transaction.collection('users').doc(author._id).update({
      data: { pointsBalance: nextBalance, pointsUpdatedAt: now }
    })
    await transaction.collection('points_ledger').doc(ledgerId).set({
      data: buildPostLedger({ postId, authorOpenid: openid, tag, createdAt: now })
    })
    if (counter) {
      await transaction.collection('points_daily_counters').doc(counterId).update({
        data: { count: used + 1, updatedAt: now }
      })
    } else {
      await transaction.collection('points_daily_counters').doc(counterId).set({
        data: { openid, date: dateStr, category: rule.category, count: 1, updatedAt: now }
      })
    }
    await transaction.collection('community').doc(postId).update({
      data: { rewardPoints: rule.points, rewardLedgerId: ledgerId, rewardEvaluatedAt: now }
    })

    return { pointsAwarded: rule.points, balance: nextBalance }
  })

  return transactionResult.result || transactionResult
}

// 我的帖子：按当前用户 openid 查询（未登录时为匿名，返回空）
async function myPosts(event) {
  await ensureSeedData().catch(e => {
    console.error('[seed] 种子同步失败（不影响读取）:', e && e.message)
  })
  const { OPENID } = cloud.getWXContext()
  if (!OPENID) return { success: true, data: [] }
  const res = await db.collection('community')
    .where({ openid: OPENID })
    .orderBy('createTime', 'desc')
    .limit(50)
    .get()
  const posts = res.data.map(withTagLabel)
  // 用真实评论数覆盖存储字段，与详情页保持一致
  const counts = await countCommentsByPosts(posts.map(p => p._id))
  posts.forEach(p => {
    p.commentCount = counts[p._id] || 0
  })
  return { success: true, data: posts }
}

// 评论列表
async function listComments(event) {
  const res = await db.collection('comments')
    .where({ postId: event.postId })
    .orderBy('createTime', 'asc')
    .limit(100)
    .get()
  return { success: true, data: res.data }
}

// 发表评论（同时给帖子评论数 +1；记录 openid 并快照用户档案）
async function addComment(event) {
  const { OPENID } = cloud.getWXContext()
  const { postId, content } = event
  const userProfile = await getUserProfileByOpenid(OPENID)
  const comment = {
    postId,
    openid: OPENID || '',
    nickname: (userProfile && userProfile.nickname) || '耳友',
    avatar: (userProfile && userProfile.avatar) || '',
    content,
    createTime: new Date()
  }
  const res = await db.collection('comments').add({ data: comment })
  await db.collection('community').doc(postId).update({
    data: { commentCount: _.inc(1) }
  }).catch(() => {})
  return { success: true, data: { _id: res._id, ...comment } }
}

// 更新计数（点赞 / 收藏），字段白名单校验
async function updateCount(event) {
  const FIELDS = ['likeCount', 'favCount', 'commentCount']
  if (FIELDS.indexOf(event.field) < 0) {
    return { success: false, errMsg: 'invalid field' }
  }
  await db.collection('community').doc(event.id).update({
    data: { [event.field]: _.inc(event.delta || 1) }
  })
  return { success: true }
}

// 云函数入口：按 event.type 分发，统一返回 { success, data }
exports.main = async (event) => {
  try {
    switch (event.type) {
      case 'listPosts':
        return await listPosts(event)
      case 'getPost':
        return await getPost(event)
      case 'addPost':
        return await addPost(event)
      case 'myPosts':
        return await myPosts(event)
      case 'listComments':
        return await listComments(event)
      case 'addComment':
        return await addComment(event)
      case 'updateCount':
        return await updateCount(event)
      case 'favoritePost':
        return await favoritePost(event)
      case 'unfavoritePost':
        return await unfavoritePost(event)
      case 'listPostFavorites':
        return await listPostFavorites(event)
      case 'adoptTip':
        return await adoptTip(event)
      default:
        return { success: false, errMsg: `unknown type: ${event.type}` }
    }
  } catch (e) {
    return { success: false, errMsg: e.message || String(e) }
  }
}
