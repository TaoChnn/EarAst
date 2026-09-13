// 耳友圈种子数据：云函数冷启动后首次调用时同步进云数据库（community / comments 集合）
// 内容定位：覆盖全部板块、贴近真实用户口吻的演示内容。
// 旧版本曾用过的种子 ID 记录在 LEGACY_SEED_*_IDS 中，部署后不在当前列表里的旧种子会被自动清理，
// 真实用户发布的帖子（自动生成 _id）不受影响。
const HOUR = 3600 * 1000
const ago = hours => new Date(Date.now() - hours * HOUR)
// 示例帖封面已迁移至云存储 static/ 目录（与小程序端 points-shop.js 的 CDN 前缀保持一致）
const CDN = 'cloud://cloud1-d0gtoekxv3cf11259.636c-cloud1-d0gtoekxv3cf11259-1472708489/static/'

const SEED_POSTS = [
  {
    _id: 'seed-1',
    tag: 'tip',
    nickname: '小耳朵',
    avatar: '',
    device: 'AirPods Pro 2',
    createTime: ago(52),
    title: '把音量降到 60% 一个月，耳鸣真的轻了',
    summary: '以前通勤音量常年 80%，医生说高频有点下滑，吓得我马上改了 60-60 原则……',
    content: '说出来不怕大家笑话，我以前通勤音量基本顶着 80% 走，总觉得听不清就再调大一点，直到上个月体检，医生说我高频听力有点下滑。\n\n回来就学着执行 60-60 原则：音量不超过 60%，连续戴不超过 60 分钟就摘下来歇 10 分钟。\n\n坚持一个月的真实感受：\n1. 夜里安静下来的滋滋耳鸣声基本听不到了；\n2. 其实 40% 左右的音量就够用，以前是心理作用觉得越大越清楚；\n3. 配合统计页看每天佩戴时长，从 6 小时降到了 2 小时。\n\n耳朵这东西赌不得，建议大家都去测一次听力留个底，以后好对比。',
    cover: '',
    likeCount: 128,
    commentCount: 4,
    favCount: 45
  },
  {
    _id: 'seed-2',
    tag: 'tip',
    nickname: '早八地铁人',
    avatar: '',
    device: 'vivo TWS 4',
    createTime: ago(30),
    title: '早高峰地铁 85 分贝，别再用音量硬扛了',
    summary: '地铁噪音能到 85dB，下车耳朵发木就是这个原因。说说我现在的护耳三步走……',
    content: '在地铁被挤了三年，之前一直觉得「听不清就调大音量」天经地义，直到看到科普说早高峰车厢噪音能到 85dB，才明白为什么每次下车耳朵都发木。\n\n现在我的流程：\n1. 上车先开降噪，把环境轰鸣压下去，这是核心；\n2. 手机里把媒体音量上限锁死在 60%，手滑也调不上去；\n3. 通勤超过一小时就摘耳机，塞包里让耳朵歇会儿。\n\n真的，开了降噪之后 40% 的音量比以前 80% 还清楚。护耳不是不听歌，是别拿耳朵硬扛噪音。',
    cover: '',
    likeCount: 96,
    commentCount: 2,
    favCount: 38
  },
  {
    _id: 'seed-3',
    tag: 'fail',
    nickname: '失眠的阿哲',
    avatar: '',
    device: '小米 Buds 5',
    createTime: ago(76),
    title: '戴着耳机睡了一晚，耳朵闷了一整天',
    summary: '失眠听白噪音，结果戴着入耳式睡着了，第二天右耳闷得像塞了棉花……',
    content: '昨晚失眠，想着听白噪音助眠，就戴着入耳式耳机睡着了，音量大概 40%。\n\n今早醒来右耳明显发闷，像隔着一层水听声音，还有点胀，拖到晚上才慢慢缓过来。\n\n查了下资料，整夜佩戴会让耳道又湿又闷，加上声音一直刺激，很容易出问题。血泪教训：\n1. 助眠用音箱外放，或者设个 30 分钟自动关闭；\n2. 入耳式真的不要戴着睡觉；\n3. 闷胀感超过 24 小时不缓解，别犹豫，去医院。',
    cover: '',
    likeCount: 64,
    commentCount: 2,
    favCount: 12
  },
  {
    _id: 'seed-4',
    tag: 'fail',
    nickname: '枪声听多了',
    avatar: '',
    device: '华为 FreeBuds Pro 3',
    createTime: ago(26),
    title: '打游戏音量开到底，测完听力我人傻了',
    summary: '为了听脚步声常年满音量，昨晚测了下听力，4000Hz 几乎听不见……',
    content: 'FPS 玩家，为了听清脚步声和枪声方向，音量常年拉满，每天 3-4 小时，这个习惯保持了两年。\n\n昨晚用小程序测了下听力，4000Hz 这个频段的听阈明显偏高，报告提示有早期噪音性听力损失风险。查了下，典型的噪音性损伤就是从 4000Hz 开始的，和学医朋友的说法对上了。\n\n已经在改了：\n1. 音量压到 60% 以下，游戏开「夜间模式」压缩动态，不用满音量也能听清细节；\n2. 每小时强制摘耳机休息；\n3. 每个月测一次听力盯着趋势。\n\n兄弟们别学我，等测出来就晚了。',
    cover: '',
    likeCount: 152,
    commentCount: 2,
    favCount: 66
  },
  {
    _id: 'seed-5',
    tag: 'recommend',
    nickname: '数码老白',
    avatar: '',
    device: 'Bose QC Ultra',
    createTime: ago(140),
    title: '预算 500 买降噪耳机，我最后选了这款',
    summary: '帮表弟选耳机，三款热门降噪豆都借来用了一周，说点真实感受……',
    content: '帮表弟选耳机，顺手把 500 元档三款热门降噪豆都借来用了一个星期，说点真实感受，不吹不黑。\n\n降噪：漫步者 NeoBuds Pro 2 的低频压得最狠，地铁轰隆声基本没了；红米那款中规中矩；OPPO 那款均衡。\n佩戴：红米最轻，戴一下午没存在感；OPPO 耳压略明显。\n通话：OPPO 逆风打电话最清楚。\n\n最后给表弟入了漫步者。从护耳角度多说一句：降噪越好，你需要的音量就越低。这个价位别死磕音质，降噪和密封性优先，耳朵会感谢你的。',
    cover: CDN + 'neobuds-pro2.jpg',
    likeCount: 210,
    commentCount: 2,
    favCount: 98
  },
  {
    _id: 'seed-6',
    tag: 'recommend',
    nickname: '跑者小夏',
    avatar: '',
    device: '韶音 OpenRun Pro',
    createTime: ago(160),
    title: '骨传导跑了三个月，说两句大实话',
    summary: '耳道敏感换的骨传导，好处真不少，但「不伤听力」是伪命题……',
    content: '耳道敏感，入耳式戴半小时就痒，换了骨传导三个月，跑了 200 公里，说点大实话。\n\n先说好的：开放耳道是真的舒服，路跑能听见电动车铃声，安全感直接拉满；夏天出汗也不闷。\n\n但是，「骨传导不伤听力」这句话千万别信。声音最后还是走内耳毛细胞，音量开大照样伤。而且嘈杂路段为了盖过车流声，我会不自觉调大音量，反而更危险，现在只在公园和跑步机上用。\n\n一句话总结：骨传导救的是耳道，不是听力。音量习惯不改，换什么耳机都白搭。',
    cover: CDN + 'shokz-openrun.jpg',
    likeCount: 88,
    commentCount: 2,
    favCount: 41
  },
  {
    _id: 'seed-7',
    tag: 'checkin',
    nickname: '音量50%选手',
    avatar: '',
    device: 'AirPods 4',
    createTime: ago(20),
    title: '打卡 Day 21：音量连续三周没超过 50%',
    summary: 'Day 21 打卡！连续三周音量没超过 50%，耳鸣基本没再来过。',
    content: 'Day 21 打卡！连续三周音量没超过 50%，地铁上开降噪就够了，不再手滑拉满；每天佩戴压在 2 小时以内，之前偶尔出现的耳鸣基本没再来过。\n\n方法是靠小程序的每日提醒，超 1 小时就强制摘 15 分钟。头三天特别难受，手总是自己伸向音量键，现在反而觉得摘下来更轻松。\n\n一起打卡的耳友评论区集合，互相盯着点～',
    cover: '',
    likeCount: 52,
    commentCount: 2,
    favCount: 8
  },
  {
    _id: 'seed-8',
    tag: 'question',
    nickname: '右耳发闷中',
    avatar: '',
    device: '',
    createTime: ago(6),
    title: '最近右耳总闷闷的，是耳机戴多了吗？',
    summary: '最近一周右耳总感觉闷闷的，像隔了一层水，是耳机戴多了吗？',
    content: '如题，最近一周右耳总感觉闷闷的，像隔了一层水，捏住鼻子鼓气会缓解一会儿，然后又闷回去。\n\n背景：每天戴入耳式耳机大概 4 小时，音量中等，最近没感冒也没坐飞机。\n\n想问问大家有过类似经历吗？是先停戴观察几天，还是直接去医院？挂号挂耳鼻喉科对吗？有点慌，求过来人指条路。',
    cover: '',
    likeCount: 23,
    commentCount: 3,
    favCount: 3
  },
  {
    _id: 'seed-9',
    tag: 'report',
    nickname: '坚持就好',
    avatar: '',
    device: '',
    createTime: ago(95),
    title: '护耳三个月，两次听力自测对比来了',
    summary: '坚持护耳三个月，平均相对阈值从 45% 左右降到 36%，两次结果贴出来参考。',
    content: '把两次自测结果贴出来，给大家做个参考。\n\n三个月前第一次测：左耳平均相对阈值 45%，右耳 47%，看到结果有点慌。\n这次复测：左耳 34%，右耳 38%，6 个频率全部通过。\n\n这三个月主要改了三件事：音量锁 60%、每天佩戴从 5 小时压到 2 小时、睡前不再戴耳机。体感最明显的是早上醒来耳朵清清爽爽。\n\n说明一下：这个百分比是固定音量下的小程序相对测试值，不是分贝数，也不算医学诊断，但用来看趋势真的有用。',
    cover: '',
    likeCount: 76,
    commentCount: 1,
    favCount: 33
  },
  {
    _id: 'seed-10',
    tag: 'science',
    nickname: '耳鼻喉规培生',
    avatar: '',
    device: '',
    createTime: ago(33),
    title: '为什么听力损伤总是从高频开始？',
    summary: '耳道共振峰让 2-4kHz 的噪音被放大，耳蜗底回毛细胞又最脆弱……',
    content: '轮转时老师讲过这个知识点，忍不住来科普一下：为什么噪音性听力损失总是先从 4000Hz 附近开始？\n\n因为外耳道有个天然共振峰，大概在 2-4kHz，本来是为了让我们听清说话声进化出来的，副作用是外界噪音在这个频段会被放大，毛细胞首当其冲。加上耳蜗底回的毛细胞天生更「脆」，所以高频总是最先掉。\n\n残酷的是，毛细胞死一个少一个，目前没法再生。所以别信「休息休息就恢复了」：暂时性听阈偏移反复发生，就会变成永久下降。\n\n自查小方法：如果开始听不清鸟叫、键盘声，或者听人说话总像糊了一层，建议尽早测一次听力。可以先在小程序里做个相对阈值筛查，有异常再去医院做纯音测听。',
    cover: '',
    likeCount: 134,
    commentCount: 1,
    favCount: 72
  },
  {
    _id: 'seed-11',
    tag: 'device',
    nickname: '陪爷爷选助听器',
    avatar: '',
    device: '',
    createTime: ago(66),
    title: '陪爷爷配助听器的经历，写给大家避坑',
    summary: '爷爷 78 岁看电视声音开到最大还总打岔，上个月终于去验配了助听器……',
    content: '爷爷 78 岁，看电视声音开到最大还总打岔，上个月终于说服他去验配助听器。把踩过的坑写给大家：\n\n1. 别网购「一键放大」的便宜货，那只是把所有声音一起放大，吵得爷爷戴两天就丢抽屉里了。正经助听器要按听力图验配；\n2. 先去医院排除能治的问题。爷爷先掏了耵聍，听力当场好一截，差点白买机器；\n3. 验配有适应期。头一周爷爷嫌吵不肯戴，师傅把增益调低循序渐进，现在吃饭聊天都愿意戴着；\n4. 老人排斥很正常，多鼓励。我们全家约定：跟他说话先叫名字再开口，他说「听清了」就一起夸他。\n\n听力下降不干预，老人会越来越不爱说话，慢慢就把自己关起来了。家里有老人的真的要上心。',
    cover: '',
    likeCount: 178,
    commentCount: 3,
    favCount: 85
  },
  {
    _id: 'seed-12',
    tag: 'hospital',
    nickname: '挂号小能手',
    avatar: '',
    device: '',
    createTime: ago(49),
    title: '耳鸣去医院的全流程，一次讲清楚',
    summary: '挂耳鼻喉科、耳内镜、纯音测听、声导抗……把检查流程和费用都写下来。',
    content: '上个月右耳出现持续性蝉鸣，吓得我第二天就去了医院，把流程写下来给同样慌的人参考：\n\n1. 挂号：耳鼻喉科，尽量约上午，人少些；\n2. 一般会做三个检查：耳内镜看耳道和鼓膜；纯音测听戴耳机听到声音举手；声导抗会有点压力感，不疼，别紧张；\n3. 我的结果都正常，医生说是主观性耳鸣，和熬夜、压力大、耳机戴太久有关，开了改善循环的药，重点让调整作息。\n\n费用：挂号加检查 300 出头，医保报完自付 100 多。\n\n总结：耳鸣不可怕，拖着不查才可怕。花一个下午买个安心，比自己上网瞎搜强一百倍。',
    cover: '',
    likeCount: 89,
    commentCount: 2,
    favCount: 51
  },
  {
    _id: 'seed-13',
    tag: 'mood',
    nickname: '摘下耳机的人',
    avatar: '',
    device: '',
    createTime: ago(5),
    title: '戴了八年耳机，今天第一次觉得安静真好',
    summary: '今天下班没戴耳机，走路回家，居然听见路边有人在吹笛子……',
    content: '没什么具体的事，就是今天下班没戴耳机，走路回家，居然听见路边有人在吹笛子。\n\n八年了，通勤戴、上班戴、吃饭戴、睡前戴，耳机对我来说像器官一样。直到上周体检查出高频有点下滑，我才开始害怕。\n\n今天是我第一次主动不戴耳机走完全程。晚风、笛声、小孩在笑，原来这些声音我全错过了。\n\n耳朵坏了不会好，耳机随时可以摘。共勉。',
    cover: '',
    likeCount: 231,
    commentCount: 3,
    favCount: 117
  },
  {
    _id: 'seed-14',
    tag: 'fail',
    nickname: '音乐节幸存者',
    avatar: '',
    device: '',
    createTime: ago(14),
    title: '音乐节站第一排音响边上，散场后耳朵响了一整晚',
    summary: '为了看清舞台挤到音响正前方，散场后右耳一直鸣，别人说话像隔着玻璃……',
    content: '上周音乐节，为了看清舞台挤到了音响正前方。嗨是嗨完了，代价是散场后右耳一直鸣，别人说话像隔着玻璃。\n\n查了下这叫暂时性听阈偏移，幸运的是第二天傍晚慢慢消退了。但学医的朋友说，这种事每发生一次，毛细胞就折损一批，反复几次就是永久的。\n\n给要去 livehouse 和音乐节的朋友几个真心建议：\n- 离音箱远一点，起码 10 米开外；\n- 买副音乐节耳塞，几十块钱，音质几乎无损，音量直接降 20dB；\n- 散场后给耳朵 12 小时安静时间，别接着戴耳机回味歌单。\n\n听不清别人说话、耳鸣超过 48 小时不退，直接去医院，别扛。',
    cover: CDN + 'music-festival.jpg',
    likeCount: 105,
    commentCount: 2,
    favCount: 29
  },
  {
    _id: 'seed-15',
    tag: 'recommend',
    nickname: '通勤两小时的人',
    avatar: '',
    device: 'Sony WH-1000XM5',
    createTime: ago(8),
    title: '通勤单程两小时，这副耳机救了我的耳朵',
    summary: '之前用入耳式音量常年 70%+，换头戴降噪后 40% 音量反而更清楚……',
    content: '家到公司地铁加步行要两小时。之前用入耳式，为了盖过地铁噪音，音量常年 70% 以上，下车耳朵总是发木。\n\n换头戴式降噪三个月了，同样是 40% 音量，降噪一开比之前开到 70% 还清楚。图里就是我的通勤搭子，一天一充够用。\n\n不是说它多神，而是想告诉大家：噪音环境下，降噪比音量重要得多。你不需要听得更响，你只需要听得清楚。',
    cover: CDN + 'sony-xm5.jpg',
    likeCount: 167,
    commentCount: 2,
    favCount: 73
  },
  {
    _id: 'seed-16',
    tag: 'recommend',
    nickname: '自习室常驻',
    avatar: '',
    device: 'AirPods Pro 2',
    createTime: ago(58),
    title: '用了两年 AirPods Pro，护耳向真实体验',
    summary: '降噪、通透、分贝监测都好用，但入耳式戴久了耳道会胀……',
    content: '换 iPhone 后跟风入的，两年了，从护耳角度说说真实体验。\n\n降噪：图书馆自习室完全够用，通透模式过马路很有安全感；\n护耳相关：系统里能看到实时分贝和佩戴时长，超了会提醒，这个功能对护耳党非常友好；\n缺点：入耳式戴久了耳道会胀，我现在超过一小时必摘下来透透气。\n\n结论：买不买看预算，但「分贝监测 + 时长提醒」这两个功能，无论什么耳机都建议用起来。',
    cover: CDN + 'airpods-pro.jpg',
    likeCount: 141,
    commentCount: 1,
    favCount: 60
  },
  {
    _id: 'seed-17',
    tag: 'tip',
    nickname: '路口惊魂未定',
    avatar: '',
    device: 'OPPO Enco X2',
    createTime: ago(11),
    title: '开着通透模式过马路听歌，差点被电动车送走',
    summary: '通透模式是把环境声「混」进音乐里，不是替你听环境。过马路请关歌……',
    content: '昨晚的事想想都后怕。下班天擦黑，我戴着耳机开通透模式过路口，音乐照放，想着能听见喇叭就安全。结果一辆电动车几乎贴着我窜过去，喇叭是在我旁边才响的，之前那声轻得像背景音，我完全没意识到有人车接近。\n\n后来想明白了：通透模式是把环境声「混」进音乐里，不是替你听环境。注意力在歌上的时候，那些细碎的方向感——轮胎声、铃铛声——全被旋律盖掉了，耳朵收到了，脑子没处理。\n\n现在给自己定了三条规矩：\n1. 过马路、骑车、蹲车尾倒车，音乐直接停，通透模式单独开；\n2. 真想听，只戴一侧，空出来的耳朵留给路况；\n3. 通透模式留给排队、等餐、办公室听同事喊你这些场景。\n\n耳机是为生活服务的，别让它替你承担路口的风险。',
    cover: '',
    likeCount: 43,
    commentCount: 3,
    favCount: 9
  },
  {
    _id: 'seed-18',
    tag: 'fail',
    nickname: '落地耳痛患者',
    avatar: '',
    device: '',
    createTime: ago(38),
    title: '感冒鼻塞还坐飞机，降落那刻我疼出了眼泪',
    summary: '感冒硬坐飞机，下降时右耳像被针扎，航空性中耳炎了解一下……',
    content: '上周感冒鼻塞，刚好赶上要去外地开会，想着忍忍就过去了，没改签。飞机下降时右耳突然像被针扎，疼到我攥紧扶手出了眼泪，落地后半边脸都是木的，耳朵闷了整整两天。\n\n去看了医生，说是航空性中耳炎：感冒的时候咽鼓管黏膜肿着，气压变化时中耳内外压力平衡不了，鼓膜就被憋疼了。\n\n说几个我查到的加医生交代的：\n1. 感冒鼻塞期间能不坐飞机就不坐，下降阶段最疼；\n2. 必须坐的话提前备减充血的鼻喷，起飞下降前喷，多嚼口香糖多做吞咽；\n3. 带小孩的让他在起降时喝奶吞咽，大人可以轻轻捏鼻鼓气；\n4. 亲身验证：降噪耳机对这个完全没用，别指望它，疼的是中耳，不是「听感」。\n\n现在耳朵还有点闷，医生说一周不缓解要复查。大家感冒坐飞机前真的掂量下，那疼我不是想再体验第二次了。',
    cover: '',
    likeCount: 71,
    commentCount: 3,
    favCount: 18
  },
  {
    _id: 'seed-19',
    tag: 'fail',
    nickname: '不敢再掏了',
    avatar: '',
    device: '小米 Buds 4',
    createTime: ago(17),
    title: '棉签掏耳朵掏进了医院，医生说我耳道被耳机捂得太潮',
    summary: '越掏越痒，越痒越掏，最后掏出个外耳道炎。耳朵越掏越痒不是错觉……',
    content: '发个丢人经历。半个月前耳朵痒，我习惯性拿棉签进去搅，越掏越痒，越痒越想掏，掏完那两天又胀又疼还有点流水，实在忍不住去了医院。\n\n诊断是外耳道炎。医生看耳内镜的时候说我耳道皮肤又红又肿，问我平时是不是又戴耳机又掏耳朵。我入耳式一天戴五六个小时，耳朵一痒就棉签伺候，全中。\n\n医生的说法颠覆了我的认知：\n1. 耳道有自洁功能，耳屎会自己排出来，根本不需要主动掏；\n2. 棉签大多是把耳屎往里怼，越掏越堵，还刮伤耳道皮肤；\n3. 天天戴入耳式，耳道又湿又闷，皮肤屏障本来就弱，再一刮就发炎。\n\n现在我把耳机换成了半开放式的，每天戴的时间砍半，耳机头每周用酒精棉片擦一遍，耳朵痒就滴医生开的药水，坚决不掏。\n\n奉劝各位手痒星人：耳朵越掏越痒不是错觉，那是它在报警。',
    cover: '',
    likeCount: 88,
    commentCount: 3,
    favCount: 15
  },
  {
    _id: 'seed-20',
    tag: 'recommend',
    nickname: '604宿舍管钱的',
    avatar: '',
    device: 'Redmi Buds 6',
    createTime: ago(72),
    title: '宿舍四个人凑了四副百元耳机，横评给学弟学妹',
    summary: '红米、漫步者、QCY、荣耀各一副，体验一周：百元档买的是「不心疼加够用」……',
    content: '期末周图书馆限电，我们宿舍四个人干脆把各自的百元耳机凑一块儿，做了个穷鬼横评。四副：红米 Buds 6、漫步者 Lolli3、QCY T13、荣耀 Earbuds X5，都是一百出头，学生党主流选择。\n\n一星期体验下来：\n降噪：四副都别指望，红米和漫步者能压掉图书馆的风扇声，够用；\n佩戴：QCY 最轻但耳套偏硬，我戴两小时会痒，荣耀最无感；\n延迟：打游戏都一般，QCY 和红米开了低延迟模式打王者基本对口型；\n续航：红米带仓撑了一周（每天三四小时），其他几个差不多。\n\n最后结论有点反直觉：百元档买的就是「不心疼加够用」，音质差距真不大，别信博主的玄学，挑戴着最舒服、续航最顶的就行。\n\n护耳提醒：宿舍夜刷剧别为了盖室友键盘声开大音量，十几块的耳塞比啥都强。我们宿舍现在人均一副耳塞，和而不同（笑）。',
    cover: '',
    likeCount: 194,
    commentCount: 3,
    favCount: 86
  },
  {
    _id: 'seed-21',
    tag: 'recommend',
    nickname: '菊厂老用户',
    avatar: '',
    device: '华为 FreeBuds Pro 3',
    createTime: ago(9),
    title: '加班三个月，这副耳机陪我挤了九十多天地铁',
    summary: '通勤单程一小时，它把我的音量从 75% 拉回了 40%……',
    content: '换到新公司之后通勤变成了单程一小时地铁，之前那副半入耳式在车上根本听不清人声播客，音量一路飙到 75%，下车耳朵发木。意识到不行，得换降噪。\n\n纠结了半个月入了华为 FreeBuds Pro 3，用满三个月，说说体验：\n\n降噪：地铁轰隆声压得很干净，40% 音量听播客字字清楚，这是它最值的地方，我的通勤音量从 75% 降到了 40%；\n佩戴：耳压比 AirPods 略明显，连续戴两小时会想透口气；\n续航：开降噪六小时左右，一天一充，周五忘充电仓周六会焦虑；\n小吐槽：智慧生活 App 弹窗有点烦，夏天戴是真的捂耳朵。\n\n最想夸的其实是时长统计和音量提醒，每天佩戴超时会推，对护耳党太友好了。\n\n总结：它不是什么颠覆性的耳机，但「降噪加时长提醒」这两件事，实打实把我的耳朵从音量 75% 的路上拉回来了。',
    cover: CDN + 'huaweifreebudspro.jpg',
    likeCount: 57,
    commentCount: 4,
    favCount: 21
  },
  {
    _id: 'seed-22',
    tag: 'checkin',
    nickname: '六级听力选手',
    avatar: '',
    device: 'AirPods 3',
    createTime: ago(4),
    title: '护耳打卡 Day 7：把音量从 90% 按回 50% 的一周',
    summary: '备考听力天天三小时，音量悄悄涨到 90%。这周压回 50%，经验就一条……',
    content: '打卡 Day 7！给自己立个帖子当存档点。\n\n背景：备考六级，每天戴耳机刷听力三小时起步。前阵子发现越刷音量越大，从 60% 悄悄涨到了 90%，摘下耳机世界都发飘，吓到了，决定改。\n\n这周的真实记录：\nDay 1-2：50% 听听力像隔了层纱，烦躁，差点放弃；\nDay 3：发现换个安静角落坐，50% 突然就清楚了——原来不是音量不够，是环境太吵；\nDay 5：早上醒来耳朵不发胀了，之前那种嗡嗡的余音没有了；\nDay 7（今天）：50% 已经完全适应，偶尔 55% 也不慌。\n\n经验就一条：音量下不来，多半是环境吵。先解决环境，再谈自制力。\n\nDay 30 再来汇报，评论区有一起打卡的吗？备考的耳友互相盯着点。',
    cover: '',
    likeCount: 36,
    commentCount: 3,
    favCount: 6
  },
  {
    _id: 'seed-23',
    tag: 'question',
    nickname: '健身房汗宝宝',
    avatar: '',
    device: 'Beats Studio Buds',
    createTime: ago(2.5),
    title: '一健身耳朵就痒，你们运动党都怎么戴耳机？',
    summary: '一周四练，最近练完耳朵又痒又湿。出汗戴耳机的坑，求运动党支招。',
    content: '如题，最近一健身耳朵就出问题。\n\n情况是这样：一周四练，每次都靠入耳式耳机配劲爆歌单撑着。最近发现每次练完耳朵里面痒，湿漉漉的，有时候摘耳机还能带出点潮气。昨天练完腿，痒到忍不住用手指去掏（我知道不对）。\n\n想问问运动量大的耳友：\n1. 出汗进耳道这个事你们怎么处理？有专门的防水耳塞吗？\n2. 换骨传导能解决吗？看网上说开放耳道不闷，但担心健身房太吵听不清；\n3. 耳机本身需要清洁吗？多久清一次？\n\n先谢过，痒得太影响撸铁了。',
    cover: '',
    likeCount: 18,
    commentCount: 3,
    favCount: 2
  },
  {
    _id: 'seed-24',
    tag: 'hospital',
    nickname: '陪妈踩坑的儿子',
    avatar: '',
    device: '',
    createTime: ago(29),
    title: '我妈买了两千八的「耳鸣神药」，我想替她骂一句',
    summary: '短视频里「三盒根治耳鸣」的话术，骗走了我妈两千八。带她挂三甲才走回正路……',
    content: '标题骂的不是药，是卖药的。\n\n我妈耳鸣小半年，一直忍着没说。前阵子刷短视频刷到个「百年老方，三盒根治耳鸣」，客服嘘寒问暖一顿话术，两千八，她偷偷买了。我收到快递才发现，气得半宿没睡。\n\n先说结果：吃了两盒，没用。我直接挂了三甲耳鼻喉科。\n\n检查做完（耳内镜、纯音测听、声导抗），医生说各项指标都还好，属于年龄相关的耳鸣，劳累和焦虑会放大它。根治谈不上，但可以和平共处：\n1. 别盯着耳鸣听，越关注越响，这是听觉焦虑的恶性循环；\n2. 睡前放点白噪音或轻音乐当背景声，把安静「填」上；\n3. 规律作息，咖啡浓茶减量；\n4. 医生原话：宣称能根治耳鸣的药，都是冲着你的钱包去的。\n\n两千八的教训写出来给大家提个醒：家里长辈刷到这类广告多问一句。真有困扰，几十块挂号费就能得到正经答案。',
    cover: '',
    likeCount: 112,
    commentCount: 4,
    favCount: 40
  },
  {
    _id: 'seed-25',
    tag: 'science',
    nickname: '较真的工科男',
    avatar: '',
    device: '',
    createTime: ago(120),
    title: '手机音量 60%，到底等于多少分贝？我实测了',
    summary: '借了分贝仪实测：同样 60%，安静房间约 78dB，地铁车厢能到 92dB……',
    content: '工科生职业病，看到「音量不超过 60%」这句话就想问：60% 到底是多响？\n\n借了实验室的分贝仪实测了一下自己的设备。数据仅供参考，跟耳机型号、佩戴密合度关系很大：\n\n入耳式，安静房间：\n30% 约 62dB；50% 约 74dB；60% 约 78dB。\n\n同型号入耳式，地铁车厢：\n60% 约 92dB。\n\n头戴式（不开降噪），地铁车厢：\n60% 约 88dB。\n\n结论一目了然：音量百分比是相对值，不是分贝。同样 60%，安静房间里是安全的，地铁上已经摸到噪音性损伤的门槛（85dB 以上长期暴露）。所谓 60% 原则，前提是安静环境，或者开着降噪。\n\n所以别再问「我音量才一半怎么就伤耳朵了」，你的一半，得看你人在哪。\n\n附赠一个自查方法：戴着耳机用正常音量跟人聊天，如果对方说话你要摘耳机才能听清，基本就是超了。',
    cover: CDN + 'db-test-chart.jpg',
    likeCount: 156,
    commentCount: 4,
    favCount: 90
  },
  {
    _id: 'seed-26',
    tag: 'mood',
    nickname: '九零后新手爸爸',
    avatar: '',
    device: '',
    createTime: ago(1.5),
    title: '女儿问我：爸爸，你耳朵里到底有什么好听的？',
    summary: '周六带三岁的女儿去公园，她突然指着我的耳朵问了这句话。我愣了几秒……',
    content: '周六带三岁的女儿去公园，我照例戴着耳机听播客，她突然停下来，指着我的耳朵问：「爸爸，你耳朵里有什么好听的？」\n\n我愣了几秒，把耳机摘了，说：没什么好听的，爸爸陪你听。\n\n那个下午我们蹲在池塘边听了十分钟喷泉，她给每一声鸟叫都起了名字，把落叶踩得咔嚓响，笑得很大声。说真的，这些声音的密度，比我耳机里任何一个播客都高。\n\n晚上复盘了一下自己：日均佩戴八小时，通勤听、上班听、带娃也下意识戴着，耳机像一层壳，把我跟眼前的日子隔开了。耳朵还没出问题，是日子先出了问题。\n\n做了两个小决定：\n1. 每天进家门到女儿睡前，耳机不进耳朵；\n2. 周末至少留一个不戴耳机的完整下午。\n\n第一天执行完，来这儿记一笔。耳机里的世界是自己挑的，但她递过来的世界，是我挑不出来的。',
    cover: '',
    likeCount: 25,
    commentCount: 3,
    favCount: 11
  },
  {
    _id: 'seed-27',
    tag: 'report',
    nickname: '听劝的学渣',
    avatar: '',
    device: '',
    createTime: ago(2.2),
    title: '被评论区劝来测听力，顺手把健康档案晒出来了',
    summary: '人生第一份听力档案：完善度 83%，近 7 天日均 9.4 小时被标红，平均音量 90 分贝……',
    content: '之前在评论区立过 flag 说要去测听力，已经去测完了，今天顺手把健康档案也完善了，截图放图里。\n\n先说好的一面：档案完善度 83%，听力测试做完三次了，报告都没大问题。\n\n然后是被数据打脸的部分：近 7 天日均佩戴 9.4 小时，超出阈值被标红了，平均音量 90 分贝。对比近 30 天日均 3.1 小时——开学这段又是课程设计又是社团招新，耳机从早挂到晚，直接把我前几周的自律全填进去了。\n\n档案里「每日用耳提醒」我设的是 4 小时，显然最近天天超。看完这个页面我是真的坐不住了：音量降回 50%，佩戴时长先砍回 5 小时以内，10 月复测一次看趋势。\n\n对了，档案还差一项「感冒或用药记录」没填，完善度才 83%，强迫症已经被逼着去补了。\n\n大家也看看自己的健康档案，敢不敢晒？（笑）',
    cover: CDN + 'report-screenshot.jpg',
    likeCount: 21,
    commentCount: 3,
    favCount: 9
  },
  {
    _id: 'seed-28',
    tag: 'tip',
    nickname: '摘下耳机的人',
    avatar: '',
    device: '',
    createTime: ago(10),
    title: '耳机不进卧室：一条家规，治好了我的睡前刷耳机',
    summary: '复盘佩戴记录才发现，最伤的不是通勤是睡前。耳机放玄关一个月，时长直接砍半……',
    content: '之前认真复盘过自己的佩戴记录，发现最伤耳朵的不是通勤，是睡前——躺床上戴着耳机刷视频，一刷一两个小时，音量还不知不觉越调越大。\n\n上个月开始执行一条家规：耳机进家门就放玄关的充电位，不带上床。想睡前听点什么，就用小音箱外放，定时 30 分钟自动停。\n\n头几天是真的手痒，躺下总觉得少了点什么，好几次想光脚下床去玄关拿。坚持到一周左右，发现睡前那段安静的时间反而让人睡得快，最大的变化是早上醒来耳朵不胀了。\n\n这条规则的本质不是少用耳机，是不在「耳朵该下班的时间」用它。推荐给每一个睡前最后一件事是戴耳机的人。\n\n补充：蓝牙音箱二三十块的定时功能就够用，别买贵的。',
    cover: '',
    likeCount: 67,
    commentCount: 3,
    favCount: 31
  },
  {
    _id: 'seed-29',
    tag: 'recommend',
    nickname: '陪爷爷选助听器',
    avatar: '',
    device: '',
    createTime: ago(27),
    title: '给爷爷换了开放式助听器，他终于不嫌「塞得慌」了',
    summary: '之前发过陪爷爷验配助听器的帖子，后续来了：换成耳夹式开放式，爷爷戴着听戏一下午……',
    content: '之前写过陪爷爷验配助听器的避坑帖，评论区有朋友提到开放式，后续来了。\n\n爷爷的机器到了换新周期，跟验配师聊的时候特意问了开放式，试戴了半小时耳夹式的，爷爷的原话是「耳朵里没东西了」。现在每天戴着听戏、下楼遛弯，一下午不摘，对我们全家来说这已经是巨大胜利。\n\n说说体验：不堵耳道，老人耳道本来就脆弱；操作只有一个按钮，爷爷学一次就会；夹得稳，遛弯也不掉。\n\n要提醒的：1. 助听器级的开放式要验配，验配师说功率要看听损程度，重的老人不一定够用，别直接网购；2. 开放式不堵耳，外界声混着进，爷爷看电视会把音量开大点，这个取舍我们觉得值；3. 预算紧的可以先买个消费级开放式试戴，确认老人能接受这种形态，再去看助听器级别的。\n\n家里老人排斥「塞耳朵」的，真的可以问问验配师这个方向。',
    cover: CDN + 'open-ear-elder.jpg',
    likeCount: 133,
    commentCount: 3,
    favCount: 62
  },
  {
    _id: 'seed-30',
    tag: 'recommend',
    nickname: '失眠的阿哲',
    avatar: '',
    device: '小米 Buds 5',
    createTime: ago(36),
    title: '睡眠耳机戴了一周：这次真的能戴着睡了',
    summary: '之前戴入耳式睡着翻过车，评论区推荐的平铺式睡眠耳机，用了一周说点实话……',
    content: '之前发过戴入耳式耳机睡着、耳朵闷一整天的帖子，评论区一堆人推荐睡眠耳机，研究半个月入了一副平铺式的（贴在耳廓旁边、不伸进耳道那种），用了一周来交作业。\n\n好的方面：侧睡完全不压耳朵，我标准侧睡党亲测；跟 App 联动定时关闭，30 分钟后自动停，再也不会「听着听着睡死过去戴一宿」；翻身不脱落，早上醒来还在耳朵上挂着。\n\n要降低预期的：音质别指望，听歌像隔了层纱，但放白噪音、助眠播客刚好；另外它本质是把「戴着舒服」做满了，不是把「听得爽」做满，买之前想清楚需求。\n\n价格一百多到三百都有，个人觉得买便宜的就行，这东西技术含量真不高，两百出头的够用了。\n\n最大的变化是：半夜醒来耳朵不闷不胀了。但也说句实话，助眠的核心还是规律作息，耳机只是辅助，别指望它治失眠。',
    cover: CDN + 'sleepbuds.jpg',
    likeCount: 97,
    commentCount: 3,
    favCount: 44
  },
  {
    _id: 'seed-31',
    tag: 'checkin',
    nickname: '六级听力选手',
    avatar: '',
    device: 'AirPods 3',
    createTime: ago(0.6),
    title: '打卡 Day 30：音量达标了，但统计页给我上了一课',
    summary: '约好的 Day 30 汇报来了。音量稳在 50% 了，结果一翻统计页：日均佩戴 8 小时 11 分……',
    content: 'Day 30 汇报，如约来了。\n\n先说达标的部分：备考听力的音量稳定在 50%-55%，六级真题听得清清楚楚，Day 7 帖子里立的 flag 算是完成了。\n\n然后是昨晚被自己的数据上课的部分：我翻了翻统计页，本月日均佩戴 8 小时 11 分，累计 73 小时 40 分，耳机使用平均 90dB。也就是说，音量是降了，但我戴着的时间根本没少，算总账的话，暴露量没降多少，只是从「音量伤」换成了「时长伤」。\n\n所以 Day 30-60 就一个目标：日均佩戴压到 5 小时以内。具体动作：吃饭必摘、走路听环境音、不刷听力的时间不戴耳机。\n\n截图放图里了，欢迎监督。也看看你们的统计页，敢不敢发出来（笑）。',
    cover: CDN + 'stats-calendar.jpg',
    likeCount: 12,
    commentCount: 3,
    favCount: 4
  },
  {
    _id: 'seed-32',
    tag: 'fail',
    nickname: '被方案支配的人',
    avatar: '',
    device: 'AirPods Pro 2',
    createTime: ago(7.5),
    title: '连赶三天方案到凌晨，耳朵用耳鸣提醒我该睡了',
    summary: '降噪一开就是六小时，方案改到第八版的时候，右耳里开始有细细的蝉鸣……',
    content: '广告狗，比稿周。周一到周三连着熬，降噪耳机对我来说是「进入工作状态」的仪式感，戴上就摘不下来，怕被打断，一戴就是五六个小时。\n\n音量倒是不高，40% 左右，我一直觉得这样就没问题。周三凌晨两点，方案改到第八版，右耳里开始出现细细的蝉鸣，安静环境下特别明显，吓得我当场摘了耳机。\n\n第二天请假去医院，耳道正常、听力测试正常，医生说是疲劳相关的暂时性耳鸣，熬夜、精神紧张、长时间戴耳机都是诱因，原话是「这次能退，再继续作就不一定了」。\n\n现在的规矩：单次佩戴不超过 90 分钟，到点摘 10 分钟，设了闹钟的；比稿周宁可开外放被同事骂，也不戴一整天。\n\n分享给每一个「音量不高就没事」的朋友：时长也是暴露量的一部分，耳鸣第一次上门就是警告函，别签收第二次。',
    cover: '',
    likeCount: 58,
    commentCount: 2,
    favCount: 17
  },
  {
    _id: 'seed-33',
    tag: 'tip',
    nickname: '陪妈踩坑的儿子',
    avatar: '',
    device: '',
    createTime: ago(13),
    title: '给我妈手机锁了音量上限，她再也没「越听越大」过',
    summary: '妈妈刷短视频音量越来越野，我把她手机的媒体音量上限锁在 60%，两边世界都清净了……',
    content: '之前写过我妈买「耳鸣神药」的帖子，今天补个后续：检查完没什么大问题，但她刷短视频的音量越来越野，隔一个房间都觉得吵。\n\n观察下来发现，她不是真的要听那么大声，而是环境一吵就往上加，加了就再也下不来，下次又从更大的基数往上加。恶性循环。\n\n我用她手机的「声音与振动」设置把媒体音量上限锁在 60%（安卓大部分机型都有类似功能；iPhone 在「耳机安全」里设「降低高音量」），顺手给她蓝牙耳机的弹窗音量也校准了一遍。再教了两句口诀：听不清，先摘下来擦一擦耳机套、关一关窗户，别急着加音量。\n\n两周过去，她完全没觉得不方便，我这边世界清净了。\n\n建议大家回家给长辈的手机做一次「音量体检」，五分钟的事，比说一百遍「开小点」有用。',
    cover: '',
    likeCount: 81,
    commentCount: 2,
    favCount: 27
  },
  {
    _id: 'seed-34',
    tag: 'question',
    nickname: '客服工位的桃子',
    avatar: '',
    device: '工位配发的头戴式',
    createTime: ago(1.1),
    title: '一天 8 小时挂着耳机的客服，怎么把伤害降到最低？',
    summary: '工作原因必须全程戴耳机，时长没得选。想问问这种情况下怎么补救……',
    content: '如题，岗位是电商客服，工作时间必须全程戴耳机（公司配的头戴式），一天 7-8 小时起步，大促排班的时候午饭都挂着。\n\n音量还不完全可控：系统推给客户的声音偏小，工位环境又吵，总会不自觉凑近去听。\n\n想请教有类似情况的耳友：\n1. 这种「时长没得选」的情况，中间怎么休息最科学？每小时摘 5 分钟有用吗？\n2. 海绵耳罩套戴久了闷得耳朵起皮，有更换周期或者材质推荐吗？\n3. 这种工作强度需要定期测听力吗？多久一次合适？\n\n先谢谢各位耳友，工位等一个答案。',
    cover: '',
    likeCount: 15,
    commentCount: 3,
    favCount: 2
  },
  {
    _id: 'seed-35',
    tag: 'science',
    nickname: '音频工程师老王',
    avatar: '',
    device: 'Sony WH-1000XM5',
    createTime: ago(22),
    title: '降噪不背锅：伤听力的从来不是降噪，是音量',
    summary: '职业相关，被问最多的就是「降噪耳机伤不伤听力」。反直觉的答案：降噪恰恰是护耳的……',
    content: '做音频这行十年，被亲戚朋友问最多的问题就是「降噪耳机是不是伤听力」。今天把话说清楚。\n\n降噪本身不产生任何声音，它是用反向声波把环境噪音抵消掉。噪音变小了，你需要的音量就变小了。伤听力的一直是「音量 × 时长」，降噪最大的功德，就是让你在地铁、飞机上不用再拿音量硬扛噪音：以前 75% 才能盖过轰隆声，开降噪 40% 就够了。\n\n要说降噪真正的「坏处」，也有三条：1. 少数人开强降噪会有耳压感，多数是没适应，歇几天就好；2. 通透模式在马路上滥用有安全风险（参考之前路口那位老哥的帖子，非常真实）；3. 太舒服会导致佩戴时间变长——所以降噪是双刃剑，但柄在音量和时长手里。\n\n结论：放心开降噪，管住音量和时长。这两样才是本金。',
    cover: '',
    likeCount: 119,
    commentCount: 3,
    favCount: 66
  },
  {
    _id: 'seed-36',
    tag: 'checkin',
    nickname: '还在Day2的',
    avatar: '',
    device: 'AirPods 3',
    createTime: ago(3.2),
    title: '打卡 Day 9：音量降下来了，全靠三个笨办法',
    summary: 'Day 2 的帖子还有人记得吗？汇报：90% 降到 55%，没有聪明办法，全是笨办法……',
    content: '前几天发过 Day 2 打卡（音量还没降下来的那位），今天 Day 9，来汇报：55% 稳定，遇到高潮部分偶尔冲到 60%，比一开始的 90% 好了不知道多少。\n\n没有聪明办法，全是笨办法：\n1. 物理降级：把常听的歌单换成轻一些的（民谣、Lo-fi），本来就不需要那么大音量，重金属再见了；\n2. 换环境：地铁上不再硬扛，降噪开起来，音量自然就下来了，这钱真不能省；\n3. 找参照：戴上耳机后跟旁边人正常说话，不摘耳机能听清就继续，听不清就降。\n\n最意外的是第 3 条，自从跟室友互相当「音量参照物」，我们俩的音量一起下来了，还挺好笑的。\n\n目标 Day 21，到时候再来。',
    cover: '',
    likeCount: 24,
    commentCount: 2,
    favCount: 5
  },
  {
    _id: 'seed-37',
    tag: 'mood',
    nickname: '在外打工的孙女',
    avatar: '',
    device: '',
    createTime: ago(4.6),
    title: '视频通话才发现，奶奶把电视音量调到了 62',
    summary: '周末跟奶奶视频，她那边的电视声大得盖过她说话。挂了电话我心里堵了很久……',
    content: '在外地工作，跟奶奶一周一次视频。这周日聊到一半才发现不对劲：她那边的电视声大得盖过了她说话，我让她关小点，她把手机凑得特别近，说「这样才听得见你」。\n\n挂了视频我心里堵了很久。去年回家没觉得她听力差成这样，是变化太慢了，慢到身边的人都习惯了。\n\n当晚做了三件事：给她买了个按键字特别大的遥控器，她能自己调音量不用求人；跟爸爸说好这个周末带她去做听力检查，先排除耳垢这种最容易解决的小问题；跟她约定以后视频改成「我打字、她看大字」，不硬撑着听。\n\n我们总说忙完这阵就回家，但听力这个事不等人，它坏得很安静。早点发现，早点干预，别等家里人造句都要靠猜的那天才着急。',
    cover: '',
    likeCount: 33,
    commentCount: 3,
    favCount: 12
  }
]

const SEED_COMMENTS = [
  // seed-1 60-60 原则
  { _id: 'seed-c1', postId: 'seed-1', nickname: '护耳小卫士', avatar: '', createTime: ago(50), content: '顶！我也坚持一个月了，早上醒来耳朵清清爽爽的感觉太好了。' },
  { _id: 'seed-c2', postId: 'seed-1', nickname: '路人甲', avatar: '', createTime: ago(49), content: '请问音量上限是在手机哪里设置？安卓能锁吗？' },
  { _id: 'seed-c3', postId: 'seed-1', nickname: '小耳朵', avatar: '', createTime: ago(48), content: '回复楼上：部分安卓在「声音与振动」里有媒体音量限制，找不到的话装个音量管理的 App 也行。' },
  { _id: 'seed-c4', postId: 'seed-1', nickname: '音频工程师老王', avatar: '', createTime: ago(47), content: '补充个专业数据：85dB 以上长期暴露就会有累积性损伤，统计页里能看每日暴露时长，可以留意下。' },
  // seed-2 地铁降噪
  { _id: 'seed-c5', postId: 'seed-2', nickname: '十号线难友', avatar: '', createTime: ago(28), content: '同一条线！降噪加锁音量坚持一周，下车耳朵不发木了。' },
  { _id: 'seed-c6', postId: 'seed-2', nickname: '怕热星人', avatar: '', createTime: ago(27), content: '求问头戴式夏天怎么办，耳朵捂得慌……' },
  // seed-3 戴耳机睡觉
  { _id: 'seed-c7', postId: 'seed-3', nickname: '熬夜冠军', avatar: '', createTime: ago(74), content: '我也干过同款事，早上起来耳朵闷得像进了水，再也不敢了。' },
  { _id: 'seed-c8', postId: 'seed-3', nickname: '白噪音十级学者', avatar: '', createTime: ago(73), content: '定时 30 分钟自动关是真的有用，亲测，大家都去设置一下。' },
  // seed-4 打游戏
  { _id: 'seed-c9', postId: 'seed-4', nickname: '同款受害者', avatar: '', createTime: ago(24), content: '我也是 4000Hz 出的问题……已改夜间模式，一起改！' },
  { _id: 'seed-c10', postId: 'seed-4', nickname: '隔壁宿舍的', avatar: '', createTime: ago(23), content: '转给我室友看了，他音量比我这个还大，救命。' },
  // seed-5 500 元档
  { _id: 'seed-c11', postId: 'seed-5', nickname: '预算五百本人', avatar: '', createTime: ago(138), content: '正好预算 500，抄作业了！' },
  { _id: 'seed-c12', postId: 'seed-5', nickname: '被买耳机的表弟', avatar: '', createTime: ago(137), content: '哈哈哈就是我，用了一周，很香，谢谢哥。' },
  // seed-6 骨传导
  { _id: 'seed-c13', postId: 'seed-6', nickname: '夜跑爱好者', avatar: '', createTime: ago(158), content: '同款，公路跑必备。音量这事确实得自己管住手。' },
  { _id: 'seed-c14', postId: 'seed-6', nickname: '曾经的信徒', avatar: '', createTime: ago(157), content: '「骨传导不伤耳」我信了好几年，今天被打醒了。' },
  // seed-7 护耳打卡
  { _id: 'seed-c15', postId: 'seed-7', nickname: 'Day 3 选手', avatar: '', createTime: ago(18), content: '我才第三天，音量还没降下来，向楼主看齐！' },
  { _id: 'seed-c16', postId: 'seed-7', nickname: '监督员上线', avatar: '', createTime: ago(17), content: '来了来了，评论区互相盯着，一起坚持到 Day 100！' },
  // seed-8 求助
  { _id: 'seed-c17', postId: 'seed-8', nickname: '过来人老陈', avatar: '', createTime: ago(5), content: '建议先停戴观察两三天，没缓解直接耳鼻喉科，别拖。' },
  { _id: 'seed-c18', postId: 'seed-8', nickname: '康复中的小李', avatar: '', createTime: ago(4.5), content: '我之前也闷，医生说是耵聍堵了，冲洗完立刻清爽。先去查查更放心。' },
  { _id: 'seed-c19', postId: 'seed-8', nickname: '右耳发闷中', avatar: '', createTime: ago(4), content: '谢谢大家，明天就去挂号，回来同步结果。' },
  // seed-9 测听对比
  { _id: 'seed-c20', postId: 'seed-9', nickname: '数据党', avatar: '', createTime: ago(90), content: '趋势对比比单次数值有意义多了，这个思路很赞。' },
  // seed-10 科普
  { _id: 'seed-c21', postId: 'seed-10', nickname: '听劝的学渣', avatar: '', createTime: ago(31), content: '所以听不清键盘声真不是错觉？马上去测了一个，果然高频差，后怕。' },
  // seed-11 助听器
  { _id: 'seed-c22', postId: 'seed-11', nickname: '也家有老人', avatar: '', createTime: ago(64), content: '看得有点想哭，我爷爷就是嫌吵不肯戴。学你们的约定法试试。' },
  { _id: 'seed-c23', postId: 'seed-11', nickname: '验配师小周', avatar: '', createTime: ago(63), content: '职业相关补充一下：适应期循序渐进是对的，两周还适应不了记得回店微调。' },
  { _id: 'seed-c24', postId: 'seed-11', nickname: '在外打工的孙女', avatar: '', createTime: ago(62), content: '周末回家就把这条转给我爸妈，谢谢楼主。' },
  // seed-12 就医流程
  { _id: 'seed-c25', postId: 'seed-12', nickname: '焦虑的橘子', avatar: '', createTime: ago(47), content: '感谢！正慌着呢，明天就去挂个号。' },
  { _id: 'seed-c26', postId: 'seed-12', nickname: '潜水爱好者', avatar: '', createTime: ago(46), content: '声导抗那一下有点痒，但不疼，别被名字吓到哈哈。' },
  // seed-13 心情树洞
  { _id: 'seed-c27', postId: 'seed-13', nickname: '晚风与笛', avatar: '', createTime: ago(4), content: '这条看得我鼻子一酸，明天也试试不戴耳机走一段。' },
  { _id: 'seed-c28', postId: 'seed-13', nickname: '路过的耳友', avatar: '', createTime: ago(3.5), content: '「耳机随时可以摘」，这句话说得真好。' },
  { _id: 'seed-c29', postId: 'seed-13', nickname: '慢速行人', avatar: '', createTime: ago(3), content: '已经在下班路上实践了，风吹过的声音原来这么好听。' },
  // seed-14 音乐节
  { _id: 'seed-c30', postId: 'seed-14', nickname: '蹦迪在即', avatar: '', createTime: ago(12), content: '下周音乐节，耳塞现在就下单！' },
  { _id: 'seed-c31', postId: 'seed-14', nickname: '站过音响边的', avatar: '', createTime: ago(11), content: '我上次也站音响旁边，鸣了三天才好，大家千万别学我。' },
  // seed-15 头戴降噪
  { _id: 'seed-c32', postId: 'seed-15', nickname: '同城通勤党', avatar: '', createTime: ago(7), content: '两小时通勤懂的都懂，降噪真的是刚需不是虚荣。' },
  { _id: 'seed-c33', postId: 'seed-15', nickname: '等等党', avatar: '', createTime: ago(6.5), content: '问下夏天戴头戴会不会闷？看中很久了没敢下手。' },
  // seed-16 AirPods
  { _id: 'seed-c34', postId: 'seed-16', nickname: '安卓路人', avatar: '', createTime: ago(56), content: '安卓有没有类似的分贝监测？羡慕这个时长提醒功能。' },
  // seed-17 通透模式过马路
  { _id: 'seed-c35', postId: 'seed-17', nickname: '骑车党后视镜', avatar: '', createTime: ago(10), content: '同款经历，骑车听歌被电动车按喇叭吓一跳，从那以后上车必摘耳机。' },
  { _id: 'seed-c36', postId: 'seed-17', nickname: '通勤老司机', avatar: '', createTime: ago(9.5), content: '通透模式适合排队等餐这种场景，路况还是要靠裸耳朵，这个总结很到位。' },
  { _id: 'seed-c37', postId: 'seed-17', nickname: '路口惊魂未定', avatar: '', createTime: ago(9), content: '对，我现在过马路习惯单侧摘，空出来的耳朵留给路况。' },
  // seed-18 感冒坐飞机
  { _id: 'seed-c38', postId: 'seed-18', nickname: '同款疼痛', avatar: '', createTime: ago(36), content: '我也是，感冒坐飞机落地疼了一路，打车直接去的医院，同病相怜。' },
  { _id: 'seed-c39', postId: 'seed-18', nickname: '空中飞人老张', avatar: '', createTime: ago(35), content: '补充：起飞前喷减充血鼻喷真的有用，我感冒出差必备，比硬扛强太多。' },
  { _id: 'seed-c40', postId: 'seed-18', nickname: '落地耳痛患者', avatar: '', createTime: ago(34), content: '谢谢，下次一定备上，这次是真长记性了。' },
  // seed-19 棉签掏耳
  { _id: 'seed-c41', postId: 'seed-19', nickname: '拔套子吓一跳的', avatar: '', createTime: ago(15), content: '耳机头真的要清洁，我把硅胶套拔下来一看，好家伙，全是蜡。' },
  { _id: 'seed-c42', postId: 'seed-19', nickname: '手痒星人', avatar: '', createTime: ago(14.5), content: '问下耳朵痒了到底该咋办？硬忍着吗？' },
  { _id: 'seed-c43', postId: 'seed-19', nickname: '不敢再掏了', avatar: '', createTime: ago(14), content: '痒得频繁就去医院看看，别自己掏。我后来发现还叠加了硅胶套过敏，换个材质好多了。' },
  // seed-20 百元横评
  { _id: 'seed-c44', postId: 'seed-20', nickname: '宿舍楼下小卖部', avatar: '', createTime: ago(70), content: '「不心疼加够用」总结到位，学生党真实写照。' },
  { _id: 'seed-c45', postId: 'seed-20', nickname: '王者万年青铜', avatar: '', createTime: ago(69), content: '打王者对口型的是哪副？在线等，挺急的。' },
  { _id: 'seed-c46', postId: 'seed-20', nickname: '604宿舍管钱的', avatar: '', createTime: ago(68), content: '红米和 QCY 都行，记得去设置里开低延迟模式。' },
  // seed-21 华为 FreeBuds
  { _id: 'seed-c47', postId: 'seed-21', nickname: '手持Pro2等理由', avatar: '', createTime: ago(8), content: '和 Pro 2 比值得升级吗？手持二代在等一个理由。' },
  { _id: 'seed-c48', postId: 'seed-21', nickname: '同款三个月', avatar: '', createTime: ago(7.5), content: '同款用三个月，说得挺准，夏天捂耳是真的。' },
  { _id: 'seed-c49', postId: 'seed-21', nickname: '安卓路人乙', avatar: '', createTime: ago(7), content: '问下安卓手机有没有类似的佩戴时长统计？还是只有华为管家里有？' },
  { _id: 'seed-c50', postId: 'seed-21', nickname: '菊厂老用户', avatar: '', createTime: ago(6.5), content: '回复楼上：据我所知各家系统都有「健康使用」类功能，翻翻设置，第三方 App 也有类似的。' },
  // seed-22 Day 7 打卡
  { _id: 'seed-c51', postId: 'seed-22', nickname: '还在Day2的', avatar: '', createTime: ago(3), content: 'Day 2 路过，音量还没降下来，看你能坚持到 30。' },
  { _id: 'seed-c52', postId: 'seed-22', nickname: '安卓追问的', avatar: '', createTime: ago(2.8), content: '求问音量百分比在哪看？安卓的。' },
  { _id: 'seed-c53', postId: 'seed-22', nickname: '六级听力选手', avatar: '', createTime: ago(2.5), content: '控制中心点开媒体音量那一格就有百分比，找不到就装个音量管理小工具。' },
  // seed-23 健身耳朵痒
  { _id: 'seed-c54', postId: 'seed-23', nickname: '骨传导自来水', avatar: '', createTime: ago(2), content: '骨传导直接解决，我跑步三年没再痒过，放心冲。' },
  { _id: 'seed-c55', postId: 'seed-23', nickname: '擦耳口十年', avatar: '', createTime: ago(1.8), content: '练完用纸巾角把耳口蘸干，耳机套一周擦一次，亲测能好很多。' },
  { _id: 'seed-c56', postId: 'seed-23', nickname: '皮肤科转耳鼻喉的', avatar: '', createTime: ago(1.5), content: '提醒一下：我之前也一直痒，去看了才知道是耳道湿疹，开了药水才好。老痒别硬扛。' },
  // seed-24 耳鸣神药
  { _id: 'seed-c57', postId: 'seed-24', nickname: '同款老爸', avatar: '', createTime: ago(27), content: '我爸买过「修复神经」的，两千六，骗子专盯老人下手。' },
  { _id: 'seed-c58', postId: 'seed-24', nickname: '越安静越响本人', avatar: '', createTime: ago(26), content: '睡前白噪音那段太真实了，我妈也是，屋里越安静越觉得响。' },
  { _id: 'seed-c59', postId: 'seed-24', nickname: '路过的孝子', avatar: '', createTime: ago(25), content: '声音疗法是啥？求展开说说。' },
  { _id: 'seed-c60', postId: 'seed-24', nickname: '陪妈踩坑的儿子', avatar: '', createTime: ago(24), content: '回复楼上：医生提的是用外界声音「掩盖」耳鸣、让大脑慢慢脱敏，正规医院听力门诊能咨询，别网购。' },
  // seed-25 分贝实测
  { _id: 'seed-c61', postId: 'seed-25', nickname: '分贝仪在途', avatar: '', createTime: ago(118), content: '实测党好评，今晚就拿我爸的分贝仪折腾一下。' },
  { _id: 'seed-c62', postId: 'seed-25', nickname: '地铁超标本人', avatar: '', createTime: ago(117), content: '所以地铁上 60% 其实已经超标了？怪不得每次下车耳朵都闷。' },
  { _id: 'seed-c63', postId: 'seed-25', nickname: '较真的工科男', avatar: '', createTime: ago(116), content: '对，大概率超标。正解是降噪开起来，把音量需求压下去。' },
  { _id: 'seed-c64', postId: 'seed-25', nickname: '转给我弟的', avatar: '', createTime: ago(115), content: '最后那个聊天自查法很实用，已经转发给我弟了。' },
  // seed-26 女儿问耳机
  { _id: 'seed-c65', postId: 'seed-26', nickname: '被戳中的', avatar: '', createTime: ago(1.2), content: '「是我挑不出来的」，这句戳我了。' },
  { _id: 'seed-c66', postId: 'seed-26', nickname: '摘耳机第一天', avatar: '', createTime: ago(1), content: '已经把耳机塞回抽屉了，明天也试试无耳机时段。' },
  { _id: 'seed-c67', postId: 'seed-26', nickname: '儿保医生路过', avatar: '', createTime: ago(0.8), content: '顺口提一句：低龄孩子更不该过早长时间用耳机，楼主这个「无耳机时段」一举两得。' },
  // seed-27 首份测听报告
  { _id: 'seed-c68', postId: 'seed-27', nickname: '坚持就好', avatar: '', createTime: ago(2), content: '三个月前我第一次测也是这个水平，坚持护耳真的能看到变化，加油。' },
  { _id: 'seed-c69', postId: 'seed-27', nickname: '数据党', avatar: '', createTime: ago(1.8), content: '建议每次测完把数值记下来，看趋势比看单次有用。' },
  { _id: 'seed-c70', postId: 'seed-27', nickname: '听劝的学渣', avatar: '', createTime: ago(1.6), content: '已经建了备忘录记录，下个月复测来对比。' },
  // seed-28 耳机不进卧室
  { _id: 'seed-c71', postId: 'seed-28', nickname: '九零后新手爸爸', avatar: '', createTime: ago(9.5), content: '同款家规执行两个月了，全家耳机统一放门口，睡前那段安静时间真的珍贵。' },
  { _id: 'seed-c72', postId: 'seed-28', nickname: '失眠的阿哲', avatar: '', createTime: ago(9), content: '补充一个反向操作：卧室放一对耳塞，治楼下狗叫。' },
  { _id: 'seed-c73', postId: 'seed-28', nickname: '摘下耳机的人', avatar: '', createTime: ago(8.5), content: '哈哈这个可以有，安静环境睡得也更沉。' },
  // seed-29 开放式助听器后续
  { _id: 'seed-c74', postId: 'seed-29', nickname: '验配师小周', avatar: '', createTime: ago(25), content: '职业相关补充：开放式受话器功率有限，听损重的老人不一定够用，换样式前先做听力评估。' },
  { _id: 'seed-c75', postId: 'seed-29', nickname: '也家有老人', avatar: '', createTime: ago(24), content: '我爸也嫌堵，这条转给我姐，商量下要不要换个样式。' },
  { _id: 'seed-c76', postId: 'seed-29', nickname: '陪爷爷选助听器', avatar: '', createTime: ago(23), content: '对，爷爷是中度听损，验配师评估完才给换的，大家别直接网购。' },
  // seed-30 睡眠耳机
  { _id: 'seed-c77', postId: 'seed-30', nickname: '熬夜冠军', avatar: '', createTime: ago(34), content: '同款用了半年，最大的好处是半夜醒来不用到处摸耳机。' },
  { _id: 'seed-c78', postId: 'seed-30', nickname: '白噪音十级学者', avatar: '', createTime: ago(33), content: '平铺式加定时三十分钟，这个组合我吹了一年，终于有人验证了。' },
  { _id: 'seed-c79', postId: 'seed-30', nickname: '失眠的阿哲', avatar: '', createTime: ago(32), content: '是的，买便宜的就行，我这副两百出头，音质真不重要。' },
  // seed-31 Day 30 汇报
  { _id: 'seed-c80', postId: 'seed-31', nickname: '监督员上线', avatar: '', createTime: ago(0.5), content: '敢直接晒数据就赢了一半！Day 60 评论区对账。' },
  { _id: 'seed-c81', postId: 'seed-31', nickname: '音量50%选手', avatar: '', createTime: ago(0.45), content: '8 小时确实偏多，我日均 3 小时左右，一起加油。' },
  { _id: 'seed-c82', postId: 'seed-31', nickname: '六级听力选手', avatar: '', createTime: ago(0.4), content: '收到！下次直接晒对比图。' },
  // seed-32 通宵赶方案
  { _id: 'seed-c83', postId: 'seed-32', nickname: '枪声听多了', avatar: '', createTime: ago(6.8), content: '「音量不高就没事」就是我以前的原话，时长才是隐形刺客。' },
  { _id: 'seed-c84', postId: 'seed-32', nickname: '耳鼻喉规培生', avatar: '', createTime: ago(6.5), content: '补充：即使音量安全，长时间佩戴的耳道潮湿加精神紧张也会诱发耳鸣，休息比什么都重要。' },
  // seed-33 长辈音量体检
  { _id: 'seed-c85', postId: 'seed-33', nickname: '路人甲', avatar: '', createTime: ago(12.4), content: '请问 iPhone 那个在哪设置？我翻了半天没找到。' },
  { _id: 'seed-c86', postId: 'seed-33', nickname: '陪妈踩坑的儿子', avatar: '', createTime: ago(12), content: '设置－声音与触感－耳机安全－降低高音量，选 60 分贝左右就行。' },
  // seed-34 客服求助
  { _id: 'seed-c87', postId: 'seed-34', nickname: '过来人老陈', avatar: '', createTime: ago(0.9), content: '工间休息有用，我以前也是全天戴，后来每小时摘五分钟，胀痛感少了很多。' },
  { _id: 'seed-c88', postId: 'seed-34', nickname: '擦耳口十年', avatar: '', createTime: ago(0.8), content: '海绵套一个月一换，几十块钱的事别省，起皮大多就是闷出来的。' },
  { _id: 'seed-c89', postId: 'seed-34', nickname: '皮肤科转耳鼻喉的', avatar: '', createTime: ago(0.7), content: '起皮加痒大概率是耳罩材质刺激，先套个透气布套，不行去看一次皮肤科。' },
  // seed-35 降噪不背锅
  { _id: 'seed-c90', postId: 'seed-35', nickname: '较真的工科男', avatar: '', createTime: ago(21), content: '实测数据支持这个结论，我那篇分贝帖里的地铁数据就是降噪前后测的，差了十几 dB。' },
  { _id: 'seed-c91', postId: 'seed-35', nickname: '地铁超标本人', avatar: '', createTime: ago(20), content: '被这两篇帖子按着头认错了，今天通勤把降噪开起来。' },
  { _id: 'seed-c92', postId: 'seed-35', nickname: '音频工程师老王', avatar: '', createTime: ago(19), content: '对，看完那篇来补的作业，图比我说得直观。' },
  // seed-36 Day 9 打卡
  { _id: 'seed-c93', postId: 'seed-36', nickname: '监督员上线', avatar: '', createTime: ago(2.9), content: '打卡天团又添一员，Day 21 评论区对账，都别迟到。' },
  { _id: 'seed-c94', postId: 'seed-36', nickname: 'Day 3 选手', avatar: '', createTime: ago(2.7), content: '参照物这个方法好，明天拉我室友入伙。' },
  // seed-37 奶奶的电视音量
  { _id: 'seed-c95', postId: 'seed-37', nickname: '也家有老人', avatar: '', createTime: ago(4.2), content: '「变化太慢，慢到身边的人都习惯了」，这句太真实了。' },
  { _id: 'seed-c96', postId: 'seed-37', nickname: '陪爷爷选助听器', avatar: '', createTime: ago(4), content: '检查记得挂耳鼻喉科，先测听再决定要不要干预，别急着买机器。' },
  { _id: 'seed-c97', postId: 'seed-37', nickname: '在外打工的孙女', avatar: '', createTime: ago(3.8), content: '嗯，已经跟爸爸说好了，检查完来同步结果。' }
]

// 历史版本出现过的种子 ID 全集（旧版 seed-1 ~ seed-14 / seed-c1 ~ seed-c10）。
// 部署后：不在当前 SEED_POSTS / SEED_COMMENTS 里的旧种子会连同其评论一起被清理。
const LEGACY_SEED_POST_IDS = [
  'seed-1', 'seed-2', 'seed-3', 'seed-4', 'seed-5', 'seed-6',
  'seed-7', 'seed-8', 'seed-9', 'seed-10', 'seed-11', 'seed-12', 'seed-13', 'seed-14'
]
const LEGACY_SEED_COMMENT_IDS = [
  'seed-c1', 'seed-c2', 'seed-c3', 'seed-c4', 'seed-c5',
  'seed-c6', 'seed-c7', 'seed-c8', 'seed-c9', 'seed-c10'
]

// 种子用户档案（tools/seed-avatars.js 依名册生成）：发帖人/评论者按昵称关联 openid 与云端头像，
// 与 ensureSeedData 一起幂等写入 users 集合；排行榜（users.pointsBalance 倒序）因此有真实榜单。
const { SEED_USERS, openidOf, avatarOf } = require('./seedUsers')
// 历史遗留种子用户 ID（当前为空；以后删除角色时把对应 seed-user-* 加进来即可自动清理）
const LEGACY_SEED_USER_IDS = []

// 与 addPost/addComment 同款约定：身份字段以 users 档案为准，不在帖子/评论里手写
const withIdentity = doc => ({ ...doc, openid: openidOf(doc.nickname), avatar: avatarOf(doc.nickname) })

module.exports = {
  SEED_POSTS: SEED_POSTS.map(withIdentity),
  SEED_COMMENTS: SEED_COMMENTS.map(withIdentity),
  SEED_USERS,
  LEGACY_SEED_POST_IDS,
  LEGACY_SEED_COMMENT_IDS,
  LEGACY_SEED_USER_IDS
}
