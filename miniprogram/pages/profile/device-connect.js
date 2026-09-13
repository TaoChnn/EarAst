const DEVICE_STORAGE_KEY = 'hearhealth_demo_device'

const VIEW_COPY = {
  idle: {
    eyebrow: 'HEARHEALTH DEVICE',
    title: '让设备成为健康记录的一部分',
    description: '连接专属硬件后，可自动同步环境噪声、佩戴时长与实时音量。',
    action: '搜索附近设备'
  },
  scanning: {
    eyebrow: '正在搜索',
    title: '正在发现附近设备',
    description: '请让开发板保持开启，并靠近当前手机。',
    action: '正在搜索…'
  },
  found: {
    eyebrow: '发现 1 台设备',
    title: '设备已准备就绪',
    description: '确认设备信息后，即可建立安全连接。',
    action: '连接此设备'
  },
  connecting: {
    eyebrow: '正在连接',
    title: '正在建立安全连接',
    description: '首次连接需要几秒钟，请保持设备在附近。',
    action: '正在连接…'
  },
  connected: {
    eyebrow: '设备在线',
    title: 'HearHealth H1',
    description: '数据连接稳定，健康信息正在持续同步。',
    action: '立即同步'
  }
}

Page({
  data: {
    deviceState: 'idle',
    view: VIEW_COPY.idle,
    lastSync: '刚刚',
    metrics: [
      { id: 'noise', label: '环境噪声', value: '43', unit: 'dB', tone: 'blue' },
      { id: 'duration', label: '今日佩戴', value: '2h 18m', unit: '', tone: 'sky' },
      { id: 'volume', label: '安全音量', value: '92', unit: '%', tone: 'slate' }
    ]
  },

  onLoad() {
    const savedDevice = wx.getStorageSync(DEVICE_STORAGE_KEY) || {}
    if (savedDevice.connected) {
      this.setDeviceState('connected')
    }
  },

  onUnload() {
    this.clearPendingTimer()
  },

  clearPendingTimer() {
    if (this.pendingTimer) {
      clearTimeout(this.pendingTimer)
      this.pendingTimer = null
    }
  },

  setDeviceState(deviceState) {
    this.setData({ deviceState, view: VIEW_COPY[deviceState] })
  },

  onPrimaryAction() {
    const { deviceState } = this.data
    if (deviceState === 'idle') {
      this.startScanning()
      return
    }
    if (deviceState === 'found') {
      this.connectDevice()
      return
    }
    if (deviceState === 'connected') {
      this.syncDevice()
    }
  },

  startScanning() {
    this.clearPendingTimer()
    this.setDeviceState('scanning')
    this.pendingTimer = setTimeout(() => {
      this.pendingTimer = null
      this.setDeviceState('found')
    }, 1800)
  },

  connectDevice() {
    this.clearPendingTimer()
    this.setDeviceState('connecting')
    this.pendingTimer = setTimeout(() => {
      this.pendingTimer = null
      wx.setStorageSync(DEVICE_STORAGE_KEY, {
        connected: true,
        name: 'HearHealth H1',
        model: 'HH-DEV-01'
      })
      this.setDeviceState('connected')
      wx.showToast({ title: '设备连接成功', icon: 'success' })
    }, 1600)
  },

  syncDevice() {
    this.setData({ lastSync: '刚刚' })
    wx.showLoading({ title: '同步中' })
    this.pendingTimer = setTimeout(() => {
      this.pendingTimer = null
      wx.hideLoading()
      wx.showToast({ title: '数据已同步', icon: 'success' })
    }, 700)
  },

  onDisconnect() {
    wx.showModal({
      title: '断开设备连接',
      content: '断开后将暂停同步健康数据，之后可以重新连接。',
      confirmText: '断开连接',
      confirmColor: '#cb6870',
      success: res => {
        if (!res.confirm) return
        this.clearPendingTimer()
        wx.removeStorageSync(DEVICE_STORAGE_KEY)
        this.setDeviceState('idle')
        wx.showToast({ title: '已断开连接', icon: 'none' })
      }
    })
  }
})
