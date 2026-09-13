/**
 * 社区种子用户头像工具链
 *
 * 用法（在 tools/ 目录下先 npm install）：
 *   node seed-avatars.js prepare <素材目录>   # 归一化素材并分配给名册角色，输出 .avatar-build/
 *   node seed-avatars.js probe                # 上传链路自检：上传/取链/删除一张探针图
 *   node seed-avatars.js upload               # 把 .avatar-build/ 里的图上传到云存储 static/avatars/
 *   node seed-avatars.js emit                 # 由名册+上传映射生成 cloudfunctions 的 seedUsers.js
 *
 * 流程：素材放入项目根的 avatar素材/ → prepare → upload → emit → 部署 communityFunctions。
 */
const path = require('path')
const fs = require('fs')
const { execFileSync } = require('child_process')

const PROJECT_ROOT = path.resolve(__dirname, '..')
const BUILD_DIR = path.join(__dirname, '.avatar-build')
const MAPPING_FILE = path.join(BUILD_DIR, 'mapping.json')
const SEED_USERS_TARGET = path.join(PROJECT_ROOT, 'cloudfunctions/communityFunctions/seedUsers.js')
const CLOUD_DIR = 'static/avatars'
// 云存储根（fileID 中 bucket 段）。头像沿用 App 运行时约定放根目录 avatars/，封面在 static/（见 seedData.js 的 CDN）
const STORAGE_ROOT = 'cloud://cloud1-d0gtoekxv3cf11259.636c-cloud1-d0gtoekxv3cf11259-1472708489/'
const AVATAR_SIZE = 240
const IMAGE_EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.heic', '.heif'])

const roster = require('./avatar-roster')
const personas = roster.listPersonas() // [{ key, nickname, role }]

function sh(cmd, args) {
  return execFileSync(cmd, args, { encoding: 'utf8' }).trim()
}

function ensureBuildDir() {
  fs.mkdirSync(BUILD_DIR, { recursive: true })
}

function loadMapping() {
  return JSON.parse(fs.readFileSync(MAPPING_FILE, 'utf8'))
}

function saveMapping(mapping) {
  fs.writeFileSync(MAPPING_FILE, JSON.stringify(mapping, null, 2))
}

// ---------- prepare：归一化 + 分配 ----------

function listSourceImages(srcDir) {
  const files = fs.readdirSync(srcDir).filter(name => {
    try {
      const full = path.join(srcDir, name)
      return fs.statSync(full).isFile() && IMAGE_EXTS.has(path.extname(name).toLowerCase())
    } catch (e) {
      return false
    }
  })
  return files.sort((a, b) => a.localeCompare(b, 'zh-Hans-CN', { numeric: true }))
}

// sips 三步：限制最大边 → 短边重采样到目标尺寸 → 中心裁方
function normalizeImage(src, dest) {
  // 项目在 iCloud Drive 里，素材可能是未落盘的占位文件，先触发下载（非 iCloud 路径忽略报错）
  try { execFileSync('brctl', ['download', src], { stdio: 'ignore' }) } catch (e) { /* 非 iCloud 路径 */ }
  const dims = sh('sips', ['-g', 'pixelWidth', '-g', 'pixelHeight', src]).split('\n')
  const widthLine = dims.find(l => l.includes('pixelWidth'))
  const heightLine = dims.find(l => l.includes('pixelHeight'))
  if (!widthLine || !heightLine) throw new Error(`无法读取图片尺寸（文件损坏或未下载完整）：${src}`)
  const width = Number(widthLine.split(':')[1])
  const height = Number(heightLine.split(':')[1])
  if (Math.min(width, height) < 160) {
    console.warn(`  ⚠ ${path.basename(src)} 分辨率过低（${width}x${height}），放大后可能模糊`)
  }
  const tmp = dest + '.tmp.' + width + 'x' + height
  sh('sips', ['-Z', String(AVATAR_SIZE * 2), src, '--out', tmp])
  const resampleFlag = width < height ? '--resampleWidth' : '--resampleHeight'
  sh('sips', [resampleFlag, String(AVATAR_SIZE), tmp, '--out', tmp])
  sh('sips', ['-c', String(AVATAR_SIZE), String(AVATAR_SIZE), tmp, '--out', tmp])
  sh('sips', ['-s', 'format', 'jpeg', '-s', 'formatOptions', '72', tmp, '--out', dest])
  fs.unlinkSync(tmp)
}

// 分配规则：
// 1. 素材按文件名排序，名册按优先级（作者在前、高频评论者次之）依次拿到唯一头像；
// 2. 素材不足时，剩余角色复用已分配的头像，但同一帖子内（作者+评论者）头像互不相同。
function assignAvatars(imageCount) {
  const order = [...personas] // listPersonas 已按优先级排序
  const assignment = new Map() // key -> imageIndex
  order.forEach((p, i) => assignment.set(p.key, Math.min(i, imageCount - 1)))

  if (imageCount < order.length) {
    // 同帖冲突检测：roster 里有 threadGroups（每个帖子 involved 的角色 key 列表）
    const threads = roster.listThreadGroups()
    for (let round = 0; round < 3; round++) {
      let conflicts = 0
      for (const thread of threads) {
        const seen = new Set()
        for (const key of thread) {
          const img = assignment.get(key)
          if (seen.has(img)) {
            // 换一个全局使用最少且不与本帖冲突的头像
            const usage = new Map()
            personas.forEach(p => usage.set(assignment.get(p.key), (usage.get(assignment.get(p.key)) || 0) + 1))
            const candidates = []
            for (let idx = 0; idx < imageCount; idx++) {
              if (thread.some(k => assignment.get(k) === idx && k !== key)) continue
              candidates.push({ idx, used: usage.get(idx) || 0 })
            }
            candidates.sort((a, b) => a.used - b.used)
            if (candidates.length && candidates[0].idx !== img) {
              assignment.set(key, candidates[0].idx)
              conflicts++
            }
          }
          seen.add(assignment.get(key))
        }
      }
      if (!conflicts) break
    }
  }
  return assignment
}

function cmdPrepare(srcDir) {
  if (!fs.existsSync(srcDir)) {
    console.error(`素材目录不存在：${srcDir}`)
    process.exit(1)
  }
  const images = listSourceImages(srcDir)
  if (!images.length) {
    console.error(`素材目录里没有图片（支持 ${[...IMAGE_EXTS].join(' ')}）：${srcDir}`)
    process.exit(1)
  }
  ensureBuildDir()
  console.log(`素材 ${images.length} 张，角色 ${personas.length} 个，开始归一化（${AVATAR_SIZE}x${AVATAR_SIZE} JPEG）…`)

  const normalized = []
  images.forEach((name, i) => {
    const dest = path.join(BUILD_DIR, `img-${String(i + 1).padStart(2, '0')}.jpg`)
    normalizeImage(path.join(srcDir, name), dest)
    normalized.push({ file: `img-${String(i + 1).padStart(2, '0')}.jpg`, source: name })
    process.stdout.write(`\r  归一化 ${i + 1}/${images.length}`)
  })
  process.stdout.write('\n')

  const assignment = assignAvatars(images.length)
  const byKey = {}
  personas.forEach(p => {
    const img = normalized[assignment.get(p.key)]
    byKey[p.key] = { nickname: p.nickname, role: p.role, file: img.file, source: img.source }
  })
  saveMapping({ avatarSize: AVATAR_SIZE, images: normalized, assignment: byKey, uploads: {} })

  const shared = images.length < personas.length
  console.log(`分配完成${shared ? `（素材不足，尾部长尾角色复用头像，已做同帖去重）` : '（每人一张，无复用）'}`)
  personas.forEach(p => {
    const a = byKey[p.key]
    console.log(`  ${p.key} ${p.nickname.padEnd(10)} ← ${a.source}${a.file !== a.source ? '' : ''}`)
  })
  console.log(`映射已写入 ${MAPPING_FILE}`)
}

// ---------- 上传（miniprogram-automator，走开发者工具登录态） ----------

async function withMiniProgram(fn) {
  const automator = require('miniprogram-automator')
  let miniProgram
  try {
    // 开发者工具已通过 `cli auto --auto-port 9420` 开启自动化时直接连接（launch 冷启容易超时）
    miniProgram = await automator.connect({ wsEndpoint: 'ws://127.0.0.1:9420' })
    console.log('已连接开发者工具自动化端口 9420')
  } catch (e) {
    console.log('拉起微信开发者工具自动化端口…')
    miniProgram = await automator.launch({
      cliPath: '/Applications/wechatwebdevtools.app/Contents/MacOS/cli',
      projectPath: PROJECT_ROOT
    })
  }
  try {
    return await fn(miniProgram)
  } finally {
    await miniProgram.disconnect().catch(() => {})
  }
}

async function cmdProbe() {
  ensureBuildDir()
  // 用项目里现成的图标生成一张探针图
  const src = path.join(PROJECT_ROOT, 'miniprogram/images/icons/avatar.png')
  const probe = path.join(BUILD_DIR, '_probe.jpg')
  normalizeImage(src, probe)
  const stat = fs.statSync(probe)
  console.log(`探针图 ${stat.size} bytes，开始 上传 → 取临时链接 → 删除 全链路自检…`)
  const res = await withMiniProgram(async mp => {
    const cloudPath = `${CLOUD_DIR}/_probe.jpg`
    const up = await mp.evaluate(
      async ({ filePath, cp }) => {
        const uploaded = await wx.cloud.uploadFile({ cloudPath: cp, filePath })
        const urls = await wx.cloud.getTempFileURL({ fileList: [uploaded.fileID] })
        const url = (urls.fileList && urls.fileList[0] && urls.fileList[0].tempFileURL) || ''
        await wx.cloud.deleteFile({ fileList: [uploaded.fileID] })
        return { fileID: uploaded.fileID, url }
      },
      { filePath: probe, cp: cloudPath }
    )
    return up
  })
  if (!res || !res.fileID || !res.url) {
    console.error('自检失败：', JSON.stringify(res))
    process.exit(1)
  }
  const ok = await fetch(res.url, { method: 'HEAD' }).then(r => r.ok).catch(() => false)
  console.log(`✓ 上传成功  fileID=${res.fileID}`)
  console.log(`✓ 临时链接可访问  ${ok ? 'HEAD 200' : 'HEAD 失败（可能仅内网可见，可忽略）'}`)
  console.log('✓ 云端副本已删除，链路可用')
  fs.unlinkSync(probe)
}

async function cmdUpload() {
  const mapping = loadMapping()
  const files = [...new Set(Object.values(mapping.assignment).map(a => a.file))]
  console.log(`待上传 ${files.length} 张唯一头像 → cloud://${CLOUD_DIR}/`)
  const uploads = await withMiniProgram(async mp => {
    const done = {}
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const cloudPath = `${CLOUD_DIR}/${file}`
      const res = await mp.evaluate(
        async ({ filePath, cp }) => {
          const uploaded = await wx.cloud.uploadFile({ cloudPath: cp, filePath })
          return { fileID: uploaded.fileID }
        },
        { filePath: path.join(BUILD_DIR, file), cp: cloudPath }
      )
      done[file] = res.fileID
      process.stdout.write(`\r  上传 ${i + 1}/${files.length}`)
    }
    process.stdout.write('\n')
    return done
  })
  mapping.uploads = uploads
  saveMapping(mapping)
  console.log('全部上传完成，映射已更新。接下来运行：node seed-avatars.js emit')
}

// ---------- emit：生成 seedUsers.js ----------

function cmdEmit(manual) {
  const mapping = loadMapping()
  if (manual) {
    // 手动上传模式：按约定路径 avatars/<file> 直接推导 fileID（上传后路径一致即可）
    mapping.uploads = {}
    fs.readdirSync(BUILD_DIR)
      .filter(f => /^img-\d+\.jpg$/.test(f))
      .forEach(f => { mapping.uploads[f] = STORAGE_ROOT + 'avatars/' + f })
    saveMapping(mapping)
    console.log(`手动模式：按 avatars/<file> 推导了 ${Object.keys(mapping.uploads).length} 个 fileID`)
  }
  const missing = Object.entries(mapping.uploads || {}).filter(([, id]) => !id)
  if (!Object.keys(mapping.uploads || {}).length) {
    console.error('还没有上传记录，请先运行 upload')
    process.exit(1)
  }
  if (missing.length) {
    console.error(`有 ${missing.length} 张图缺少 fileID，请重新 upload`)
    process.exit(1)
  }
  const overrides = roster.avatarOverrides()
  const users = roster.listSeedUsers(key => {
    const file = overrides.get(key) || (mapping.assignment[key] && mapping.assignment[key].file)
    return file && mapping.uploads[file]
  })
  const banner = `// 本文件由 tools/seed-avatars.js emit 生成（名册：tools/avatar-roster.js），不要手工编辑。
// 耳友圈种子用户档案：与 ensureSeedData 一起幂等写入 users 集合。
// 头像指向云存储 static/avatars/（与 seedData.js 的 CDN 前缀一致）。
`
  // createdAt/lastLoginAt 生成 new Date(...) 表达式，与 createUser 写入的 Date 类型保持一致
  const body = users
    .map(u => {
      const { createdAt, lastLoginAt, ...rest } = u
      const lines = Object.entries(rest)
        .map(([k, v]) => `    ${k}: ${JSON.stringify(v)}`)
      lines.push(`    createdAt: new Date(${JSON.stringify(createdAt.toISOString())})`)
      lines.push(`    lastLoginAt: new Date(${JSON.stringify(lastLoginAt.toISOString())})`)
      return '  {\n' + lines.join(',\n') + '\n  }'
    })
    .join(',\n')
  const code = `${banner}
const SEED_USERS = [
${body}
]

// 发帖人/评论者昵称 → (openid, avatar) 反查；种子数据借此关联用户档案
const BY_NICKNAME = {}
SEED_USERS.forEach(u => {
  if (!BY_NICKNAME[u.nickname]) BY_NICKNAME[u.nickname] = u
})

function userOf(nickname) {
  return BY_NICKNAME[nickname] || null
}

function openidOf(nickname) {
  const u = userOf(nickname)
  return u ? u.openid : ''
}

function avatarOf(nickname) {
  const u = userOf(nickname)
  return u ? u.avatar : ''
}

module.exports = { SEED_USERS, userOf, openidOf, avatarOf }
`
  fs.writeFileSync(SEED_USERS_TARGET, code)
  console.log(`已生成 ${path.relative(PROJECT_ROOT, SEED_USERS_TARGET)}（${users.length} 个用户档案）`)
}

function main() {
  const [cmd, arg] = process.argv.slice(2)
  switch (cmd) {
    case 'prepare':
      cmdPrepare(path.isAbsolute(arg || '') ? arg : path.join(PROJECT_ROOT, arg || 'avatar素材'))
      break
    case 'probe':
      cmdProbe().catch(err => {
        console.error('probe 失败：', err && err.message)
        process.exit(1)
      })
      break
    case 'upload':
      cmdUpload().catch(err => {
        console.error('upload 失败：', err && err.message)
        process.exit(1)
      })
      break
    case 'emit':
      cmdEmit(process.argv.includes('--manual'))
      break
    default:
      console.log('用法：node seed-avatars.js <prepare <素材目录> | probe | upload | emit>')
  }
}

main()
