/**
 * 耳友圈种子用户名册：26 位发帖作者 + 57 位评论者，共 83 个角色。
 * 用途：
 *   1. tools/seed-avatars.js prepare —— 按 listPersonas() 顺序分配头像素材（前面的角色优先拿唯一头像）；
 *   2. tools/seed-avatars.js emit —— listSeedUsers() 生成 cloudfunctions/communityFunctions/seedUsers.js。
 * 字段说明：
 *   device 误机型号（可空）；points 积分余额（发帖 5~15/篇、妙招被采纳 +100 的合理累计）；
 *   testCount 听力自测次数；usageHours 累计佩戴小时；createdDaysAgo/lastLoginDaysAgo 注册与最近活跃；
 *   thr 佩戴提醒阈值（小时，默认 2）；cm false 表示关闭了社区消息通知。
 */

const AUTHORS = [
  { nickname: '小耳朵', device: 'AirPods Pro 2', points: 260, testCount: 6, usageHours: 520, createdDaysAgo: 380, lastLoginDaysAgo: 1, thr: 1, bio: '60-60 原则实践一年，耳朵比从前轻松多了' },
  { nickname: '早八地铁人', device: 'vivo TWS 4', points: 145, testCount: 4, usageHours: 610, createdDaysAgo: 300, lastLoginDaysAgo: 1, bio: '地铁十号线通勤，降噪和锁音量双修' },
  { nickname: '失眠的阿哲', device: '小米 Buds 5', points: 22, testCount: 2, usageHours: 260, createdDaysAgo: 210, lastLoginDaysAgo: 6, bio: '正在戒戴耳机睡觉，白噪音定时三十分钟' },
  { nickname: '枪声听多了', device: '华为 FreeBuds Pro 3', points: 60, testCount: 5, usageHours: 780, createdDaysAgo: 260, lastLoginDaysAgo: 2, thr: 1, bio: 'FPS 玩家改邪归正中，每月一测听力' },
  { nickname: '数码老白', device: 'Bose QC Ultra', points: 190, testCount: 3, usageHours: 690, createdDaysAgo: 400, lastLoginDaysAgo: 3, bio: '十年数码编辑，帮朋友选耳机比自己的上心' },
  { nickname: '跑者小夏', device: '韶音 OpenRun Pro', points: 65, testCount: 3, usageHours: 720, createdDaysAgo: 320, lastLoginDaysAgo: 2, bio: '月跑量 80 公里，路跑只认骨传导' },
  { nickname: '音量50%选手', device: 'AirPods 4', points: 38, testCount: 4, usageHours: 300, createdDaysAgo: 150, lastLoginDaysAgo: 1, thr: 1, bio: '打卡进行时，音量锁死 50%' },
  { nickname: '右耳发闷中', device: '', points: 5, testCount: 1, usageHours: 210, createdDaysAgo: 90, lastLoginDaysAgo: 0.5, bio: '耳朵不舒服才注册的，正在观察期' },
  { nickname: '坚持就好', device: '', points: 155, testCount: 8, usageHours: 540, createdDaysAgo: 350, lastLoginDaysAgo: 1, thr: 1, bio: '三个月两次测听对比，数据不说谎' },
  { nickname: '耳鼻喉规培生', device: '', points: 170, testCount: 2, usageHours: 190, createdDaysAgo: 280, lastLoginDaysAgo: 2, bio: '耳鼻喉科规培中，业余科普听力知识' },
  { nickname: '陪爷爷选助听器', device: '', points: 130, testCount: 1, usageHours: 120, createdDaysAgo: 200, lastLoginDaysAgo: 4, bio: '家有 78 岁听衰老人，一路踩坑总结' },
  { nickname: '挂号小能手', device: '', points: 95, testCount: 3, usageHours: 240, createdDaysAgo: 240, lastLoginDaysAgo: 5, bio: '把就医流程整理成攻略的整理控' },
  { nickname: '摘下耳机的人', device: '', points: 88, testCount: 2, usageHours: 410, createdDaysAgo: 260, lastLoginDaysAgo: 1, bio: '八年重度用户，学着重新听世界' },
  { nickname: '音乐节幸存者', device: '', points: 55, testCount: 2, usageHours: 330, createdDaysAgo: 170, lastLoginDaysAgo: 6, bio: 'livehouse 常客，现在耳塞不离身' },
  { nickname: '通勤两小时的人', device: 'Sony WH-1000XM5', points: 75, testCount: 3, usageHours: 660, createdDaysAgo: 310, lastLoginDaysAgo: 1, bio: '单程两小时通勤，降噪是刚需' },
  { nickname: '自习室常驻', device: 'AirPods Pro 2', points: 70, testCount: 2, usageHours: 350, createdDaysAgo: 290, lastLoginDaysAgo: 2, bio: '考研上岸，图书馆分贝监测重度用户' },
  { nickname: '路口惊魂未定', device: 'OPPO Enco X2', points: 28, testCount: 1, usageHours: 180, createdDaysAgo: 80, lastLoginDaysAgo: 0.8, bio: '刚经历路口惊魂，正在改通勤习惯' },
  { nickname: '落地耳痛患者', device: '', points: 18, testCount: 1, usageHours: 140, createdDaysAgo: 60, lastLoginDaysAgo: 3, bio: '感冒坐飞机的教训，替大家试过了' },
  { nickname: '不敢再掏了', device: '小米 Buds 4', points: 25, testCount: 1, usageHours: 160, createdDaysAgo: 70, lastLoginDaysAgo: 1, bio: '棉签受害者，耳朵的事全听医生的' },
  { nickname: '604宿舍管钱的', device: 'Redmi Buds 6', points: 35, testCount: 2, usageHours: 280, createdDaysAgo: 120, lastLoginDaysAgo: 2, bio: '宿舍生活委员，掌管全宿舍数码预算' },
  { nickname: '菊厂老用户', device: '华为 FreeBuds Pro 3', points: 30, testCount: 2, usageHours: 420, createdDaysAgo: 180, lastLoginDaysAgo: 1, bio: '全家桶用户，最看重时长提醒' },
  { nickname: '六级听力选手', device: 'AirPods 3', points: 40, testCount: 3, usageHours: 310, createdDaysAgo: 100, lastLoginDaysAgo: 0.6, thr: 1, bio: '备考六级，把音量从 90% 往回救' },
  { nickname: '健身房汗宝宝', device: 'Beats Studio Buds', points: 12, testCount: 1, usageHours: 230, createdDaysAgo: 50, lastLoginDaysAgo: 0.7, bio: '一周四练，找运动戴耳机的最优解' },
  { nickname: '陪妈踩坑的儿子', device: '', points: 45, testCount: 1, usageHours: 90, createdDaysAgo: 130, lastLoginDaysAgo: 3, bio: '帮妈对抗耳鸣神药骗局，认准正规医院' },
  { nickname: '较真的工科男', device: '', points: 50, testCount: 4, usageHours: 380, createdDaysAgo: 250, lastLoginDaysAgo: 4, bio: '分贝仪实测党，数据面前不吵架' },
  { nickname: '九零后新手爸爸', device: '', points: 8, testCount: 1, usageHours: 110, createdDaysAgo: 40, lastLoginDaysAgo: 0.5, bio: '三岁女儿的爸爸，学着陪她听世界' },
  // 二批种子帖作者（avatarFile 指向 prepare 产物里的备用头像 img-84/85；
  // key 显式续号到 u84/u85，避免与评论者的 u27~u83 冲突、不影响已上传头像的映射）
  { key: 'u84', nickname: '被方案支配的人', device: 'AirPods Pro 2', points: 5, testCount: 1, usageHours: 480, createdDaysAgo: 35, lastLoginDaysAgo: 2, avatarFile: 'img-84.jpg', bio: '广告策划，正在学戴耳机加班的边界' },
  { key: 'u85', nickname: '客服工位的桃子', device: '工位配发的头戴式', points: 0, testCount: 0, usageHours: 260, createdDaysAgo: 20, lastLoginDaysAgo: 1, avatarFile: 'img-85.jpg', bio: '电商客服，一天 8 小时挂着耳机' }
]

// 顺序即头像分配优先级：活跃/专业评论者在前，长尾一次性评论者在后
const COMMENTERS = [
  { nickname: '音频工程师老王', device: 'Sony WH-1000XM5', points: 55, testCount: 1, usageHours: 800, createdDaysAgo: 380, lastLoginDaysAgo: 3, bio: '音频行业从业十年，职业病是测分贝' },
  { nickname: '验配师小周', device: '', points: 45, testCount: 1, usageHours: 150, createdDaysAgo: 300, lastLoginDaysAgo: 6, bio: '助听器验配师，欢迎来问专业问题' },
  { nickname: '儿保医生路过', device: '', points: 30, testCount: 1, usageHours: 130, createdDaysAgo: 260, lastLoginDaysAgo: 2, bio: '儿保科医生，关心孩子的听力发育' },
  { nickname: '皮肤科转耳鼻喉的', device: '', points: 25, testCount: 3, usageHours: 170, createdDaysAgo: 210, lastLoginDaysAgo: 8, bio: '湿疹体质过来人，别硬扛要去查' },
  { nickname: '过来人老陈', device: '', points: 20, testCount: 3, usageHours: 270, createdDaysAgo: 260, lastLoginDaysAgo: 5, bio: '耳鸣康复过来人，有事评论区问' },
  { nickname: '监督员上线', device: '', points: 35, testCount: 2, usageHours: 210, createdDaysAgo: 180, lastLoginDaysAgo: 0.5, thr: 1, bio: '打卡监督员，目标坚持到 Day 100' },
  { nickname: '护耳小卫士', device: '', points: 20, testCount: 2, usageHours: 200, createdDaysAgo: 220, lastLoginDaysAgo: 2, bio: '社区老粉，见到好帖子就想顶' },
  { nickname: '白噪音十级学者', device: '', points: 18, testCount: 1, usageHours: 350, createdDaysAgo: 160, lastLoginDaysAgo: 8, bio: '白噪音助眠两年，设置研究了个遍' },
  { nickname: '数据党', device: '', points: 12, testCount: 6, usageHours: 340, createdDaysAgo: 190, lastLoginDaysAgo: 2, bio: '只看趋势不看单次，图表爱好者' },
  { nickname: '听劝的学渣', device: '', points: 16, testCount: 3, usageHours: 220, createdDaysAgo: 85, lastLoginDaysAgo: 4, bio: '评论区听劝第一名，测完听力后怕' },
  { nickname: '通勤老司机', device: '', points: 6, testCount: 1, usageHours: 400, createdDaysAgo: 200, lastLoginDaysAgo: 9, bio: '通勤十年，习惯比设备重要' },
  { nickname: '骨传导自来水', device: '韶音 OpenRun Air', points: 8, testCount: 1, usageHours: 350, createdDaysAgo: 130, lastLoginDaysAgo: 1, bio: '骨传导三年自来水，跑步党真实安利' },
  { nickname: '擦耳口十年', device: '', points: 12, testCount: 2, usageHours: 380, createdDaysAgo: 280, lastLoginDaysAgo: 5, bio: '健身房十年，耳口清洁是必修课' },
  { nickname: 'Day 3 选手', device: 'AirPods 4', points: 15, testCount: 2, usageHours: 130, createdDaysAgo: 45, lastLoginDaysAgo: 0.8, thr: 1, bio: '打卡第 3 天，音量还没降下来' },
  { nickname: '还在Day2的', device: 'AirPods 3', points: 10, testCount: 1, usageHours: 140, createdDaysAgo: 25, lastLoginDaysAgo: 3, thr: 1, bio: '打卡 Day 2，向 Day 7 前进' },
  { nickname: '十号线难友', device: 'vivo TWS 4', points: 0, testCount: 1, usageHours: 240, createdDaysAgo: 140, lastLoginDaysAgo: 10, bio: '' },
  { nickname: '同城通勤党', device: '', points: 0, testCount: 1, usageHours: 310, createdDaysAgo: 130, lastLoginDaysAgo: 7, bio: '' },
  { nickname: '夜跑爱好者', device: '韶音 OpenRun', points: 0, testCount: 1, usageHours: 290, createdDaysAgo: 150, lastLoginDaysAgo: 9, bio: '' },
  { nickname: '手持Pro2等理由', device: 'AirPods Pro 2', points: 0, testCount: 2, usageHours: 280, createdDaysAgo: 170, lastLoginDaysAgo: 1, bio: '' },
  { nickname: '同款三个月', device: '华为 FreeBuds Pro 3', points: 0, testCount: 1, usageHours: 260, createdDaysAgo: 90, lastLoginDaysAgo: 2, bio: '' },
  { nickname: '王者万年青铜', device: 'Redmi Buds 6', points: 0, testCount: 0, usageHours: 320, createdDaysAgo: 150, lastLoginDaysAgo: 1, cm: false, bio: '' },
  { nickname: '安卓路人', device: '小米 Buds 5', points: 0, testCount: 1, usageHours: 190, createdDaysAgo: 110, lastLoginDaysAgo: 5, bio: '' },
  { nickname: '安卓路人乙', device: 'OPPO Enco Free3', points: 0, testCount: 0, usageHours: 120, createdDaysAgo: 75, lastLoginDaysAgo: 7, bio: '' },
  { nickname: '空中飞人老张', device: 'Bose QuietComfort', points: 0, testCount: 0, usageHours: 500, createdDaysAgo: 240, lastLoginDaysAgo: 3, bio: '' },
  { nickname: '拔套子吓一跳的', device: '小米 Buds 4', points: 0, testCount: 1, usageHours: 130, createdDaysAgo: 55, lastLoginDaysAgo: 15, bio: '' },
  { nickname: '同款受害者', device: '', points: 0, testCount: 2, usageHours: 260, createdDaysAgo: 110, lastLoginDaysAgo: 15, bio: '' },
  { nickname: '康复中的小李', device: '', points: 0, testCount: 2, usageHours: 160, createdDaysAgo: 75, lastLoginDaysAgo: 7, bio: '' },
  { nickname: '站过音响边的', device: '', points: 0, testCount: 1, usageHours: 180, createdDaysAgo: 100, lastLoginDaysAgo: 11, bio: '' },
  { nickname: '晚风与笛', device: '', points: 0, testCount: 0, usageHours: 55, createdDaysAgo: 35, lastLoginDaysAgo: 4, bio: '' },
  { nickname: '慢速行人', device: '', points: 0, testCount: 0, usageHours: 65, createdDaysAgo: 45, lastLoginDaysAgo: 3, bio: '' },
  { nickname: '路过的耳友', device: '', points: 0, testCount: 1, usageHours: 95, createdDaysAgo: 70, lastLoginDaysAgo: 6, bio: '' },
  { nickname: '被戳中的', device: '', points: 0, testCount: 1, usageHours: 105, createdDaysAgo: 55, lastLoginDaysAgo: 1, bio: '' },
  { nickname: '摘耳机第一天', device: '', points: 0, testCount: 0, usageHours: 125, createdDaysAgo: 45, lastLoginDaysAgo: 0.9, bio: '' },
  { nickname: '骑车党后视镜', device: '', points: 0, testCount: 0, usageHours: 160, createdDaysAgo: 60, lastLoginDaysAgo: 10, bio: '' },
  { nickname: '手痒星人', device: '', points: 0, testCount: 0, usageHours: 90, createdDaysAgo: 35, lastLoginDaysAgo: 8, bio: '' },
  { nickname: '预算五百本人', device: '', points: 0, testCount: 1, usageHours: 170, createdDaysAgo: 70, lastLoginDaysAgo: 18, bio: '' },
  { nickname: '被买耳机的表弟', device: '漫步者 NeoBuds Pro 2', points: 0, testCount: 0, usageHours: 90, createdDaysAgo: 65, lastLoginDaysAgo: 22, bio: '' },
  { nickname: '曾经的信徒', device: '', points: 0, testCount: 0, usageHours: 120, createdDaysAgo: 95, lastLoginDaysAgo: 28, bio: '' },
  { nickname: '怕热星人', device: '', points: 0, testCount: 0, usageHours: 80, createdDaysAgo: 60, lastLoginDaysAgo: 20, bio: '' },
  { nickname: '熬夜冠军', device: '', points: 0, testCount: 1, usageHours: 300, createdDaysAgo: 90, lastLoginDaysAgo: 12, bio: '' },
  { nickname: '也家有老人', device: '', points: 0, testCount: 0, usageHours: 70, createdDaysAgo: 55, lastLoginDaysAgo: 14, bio: '' },
  { nickname: '在外打工的孙女', device: '', points: 5, testCount: 0, usageHours: 40, createdDaysAgo: 50, lastLoginDaysAgo: 16, bio: '在外打工，远程惦记爷爷奶奶的耳朵' },
  { nickname: '焦虑的橘子', device: '', points: 0, testCount: 1, usageHours: 110, createdDaysAgo: 65, lastLoginDaysAgo: 11, bio: '' },
  { nickname: '潜水爱好者', device: '', points: 0, testCount: 0, usageHours: 85, createdDaysAgo: 120, lastLoginDaysAgo: 19, bio: '' },
  { nickname: '蹦迪在即', device: '', points: 0, testCount: 0, usageHours: 75, createdDaysAgo: 30, lastLoginDaysAgo: 12, bio: '' },
  { nickname: '等等党', device: '', points: 0, testCount: 0, usageHours: 140, createdDaysAgo: 90, lastLoginDaysAgo: 13, bio: '' },
  { nickname: '同款老爸', device: '', points: 0, testCount: 0, usageHours: 80, createdDaysAgo: 65, lastLoginDaysAgo: 27, bio: '' },
  { nickname: '越安静越响本人', device: '', points: 0, testCount: 1, usageHours: 95, createdDaysAgo: 50, lastLoginDaysAgo: 28, bio: '' },
  { nickname: '路过的孝子', device: '', points: 0, testCount: 0, usageHours: 60, createdDaysAgo: 30, lastLoginDaysAgo: 24, bio: '' },
  { nickname: '分贝仪在途', device: '', points: 6, testCount: 1, usageHours: 200, createdDaysAgo: 140, lastLoginDaysAgo: 4, bio: '' },
  { nickname: '地铁超标本人', device: 'vivo TWS 4', points: 0, testCount: 1, usageHours: 330, createdDaysAgo: 120, lastLoginDaysAgo: 2, bio: '' },
  { nickname: '转给我弟的', device: '', points: 0, testCount: 0, usageHours: 150, createdDaysAgo: 80, lastLoginDaysAgo: 4, bio: '' },
  { nickname: '路人甲', device: '', points: 0, testCount: 0, usageHours: 60, createdDaysAgo: 100, lastLoginDaysAgo: 30, cm: false, bio: '' },
  { nickname: '隔壁宿舍的', device: '', points: 0, testCount: 0, usageHours: 150, createdDaysAgo: 80, lastLoginDaysAgo: 25, cm: false, bio: '' },
  { nickname: '宿舍楼下小卖部', device: '', points: 0, testCount: 0, usageHours: 50, createdDaysAgo: 45, lastLoginDaysAgo: 2, bio: '' },
  { nickname: '安卓追问的', device: '小米 Buds 5', points: 0, testCount: 0, usageHours: 110, createdDaysAgo: 40, lastLoginDaysAgo: 4, bio: '' },
  { nickname: '同款疼痛', device: '', points: 0, testCount: 0, usageHours: 100, createdDaysAgo: 40, lastLoginDaysAgo: 30, bio: '' }
]

function withKeys(list, prefix, offset) {
  return list.map((p, i) => ({
    ...p,
    key: p.key || `${prefix}${String(i + 1 + offset).padStart(2, '0')}`,
    role: prefix === 'u' ? (offset === 0 ? 'author' : 'commenter') : 'commenter'
  }))
}

const authorPersonas = withKeys(AUTHORS, 'u', 0)
const commenterPersonas = withKeys(COMMENTERS, 'u', AUTHORS.length)
const allPersonas = [...authorPersonas, ...commenterPersonas]

// 每个帖子里参与角色（作者+评论者）的 key 分组，用于「同帖头像不撞脸」约束
const THREADS = [
  ['小耳朵', ['护耳小卫士', '路人甲', '音频工程师老王']],
  ['早八地铁人', ['十号线难友', '怕热星人']],
  ['失眠的阿哲', ['熬夜冠军', '白噪音十级学者']],
  ['枪声听多了', ['同款受害者', '隔壁宿舍的']],
  ['数码老白', ['预算五百本人', '被买耳机的表弟']],
  ['跑者小夏', ['夜跑爱好者', '曾经的信徒']],
  ['音量50%选手', ['Day 3 选手', '监督员上线']],
  ['右耳发闷中', ['过来人老陈', '康复中的小李']],
  ['坚持就好', ['数据党']],
  ['耳鼻喉规培生', ['听劝的学渣']],
  ['陪爷爷选助听器', ['也家有老人', '验配师小周', '在外打工的孙女']],
  ['挂号小能手', ['焦虑的橘子', '潜水爱好者']],
  ['摘下耳机的人', ['晚风与笛', '路过的耳友', '慢速行人']],
  ['音乐节幸存者', ['蹦迪在即', '站过音响边的']],
  ['通勤两小时的人', ['同城通勤党', '等等党']],
  ['自习室常驻', ['安卓路人']],
  ['路口惊魂未定', ['骑车党后视镜', '通勤老司机']],
  ['落地耳痛患者', ['同款疼痛', '空中飞人老张']],
  ['不敢再掏了', ['拔套子吓一跳的', '手痒星人']],
  ['604宿舍管钱的', ['宿舍楼下小卖部', '王者万年青铜']],
  ['菊厂老用户', ['手持Pro2等理由', '同款三个月', '安卓路人乙']],
  ['六级听力选手', ['还在Day2的', '安卓追问的']],
  ['健身房汗宝宝', ['骨传导自来水', '擦耳口十年', '皮肤科转耳鼻喉的']],
  ['陪妈踩坑的儿子', ['同款老爸', '越安静越响本人', '路过的孝子']],
  ['较真的工科男', ['分贝仪在途', '地铁超标本人', '转给我弟的']],
  ['九零后新手爸爸', ['被戳中的', '摘耳机第一天', '儿保医生路过']]
]

function listPersonas() {
  return allPersonas.map(({ key, nickname, role }) => ({ key, nickname, role }))
}

function listThreadGroups() {
  const byNickname = new Map(allPersonas.map(p => [p.nickname, p.key]))
  return THREADS.map(([author, commenters]) =>
    [author, ...commenters].map(n => {
      const key = byNickname.get(n)
      if (!key) throw new Error(`名册缺少角色：${n}`)
      return key
    })
  )
}

// 生成 seedUsers.js 的 SEED_USERS 数组（schema 与 userFunctions.createUser 对齐）
function listSeedUsers(avatarResolver) {
  const now = Date.now()
  return allPersonas.map(p => {
    const lastLogin = new Date(now - p.lastLoginDaysAgo * 24 * 3600 * 1000)
    return {
      _id: `seed-user-${p.key}`,
      openid: `seed-openid-${p.key}`,
      nickname: p.nickname,
      avatar: avatarResolver(p.key),
      bio: p.bio || '关注听力健康，从每天开始',
      deviceModel: p.device || '',
      profileUpdatedAt: lastLogin.getTime(),
      settings: {
        reminderThreshold: p.thr || 2,
        healthReminder: true,
        testReminder: (p.testCount || 0) > 0,
        communityMessage: p.cm !== false
      },
      testCount: p.testCount || 0,
      usageSeconds: Math.round((p.usageHours || 0) * 3600),
      pointsBalance: p.points || 0,
      createdAt: new Date(now - p.createdDaysAgo * 24 * 3600 * 1000),
      lastLoginAt: lastLogin
    }
  })
}

// 显式指定了头像文件的 persona（后补角色，绕过 prepare 的自动分配，避免扰动已上传头像的映射）
function avatarOverrides() {
  const map = new Map()
  allPersonas.forEach(p => { if (p.avatarFile) map.set(p.key, p.avatarFile) })
  return map
}

module.exports = { listPersonas, listThreadGroups, listSeedUsers, avatarOverrides }
