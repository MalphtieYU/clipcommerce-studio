export type MetricDefinition = {
  id: string
  name: string
  abbreviation?: string
  category: string
  channels: string
  source: string
  formula: string
  meaning: string
  howToRead: string
  direction: string
  caution: string
}

const commonSource = '渠道后台导出或人工确认后的导入表'
const crossChannel = '跨渠道通用；需核对各平台口径'

export const metricGlossary: MetricDefinition[] = [
  { id: 'impressions', name: '展现量', category: '流量', channels: crossChannel, source: commonSource, formula: '平台返回的展现次数', meaning: '素材被展示给用户的次数。', howToRead: '先看是否有足够展现，再判断点击、转化等后续指标。', direction: '通常更多代表获得更多曝光，但不等于有效流量。', caution: '同一用户多次看到通常会重复计数；不要和覆盖人数混用。' },
  { id: 'reach', name: '覆盖人数', category: '流量', channels: '部分内容/广告平台提供', source: commonSource, formula: '平台去重后的触达用户数', meaning: '至少看过素材一次的独立用户数量。', howToRead: '结合展现量看频次：展现量 ÷ 覆盖人数。', direction: '更高通常表示触达更多人。', caution: '去重规则由平台决定，不同渠道不可直接相加比较。' },
  { id: 'frequency', name: '平均频次', category: '流量', channels: '提供覆盖人数的平台', source: commonSource, formula: '展现量 ÷ 覆盖人数', meaning: '平均每个被触达用户看到了几次。', howToRead: '配合 CTR、转化看；频次升高但效果下降，可能是重复触达疲劳。', direction: '没有越高越好或越低越好的固定结论。', caution: '仅在相同受众、相同周期下比较才有意义。' },
  { id: 'video_views', name: '播放量', category: '视频观看', channels: '短视频/直播内容平台', source: commonSource, formula: '达到平台播放判定的次数', meaning: '视频被平台计为一次播放的次数。', howToRead: '先确认该平台“播放”的最低观看门槛，再结合完播率和平均观看时长。', direction: '更高代表更多播放机会。', caution: '各平台的播放判定不同，不能直接横向比较。' },
  { id: 'three_second_view_rate', name: '3 秒观看率', category: '视频观看', channels: '支持短视频观看分层的平台', source: commonSource, formula: '观看至少 3 秒次数 ÷ 播放量 × 100%', meaning: '开头是否让用户停下来继续看。', howToRead: '用于检查前 3 秒的钩子、封面和开场信息。', direction: '通常更高更好。', caution: '要同时看后续留存；高 3 秒观看率不代表最终转化好。' },
  { id: 'avg_watch_time', name: '平均观看时长', category: '视频观看', channels: '短视频/直播内容平台', source: commonSource, formula: '总观看时长 ÷ 播放次数', meaning: '一次播放平均看了多久。', howToRead: '与素材总时长一起看；同一时长、同一渠道的素材更适合对比。', direction: '通常更长表示内容更能留住人。', caution: '不同视频时长不能只比绝对秒数。' },
  { id: 'completion_rate', name: '完播率', category: '视频观看', channels: '短视频/直播内容平台', source: commonSource, formula: '看完或达到平台完播门槛次数 ÷ 播放量 × 100%', meaning: '用户是否愿意看到视频结尾。', howToRead: '用于评估叙事节奏、信息密度和结尾 CTA 是否被看见。', direction: '通常更高更好。', caution: '短视频天然更容易高完播，需按时长分组比较。' },
  { id: 'like_rate', name: '点赞率', category: '互动', channels: '内容平台', source: commonSource, formula: '点赞量 ÷ 播放量或展现量 × 100%', meaning: '用户对内容表达正向反馈的比例。', howToRead: '用于观察内容共鸣，不能替代成交指标。', direction: '通常更高更好。', caution: '分母必须固定；有的平台按播放量，有的平台按展现量。' },
  { id: 'comment_rate', name: '评论率', category: '互动', channels: '内容平台', source: commonSource, formula: '评论量 ÷ 播放量或展现量 × 100%', meaning: '素材引发讨论的比例。', howToRead: '看评论内容是咨询、赞许还是负面反馈。', direction: '数量本身不是唯一目标。', caution: '争议内容可能有高评论率但不利于品牌或转化。' },
  { id: 'share_rate', name: '分享率', category: '互动', channels: '内容平台', source: commonSource, formula: '分享量 ÷ 播放量或展现量 × 100%', meaning: '用户主动转发内容的比例。', howToRead: '较适合判断内容是否有实用性、共鸣或社交传播性。', direction: '通常更高更好。', caution: '仍需核对分享带来的流量质量和后续转化。' },
  { id: 'save_rate', name: '收藏率', category: '互动', channels: '支持收藏的平台', source: commonSource, formula: '收藏量 ÷ 播放量或展现量 × 100%', meaning: '用户希望稍后回看内容的比例。', howToRead: '常用于判断教程、清单、经验类内容的长期价值。', direction: '通常更高更好。', caution: '收藏不等于购买，需和商品点击、支付结合判断。' },
  { id: 'engagement_rate', name: '互动率', abbreviation: 'ER', category: '互动', channels: crossChannel, source: commonSource, formula: '（点赞 + 评论 + 分享 + 收藏）÷ 播放量或展现量 × 100%', meaning: '内容带来互动的总体比例。', howToRead: '先明确分母，再比较同渠道、同目标素材。', direction: '通常更高更好。', caution: '各平台纳入的互动项不同，必须在导入时确认。' },
  { id: 'clicks', name: '点击量', category: '点击与引流', channels: '广告/电商渠道', source: commonSource, formula: '平台记录的链接、商品或组件点击次数', meaning: '用户从素材进一步进入商品或落地页的次数。', howToRead: '与展现量一起看 CTR；与支付订单一起看 CVR。', direction: '通常更多更好，但需结合成本。', caution: '点击口径可能包含商品卡、落地页或店铺入口。' },
  { id: 'ctr', name: '点击率', abbreviation: 'CTR', category: '点击与引流', channels: crossChannel, source: commonSource, formula: '点击量 ÷ 展现量 × 100%', meaning: '看到素材的人中，有多少人愿意点击进入下一步。', howToRead: '同渠道、同人群、同投放位置下，CTR 更高通常说明素材更能促成点击。', direction: '通常更高更好。', caution: 'CTR 高不等于成交好；若 CVR 低，要继续检查商品页、价格和人群匹配。' },
  { id: 'product_click_rate', name: '商品点击率', category: '点击与引流', channels: '电商内容/广告渠道', source: commonSource, formula: '商品点击量 ÷ 内容播放量或展现量 × 100%', meaning: '用户从内容进入商品详情的比例。', howToRead: '用于判断内容与商品卖点、商品卡位置是否匹配。', direction: '通常更高更好。', caution: '应明确分母是播放量还是展现量。' },
  { id: 'add_to_cart_rate', name: '加购率', category: '转化', channels: '电商渠道', source: commonSource, formula: '加购人数或次数 ÷ 商品访客或点击量 × 100%', meaning: '进入商品后愿意加入购物车的比例。', howToRead: '适合排查商品页兴趣；高加购低支付常提示价格、库存或结算阻力。', direction: '通常更高更好。', caution: '需确认按人数还是次数计算，以及分母口径。' },
  { id: 'cvr', name: '转化率', abbreviation: 'CVR', category: '转化', channels: crossChannel, source: commonSource, formula: '目标完成次数 ÷ 点击量或访客数 × 100%', meaning: '进入下一步的人中，完成目标动作的比例；目标可能是下单、支付、留资等。', howToRead: '先写清楚“转化”指什么，再与同一目标、同一分母的数据比较。', direction: '通常更高更好。', caution: 'CVR 没有统一公式，未确认目标和分母前不能和其他报表直接比。' },
  { id: 'paid_conversion_rate', name: '支付转化率', category: '转化', channels: '电商渠道', source: commonSource, formula: '支付订单数 ÷ 点击量或商品访客数 × 100%', meaning: '有多少进入商品的人最终完成支付。', howToRead: '配合 CTR 判断问题在引流端还是商品/价格/结算端。', direction: '通常更高更好。', caution: '务必确认分母是点击、访客还是下单用户。' },
  { id: 'order_count', name: '下单订单数', category: '交易', channels: '电商渠道', source: commonSource, formula: '提交订单的数量', meaning: '用户已下单但不一定已付款的订单数。', howToRead: '与支付订单数对照，可发现未支付流失。', direction: '通常更多更好。', caution: '取消、退款、拆单规则会影响数值。' },
  { id: 'paid_order_count', name: '支付订单数', category: '交易', channels: '电商渠道', source: commonSource, formula: '支付成功的订单数量', meaning: '实际完成支付的订单数。', howToRead: '用于计算支付转化率、客单价和支付 ROI。', direction: '通常更多更好。', caution: '要明确是否包含退款前订单、预售或部分支付。' },
  { id: 'gmv', name: '成交金额', abbreviation: 'GMV', category: '交易', channels: '电商渠道', source: commonSource, formula: '平台定义的成交订单金额总和', meaning: '在统计口径内形成的交易金额。', howToRead: '需同时看订单、退款、消耗和统计周期，不能单独判断盈利。', direction: '通常更高更好。', caution: 'GMV 可能是下单、支付或含退款前金额，必须确认平台字段。' },
  { id: 'net_gmv', name: '净成交金额', category: '交易', channels: '电商渠道', source: commonSource, formula: '成交金额 − 已确认退款/取消金额（以内部口径为准）', meaning: '扣除退款或取消后更接近实际保留的成交金额。', howToRead: '与成交金额并看，观察售后和退款对结果的影响。', direction: '通常更高更好。', caution: '退款归因和时间滞后需要内部统一规则。' },
  { id: 'aov', name: '客单价', abbreviation: 'AOV', category: '交易', channels: '电商渠道', source: commonSource, formula: '支付金额 ÷ 支付订单数', meaning: '每笔支付订单平均贡献的金额。', howToRead: '与支付订单数一起看，判断增长来自更多订单还是更高单笔金额。', direction: '通常更高更好，但要结合利润和退货。', caution: '赠品、套装、折扣会改变客单价。' },
  { id: 'spend', name: '消耗', category: '投放成本', channels: '广告投放渠道', source: commonSource, formula: '广告账户在统计周期内的实际消耗', meaning: '为获取曝光、点击或成交投入的广告费用。', howToRead: '必须与展现、点击、支付和 ROI 放在同一时间范围内看。', direction: '没有越低越好；成本下降但规模或质量下降也可能是坏事。', caution: '确认是否含税、返点、服务费和跨天归因。' },
  { id: 'cpm', name: '千次展现成本', abbreviation: 'CPM', category: '投放成本', channels: '广告投放渠道', source: commonSource, formula: '消耗 ÷ 展现量 × 1,000', meaning: '获得一千次展现平均花多少钱。', howToRead: '用于看流量采购成本，和 CTR、CVR 一起判断是否值得。', direction: '在质量和规模相近时通常更低更好。', caution: '低 CPM 可能来自低质量流量或不同人群。' },
  { id: 'cpc', name: '单次点击成本', abbreviation: 'CPC', category: '投放成本', channels: '广告投放渠道', source: commonSource, formula: '消耗 ÷ 点击量', meaning: '获得一次点击平均花的钱。', howToRead: '与 CTR、支付转化率一起看，判断素材带来的点击是否有效。', direction: '在质量和规模相近时通常更低更好。', caution: '点击便宜不等于成交便宜。' },
  { id: 'cpa', name: '单次转化成本', abbreviation: 'CPA', category: '投放成本', channels: '广告投放渠道', source: commonSource, formula: '消耗 ÷ 目标转化次数', meaning: '获得一次已定义转化平均花的钱。', howToRead: '先确认转化事件是留资、下单还是支付，再与目标成本比较。', direction: '在目标质量相同的前提下通常更低更好。', caution: '不同转化事件不能直接比较 CPA。' },
  { id: 'paid_roi', name: '支付 ROI', category: '投放回报', channels: '电商广告渠道', source: commonSource, formula: '支付成交金额 ÷ 消耗', meaning: '每投入 1 元广告消耗，对应带来多少支付成交金额。', howToRead: '同一归因窗口、同一统计周期内，数值越高通常回报越好。', direction: '通常更高更好。', caution: '它不是利润率；应结合毛利、退款、平台费和归因规则判断。' },
  { id: 'net_roi', name: '净成交 ROI', category: '投放回报', channels: '电商广告渠道', source: commonSource, formula: '净成交金额 ÷ 消耗', meaning: '扣除确认退款/取消后，每 1 元消耗带来的净成交金额。', howToRead: '适合与支付 ROI 对照，观察售后对投放结果的影响。', direction: '通常更高更好。', caution: '净成交的退款窗口和归因规则必须先统一。' },
  { id: 'roas', name: '广告回报率', abbreviation: 'ROAS', category: '投放回报', channels: '广告投放渠道', source: commonSource, formula: '广告归因收入 ÷ 广告消耗', meaning: '广告平台口径下的收入回报比。', howToRead: '确认“收入”字段后再使用；有些平台与支付 ROI 是同义，有些并不完全相同。', direction: '通常更高更好。', caution: '不要自动把 ROAS、ROI、支付 ROI、净成交 ROI 当成同一个指标。' },
  { id: 'refund_rate', name: '退款率', category: '售后质量', channels: '电商渠道', source: commonSource, formula: '退款订单数或退款金额 ÷ 支付订单数或支付金额 × 100%', meaning: '成交后发生退款的比例。', howToRead: '与素材承诺、商品描述、履约和售后原因一起复盘。', direction: '通常更低更好。', caution: '必须标明按订单还是按金额，以及退款观察窗口。' },
]
