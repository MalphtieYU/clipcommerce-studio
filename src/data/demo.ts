export type Channel = '抖音' | '天猫' | '京东'
export type AssetStatus = '投流中' | '数据观察中' | '待优化' | '可复刻' | '数据不足'

export const channels: Channel[] = ['抖音', '天猫', '京东']

export const products = [
  { id: 'demo-product-a', name: '演示产品 A', status: '待内部确认', source: '演示数据', claims: ['已确认卖点：暂无', '待确认表达：资料待补充', '禁止使用：待补充'] },
  { id: 'demo-product-b', name: '演示产品 B', status: '待补充', source: '演示数据', claims: ['已确认卖点：暂无', '待确认表达：待核验', '禁止使用：待补充'] },
]

export const goals = [
  { id: 'goal-1', name: '短视频总 GMV', category: 'GMV', period: '本月', progress: null, gap: null, status: '待确认', owner: '待补充', source: '演示数据' },
  { id: 'goal-2', name: '素材产量', category: '素材产量', period: '本月', progress: 0.56, gap: null, status: '观察中', owner: '待补充', source: '演示数据' },
  { id: 'goal-3', name: '拍摄次数', category: '拍摄', period: '本月', progress: 0.4, gap: null, status: '需关注', owner: '待补充', source: '演示数据' },
  { id: 'goal-4', name: '新素材 GMV', category: 'GMV', period: '本月', progress: null, gap: null, status: '数据不足', owner: '待补充', source: '演示数据' },
]

export const assets = Array.from({ length: 20 }, (_, index) => {
  const n = String(index + 1).padStart(3, '0')
  const statuses: AssetStatus[] = ['投流中', '数据观察中', '待优化', '可复刻', '数据不足']
  return {
    id: `asset-${n}`,
    code: `SF-DEMO-${n}`,
    name: `匿名素材 ${n}`,
    product: index % 2 ? '演示产品 B' : '演示产品 A',
    channel: channels[index % 3],
    duration: 18 + (index % 5) * 7,
    status: statuses[index % statuses.length],
    tag: index % 3 === 0 ? '新素材' : index % 3 === 1 ? '旧素材迭代' : '待复盘',
    version: `V0${(index % 3) + 1}`,
    source: '演示数据',
    dataPeriod: '演示周期',
    metricStatus: index % 5 === 4 ? '数据不足' : '待确认',
  }
})

export const analysisSeries = [18, 25, 23, 39, 48, 42, 51, 40, 36, 44, 31, 29, 23, 26, 18, 14, 22, 17]

export const contentSegments = [
  { label: '开头', type: 'hook', start: 0, end: 3, tone: 'blue' },
  { label: '痛点', type: 'pain-point', start: 3, end: 7, tone: 'cyan' },
  { label: '场景', type: 'scenario', start: 7, end: 11, tone: 'violet' },
  { label: '产品出现', type: 'product-introduction', start: 11, end: 14, tone: 'green' },
  { label: 'CTA', type: 'cta', start: 14, end: 18, tone: 'orange' },
]

export const reportSections = ['目标完成情况', '素材生产', '渠道经营', '内容行为', '素材案例', '版本迭代', '下周动作']

export const metricDefinitions = [
  { name: 'GMV', channel: '全部渠道', status: '待确认', source: '演示数据', note: '口径、时间范围与流量范围待内部确认' },
  { name: '支付 ROI', channel: '全部渠道', status: '待确认', source: '演示数据', note: '不可跨未确认口径直接比较' },
  { name: 'CTR', channel: '全部渠道', status: '待确认', source: '演示数据', note: '原始字段映射待导入时确认' },
]
