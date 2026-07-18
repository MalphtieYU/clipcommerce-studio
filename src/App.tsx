import { useCallback, useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react'
import {
  Archive, BarChart3, BookOpen, CheckCircle2, ChevronRight, ClipboardCheck, Database,
  FileUp, Grid2X2, LayoutDashboard, LineChart, List,
  LoaderCircle, Pencil, Play, Plus, RefreshCcw, Search, Settings2, ShieldAlert,
  Sparkles, TableProperties, TriangleAlert, X,
} from 'lucide-react'
import { EmptyState, EvidenceBadge, Metric, Notice, StatusBadge } from './components/ui'
import { localApi } from './lib/api'
import { parseLocalImportFile, type ParsedLocalFile } from './lib/fileParser'
import type { Asset, Channel, Goal, ImportBatch, ImportIssue, Product } from './types'
import './App.css'

type Page = 'data-overview' | 'import' | 'creative-analysis' | 'comparison' | 'weekly-review' | 'benchmark' | 'metrics' | 'reports' | 'dashboard' | 'goals' | 'products' | 'assets' | 'analysis' | 'review' | 'report' | 'asset-detail' | 'asset-admin'
type AppData = { products: Product[]; assets: Asset[]; goals: Goal[]; channels: Channel[]; imports: ImportBatch[] }

const nav: { id: Page; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'data-overview', label: '数据总览', icon: LayoutDashboard },
  { id: 'import', label: '数据导入', icon: FileUp },
  { id: 'creative-analysis', label: '单条素材分析', icon: LineChart },
  { id: 'comparison', label: '素材对比', icon: BarChart3 },
  { id: 'weekly-review', label: '周度复盘', icon: ClipboardCheck },
  { id: 'benchmark', label: '竞品对标', icon: BookOpen },
  { id: 'metrics', label: '指标词典', icon: Settings2 },
  { id: 'reports', label: '历史报告', icon: Archive },
]
const legacyPages = new Set<Page>(['dashboard', 'goals', 'products', 'assets', 'analysis', 'review', 'report', 'asset-detail', 'asset-admin'])
const emptyData: AppData = { products: [], assets: [], goals: [], channels: [], imports: [] }
const reportSections = ['目标完成情况', '素材生产', '渠道经营', '内容行为', '素材案例', '版本迭代', '下周动作']
const contentSegments = [
  { label: '开头', start: 0, end: 3, tone: 'blue' },
  { label: '痛点', start: 3, end: 7, tone: 'cyan' },
  { label: '场景', start: 7, end: 11, tone: 'violet' },
  { label: '产品出现', start: 11, end: 14, tone: 'green' },
  { label: 'CTA', start: 14, end: 18, tone: 'orange' },
]

function routeFromHash() {
  const raw = window.location.hash.replace(/^#/, '')
  const [rawPage = 'data-overview', id] = raw.split('/')
  const page = rawPage === 'dashboard' ? 'data-overview' : rawPage
  return { page: nav.some((item) => item.id === page) || legacyPages.has(page as Page) ? page as Page : 'data-overview', id }
}

function App() {
  const initialRoute = routeFromHash()
  const [page, setPage] = useState<Page>(initialRoute.page)
  const [selectedAssetId, setSelectedAssetId] = useState(initialRoute.id || '')
  const [data, setData] = useState<AppData>(emptyData)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [toast, setToast] = useState<string | null>(null)
  const [productEditor, setProductEditor] = useState<Product | null | undefined>(undefined)
  const [assetEditor, setAssetEditor] = useState<Asset | null | undefined>(undefined)
  const [goalEditor, setGoalEditor] = useState<Goal | null | undefined>(undefined)

  const reload = useCallback(async () => {
    setLoadError(null)
    try {
      const [products, assets, goals, channels, imports] = await Promise.all([
        localApi.products.list(),
        localApi.assets.list(),
        localApi.goals.list(),
        localApi.channels(),
        localApi.imports.list(),
      ])
      setData({ products, assets, goals, channels, imports })
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : '无法连接本地数据服务')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void reload() }, [reload])
  useEffect(() => {
    const onHashChange = () => {
      const route = routeFromHash()
      setPage(route.page)
      setSelectedAssetId(route.id || '')
    }
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])
  useEffect(() => {
    if (!toast) return
    const timeout = window.setTimeout(() => setToast(null), 3000)
    return () => window.clearTimeout(timeout)
  }, [toast])

  const navigate = (nextPage: Page, id?: string) => {
    window.location.hash = `${nextPage}${id ? `/${id}` : ''}`
  }
  const selectedAsset = data.assets.find((asset) => asset.id === selectedAssetId) || data.assets[0]
  const filteredAssets = useMemo(() => {
    const term = query.trim().toLowerCase()
    if (!term) return data.assets
    return data.assets.filter((asset) => [
      asset.displayName, asset.assetCode, asset.product?.name,
      asset.channels.map(({ channel }) => channel.name).join(' '),
      asset.tags.join(' '),
    ].join(' ').toLowerCase().includes(term))
  }, [data.assets, query])

  const saveProduct = async (payload: unknown) => {
    if (productEditor) await localApi.products.update(productEditor.id, payload)
    else await localApi.products.create(payload)
    setProductEditor(undefined)
    setToast(productEditor ? '产品已更新并写入 SQLite' : '产品已创建并写入 SQLite')
    await reload()
  }
  const saveAsset = async (payload: unknown) => {
    if (assetEditor) await localApi.assets.update(assetEditor.id, payload)
    else await localApi.assets.create(payload)
    setAssetEditor(undefined)
    setToast(assetEditor ? '素材已更新并写入 SQLite' : '素材已创建并写入 SQLite')
    await reload()
  }
  const saveGoal = async (payload: unknown) => {
    if (goalEditor) await localApi.goals.update(goalEditor.id, payload)
    else await localApi.goals.create(payload)
    setGoalEditor(undefined)
    setToast(goalEditor ? '目标已更新并写入 SQLite' : '目标已创建并写入 SQLite')
    await reload()
  }

  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand"><Sparkles size={20} /><span>SleepFlow Studio</span><small>渠道素材数据分析与复盘工作台</small></div>
      <div className="demo-flag">匿名演示 seed · 本地 SQLite</div>
      <nav>{nav.map(({ id, label, icon: Icon }) => <button key={id} className={page === id ? 'active' : ''} onClick={() => navigate(id)}><Icon size={18} />{label}</button>)}</nav>
      <div className="sidebar-foot"><ShieldAlert size={16} />不连接渠道后台</div>
    </aside>
    <main>
      <header className="toolbar">
        <label><Search size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索素材、渠道或数据来源" /></label>
        <div className="toolbar-meta"><EvidenceBadge source="本地 SQLite" status="匿名演示" /><StatusBadge status={loadError ? '连接异常' : '本地运行'} /></div>
      </header>
      <section className="workarea">
        {loading ? <LoadingState /> : loadError ? <ErrorState message={loadError} retry={reload} /> : <>
          {page === 'data-overview' && <DataOverview data={data} navigate={navigate} />}
          {page === 'goals' && <Goals rows={data.goals} edit={setGoalEditor} refresh={reload} notify={setToast} />}
          {page === 'products' && <Products rows={data.products} edit={setProductEditor} refresh={reload} notify={setToast} />}
          {page === 'assets' && <Assets rows={filteredAssets} channels={data.channels} navigate={navigate} edit={setAssetEditor} />}
          {page === 'import' && <ImportCenter batches={data.imports} refresh={reload} notify={setToast} />}
          {page === 'creative-analysis' && <CreativeAnalysis assets={filteredAssets} navigate={navigate} />}
          {(page === 'comparison' || page === 'analysis') && <Analysis assets={data.assets} channels={data.channels} navigate={navigate} />}
          {page === 'review' && <Review assets={data.assets} />}
          {(page === 'weekly-review' || page === 'report') && <WeeklyReport />}
          {page === 'benchmark' && <Benchmark navigate={navigate} />}
          {page === 'metrics' && <Metrics />}
          {page === 'reports' && <HistoryReports navigate={navigate} />}
          {(page === 'asset-detail' || page === 'asset-admin') && selectedAsset && <AssetDetail asset={selectedAsset} edit={() => setAssetEditor(selectedAsset)} refresh={reload} notify={setToast} />}
        </>}
      </section>
    </main>
    {productEditor !== undefined && <ProductForm product={productEditor} close={() => setProductEditor(undefined)} save={saveProduct} />}
    {assetEditor !== undefined && <AssetForm asset={assetEditor} products={data.products} channels={data.channels} close={() => setAssetEditor(undefined)} save={saveAsset} />}
    {goalEditor !== undefined && <GoalForm goal={goalEditor} products={data.products} channels={data.channels} close={() => setGoalEditor(undefined)} save={saveGoal} />}
    {toast && <div className="toast" role="status"><CheckCircle2 size={18} />{toast}</div>}
  </div>
}

const PageHeader = ({ title, subtitle, actions }: { title: string; subtitle: string; actions?: ReactNode }) =>
  <div className="page-head"><div><h1>{title}</h1><p>{subtitle}</p></div>{actions && <div className="page-actions">{actions}</div>}</div>

function LoadingState() {
  return <div className="loading-state"><LoaderCircle className="spin" size={30} /><h1>正在连接本地工作站</h1><p>读取 SQLite 中的匿名演示 seed。</p><div className="skeleton-grid">{Array.from({ length: 6 }, (_, index) => <i key={index} />)}</div></div>
}

function ErrorState({ message, retry }: { message: string; retry: () => Promise<void> }) {
  return <div className="error-state"><TriangleAlert size={32} /><h1>本地数据服务未连接</h1><p>{message}</p><button className="primary" onClick={() => void retry()}><RefreshCcw size={17} />重新连接</button></div>
}

function DataOverview({ data, navigate }: { data: AppData; navigate: (page: Page, id?: string) => void }) {
  const [channel, setChannel] = useState('全部渠道')
  const [product, setProduct] = useState('全部产品')
  const filtered = data.assets.filter((asset) => (channel === '全部渠道' || asset.channels.some((item) => item.channel.name === channel)) && (product === '全部产品' || asset.product?.name === product))
  const withSnapshot = filtered.filter((asset) => asset.snapshots.length > 0)
  const incomplete = filtered.filter((asset) => asset.snapshots.length === 0)
  return <>
    <PageHeader title="数据总览" subtitle="先把数据交给系统，再基于已导入的来源、周期与口径进行分析。当前所有内容均为匿名演示数据。" actions={<>
      <button className="primary" onClick={() => navigate('import')}><FileUp size={17} />导入表格或数据</button>
      <button className="outline" onClick={() => navigate('creative-analysis')}><LineChart size={17} />开始单条分析</button>
      <button className="outline" onClick={() => navigate('weekly-review')}><ClipboardCheck size={17} />创建周度复盘</button>
    </>} />
    <div className="filter-bar">
      <label>当前分析周期<select defaultValue="本周"><option>本周</option><option>本月</option><option disabled>自定义（尚未接入）</option></select></label>
      <label>渠道<select value={channel} onChange={(event) => setChannel(event.target.value)}><option>全部渠道</option>{data.channels.map((item) => <option key={item.id}>{item.name}</option>)}</select></label>
      <label>产品<select value={product} onChange={(event) => setProduct(event.target.value)}><option>全部产品</option>{data.products.map((item) => <option key={item.id}>{item.name}</option>)}</select></label>
      <span><Database size={15} />来源：匿名演示 seed · 数据完整度待确认</span>
    </div>
    <div className="metric-grid">
      <Metric label="素材数量" value={String(filtered.length).padStart(2, '0')} tone="cyan" />
      <Metric label="已有有效数据的素材" value={String(withSnapshot.length).padStart(2, '0')} tone="green" />
      <Metric label="数据不足素材" value={String(incomplete.length).padStart(2, '0')} tone="orange" />
      <Metric label="导入批次" value={String(data.imports.length).padStart(2, '0')} tone="blue" />
    </div>
    <div className="dashboard-grid">
      <section className="panel"><div className="section-head"><h2>从数据开始</h2><small>不需要先建立产品或素材档案</small></div>
        {[
          ['导入表格并确认字段映射', () => navigate('import')],
          ['选择一条已有素材，查看数据与逐秒曲线', () => navigate('creative-analysis')],
          ['查看指标含义、公式与当前口径状态', () => navigate('metrics')],
        ].map(([label, action], index) => <button className="task" key={String(label)} onClick={action as () => void}><b>0{index + 1}</b><span>{String(label)}</span><ChevronRight size={17} /></button>)}
      </section>
      <section className="panel media-rail"><div className="section-head"><h2>本周素材分布</h2><small>只呈现已导入或已关联快照的记录</small></div><div>{filtered.slice(0, 3).map((asset) => <button className="asset-thumb" key={asset.id} onClick={() => navigate('asset-detail', asset.id)}><i /><strong>{asset.assetCode}</strong><span>{channelNames(asset)} · {asset.snapshots.length ? '可分析' : '数据不足'}</span></button>)}</div></section>
    </div>
    <section className="panel table-panel"><div className="section-head"><h2>可进入分析的素材</h2><small>数据周期与来源在进入后单独说明</small></div><AssetTable rows={filtered.slice(0, 6)} navigate={navigate} /></section>
  </>
}

function CreativeAnalysis({ assets, navigate }: { assets: Asset[]; navigate: (page: Page, id?: string) => void }) {
  return <>
    <PageHeader title="单条素材分析" subtitle="选择已导入的素材数据，查看经营指标、逐秒曲线、数据事实与待验证假设。" actions={<button className="primary" onClick={() => navigate('import')}><FileUp size={17} />导入素材数据</button>} />
    <Notice>本页面不要求先创建素材档案。当前只展示已导入或匿名演示数据；缺少逐秒曲线、数据周期或来源时会明确标记为数据不足。</Notice>
    {assets.length ? <section className="panel table-panel"><div className="section-head"><h2>选择一条素材开始分析</h2><small>点击“分析”后查看数据来源、周期与证据</small></div><AssetTable rows={assets} navigate={navigate} /></section> : <EmptyState title="尚无可分析素材" detail="请先导入单条素材表格、逐秒数据或相关截图；截图识别将在下一阶段接入人工校对流程。" />}
  </>
}

function Benchmark({ navigate }: { navigate: (page: Page, id?: string) => void }) {
  return <><PageHeader title="竞品对标" subtitle="仅比较用户提供并确认来源、周期与口径的数据；不会预设品牌名称或伪造竞品指标。" actions={<button className="primary" onClick={() => navigate('import')}><FileUp size={17} />导入竞品数据</button>} /><EmptyState title="尚未导入竞品资料" detail="下一阶段将支持竞品截图、表格、素材链接记录与人工拆解表；口径不一致时仅做内容结构对比，不做数值优劣判断。" /></>
}

function HistoryReports({ navigate }: { navigate: (page: Page, id?: string) => void }) {
  return <><PageHeader title="历史报告" subtitle="历史报告将在周度复盘保存能力接入后显示；当前不会伪造可下载或已保存的报告。" actions={<button className="outline" onClick={() => navigate('weekly-review')}><TableProperties size={17} />进入周度复盘</button>} /><EmptyState title="暂无已保存报告" detail="目前周度复盘仍是会话草稿。保存、导出和历史归档将在后续阶段接入。" /></>
}

function Products({ rows, edit, refresh, notify }: { rows: Product[]; edit: (product: Product | null) => void; refresh: () => Promise<void>; notify: (message: string) => void }) {
  const [selectedId, setSelectedId] = useState(rows[0]?.id || '')
  const selected = rows.find((product) => product.id === selectedId) || rows[0]
  const archive = async () => {
    if (!selected || !window.confirm(`确认归档「${selected.name}」？现有素材不会被删除。`)) return
    await localApi.products.archive(selected.id)
    notify('产品已归档')
    await refresh()
  }
  return <>
    <PageHeader title="产品知识中心" subtitle="真实本地 CRUD；卖点、限制、颜色、来源与核验时间均写入 SQLite。" actions={<button className="primary" onClick={() => edit(null)}><Plus size={17} />新增产品</button>} />
    <Notice>当前记录为匿名演示 seed 或本地手动录入；“待确认”信息不会被当作已核验卖点。</Notice>
    {rows.length ? <div className="products-layout">
      <section className="panel product-list"><div className="section-head"><h2>产品档案</h2><small>{rows.length} 条</small></div>{rows.map((product) => <button key={product.id} className={selected?.id === product.id ? 'product-selected' : ''} onClick={() => setSelectedId(product.id)}><strong>{product.name}</strong><span>{product.model || '型号待补充'} · {recordStatus(product.status)}</span><EvidenceBadge source={product.sourceNote || '来源待补充'} /></button>)}</section>
      {selected && <section className="panel product-detail">
        <div className="detail-title"><div><h2>{selected.name}</h2><p>{selected.brand || '品牌待补充'} · {selected.series || '系列待补充'}</p></div><div><button className="outline" onClick={() => edit(selected)}><Pencil size={16} />编辑</button><button className="danger-outline" onClick={() => void archive()}><Archive size={16} />归档</button></div></div>
        <div className="detail-meta"><span>颜色：{selected.colors?.join('、') || '待补充'}</span><span>核验：{selected.verifiedAt ? formatDate(selected.verifiedAt) : '尚未核验'}</span><span>关联：{selected._count?.assets || 0} 条素材</span></div>
        <ClaimGroup title="已确认卖点" items={selected.confirmedClaims} tone="success" empty="暂无已确认卖点" />
        <ClaimGroup title="待确认表达" items={selected.pendingClaims} tone="warning" empty="暂无待确认表达" />
        <ClaimGroup title="宣传限制" items={selected.prohibitedClaims} tone="danger" empty="暂无宣传限制记录" />
        <div className="source-note"><b>来源</b><p>{selected.sourceNote || '待补充'}</p></div>
      </section>}
    </div> : <EmptyState title="还没有产品档案" detail="点击“新增产品”创建第一条本地记录。" />}
  </>
}

function ClaimGroup({ title, items = [], tone, empty }: { title: string; items?: string[]; tone: string; empty: string }) {
  return <div className="claim-group"><h3>{title}</h3>{items.length ? items.map((item) => <div key={item}><StatusBadge status={tone === 'success' ? '已确认' : tone === 'danger' ? '禁止使用' : '待确认'} /><p>{item}</p></div>) : <p className="muted">{empty}</p>}</div>
}

function Assets({ rows, channels, navigate, edit }: { rows: Asset[]; channels: Channel[]; navigate: (page: Page, id?: string) => void; edit: (asset: Asset | null) => void }) {
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [channel, setChannel] = useState('全部渠道')
  const filtered = channel === '全部渠道' ? rows : rows.filter((asset) => asset.channels.some((item) => item.channel.name === channel))
  return <>
    <PageHeader title="素材资产库" subtitle="基础信息、产品/渠道关联和版本关系来自本地 SQLite；不上传大型真实视频。" actions={<button className="primary" onClick={() => edit(null)}><Plus size={17} />新增素材</button>} />
    <div className="asset-toolbar">
      <div className="segmented"><button className={view === 'grid' ? 'selected' : ''} onClick={() => setView('grid')}><Grid2X2 size={15} />网格</button><button className={view === 'list' ? 'selected' : ''} onClick={() => setView('list')}><List size={15} />列表</button></div>
      <label className="compact-field">渠道筛选<select value={channel} onChange={(event) => setChannel(event.target.value)}><option>全部渠道</option>{channels.map((item) => <option key={item.id}>{item.name}</option>)}</select></label>
    </div>
    {!filtered.length ? <EmptyState title="没有匹配素材" detail="修改搜索/渠道条件，或创建一条素材基础记录。" /> : view === 'grid' ? <div className="asset-grid">{filtered.map((asset) => <button className="asset-card" key={asset.id} onClick={() => navigate('asset-detail', asset.id)}><i /><div><StatusBadge status={assetStatus(asset.status)} /><strong>{asset.displayName}</strong><span>{asset.assetCode} · {versionLabel(asset)}</span><small>{channelNames(asset)} · {asset.durationSeconds ?? '—'}s · {asset.contentType || '标签待补充'}</small><EvidenceBadge source={asset.snapshots[0]?.dataSource || '基础信息已入库'} status={asset.snapshots.length ? '待确认' : '数据不足'} /></div></button>)}</div> : <section className="panel table-panel"><AssetTable rows={filtered} navigate={navigate} /></section>}
  </>
}

function Goals({ rows, edit, refresh, notify }: { rows: Goal[]; edit: (goal: Goal | null) => void; refresh: () => Promise<void>; notify: (message: string) => void }) {
  const [category, setCategory] = useState('全部目标')
  const [selectedId, setSelectedId] = useState(rows[0]?.id || '')
  const selected = rows.find((goal) => goal.id === selectedId) || rows[0]
  const filtered = category === '全部目标' ? rows : rows.filter((goal) => goal.category === category)
  const addProgress = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!selected) return
    const formElement = event.currentTarget
    const form = new FormData(formElement)
    await localApi.goals.progress(selected.id, { date: form.get('date'), value: form.get('value'), source: '本地手动录入' })
    formElement.reset()
    notify('每日进度已保存，目标完成率已重算')
    await refresh()
  }
  const pause = async () => {
    if (!selected || !window.confirm(`确认暂停目标「${selected.name}」？`)) return
    await localApi.goals.pause(selected.id)
    notify('目标已暂停')
    await refresh()
  }
  return <>
    <PageHeader title="经营目标与进度" subtitle="月度目标、每日录入、完成率与差额均来自本地 SQLite；空值不解释为 0。" actions={<><button className="outline" onClick={() => window.location.hash = 'import'}><FileUp size={17} />导入目标</button><button className="primary" onClick={() => edit(null)}><Plus size={17} />新建目标</button></>} />
    <div className="segmented">{[['全部目标', '全部目标'], ['素材产量', 'ASSET_OUTPUT'], ['GMV', 'GMV'], ['消耗', 'SPEND'], ['ROI', 'ROI'], ['拍摄', 'SHOOT_COUNT']].map(([label, value]) => <button className={category === value ? 'selected' : ''} key={value} onClick={() => setCategory(value)}>{label}</button>)}</div>
    <div className="goals-layout">
      <section className="panel table-panel"><div className="section-head"><h2>目标进度表</h2><small>数据来源：SQLite</small></div><table><thead><tr><th>目标</th><th>周期</th><th>目标 / 当前</th><th>完成率</th><th>状态</th><th /></tr></thead><tbody>{filtered.map((goal) => <tr key={goal.id} className={selected?.id === goal.id ? 'selected-row' : ''}><td><button className="table-primary" onClick={() => setSelectedId(goal.id)}>{goal.name}<small>{goalCategory(goal.category)} · {priorityLabel(goal.priority)}</small></button></td><td>{formatDate(goal.periodStart)}<small>至 {formatDate(goal.periodEnd)}</small></td><td>{numberOrMissing(goal.targetValue)} / {numberOrMissing(goal.currentValue)} <small>{goal.unit}</small></td><td>{goal.progressRate === null ? <span className="missing">— 数据不足</span> : <div className="progress"><i style={{ width: `${Math.min(goal.progressRate * 100, 100)}%` }} />{Math.round(goal.progressRate * 100)}%</div>}</td><td><StatusBadge status={goalStatus(goal.status)} /></td><td><button className="link" onClick={() => setSelectedId(goal.id)}>详情 <ChevronRight size={15} /></button></td></tr>)}</tbody></table></section>
      {selected && <aside className="panel right-rail"><div className="detail-title"><div><h2>{selected.name}</h2><p>差额：{numberOrMissing(selected.gapValue)} {selected.unit}</p></div><button className="icon-button" aria-label="编辑目标" onClick={() => edit(selected)}><Pencil size={16} /></button></div>
        <EvidenceBadge source={selected.source || '来源待补充'} status="口径待确认" />
        <h3>每日数据</h3>{selected.progress.length ? <div className="daily-list">{selected.progress.map((item) => <div key={item.id}><span>{formatDate(item.date)}</span><b>{numberOrMissing(item.value)}</b></div>)}</div> : <p className="muted">尚未录入每日进度。</p>}
        <form className="inline-form" onSubmit={(event) => void addProgress(event)}><label>日期<input name="date" type="date" required /></label><label>当日值<input name="value" type="number" step="any" required /></label><button className="primary">保存进度</button></form>
        <button className="danger-outline full" onClick={() => void pause()}>暂停目标</button>
      </aside>}
    </div>
  </>
}

const importFieldSets = {
  'monthly-goals': [
    ['name', '目标名称'], ['category', '目标分类'], ['periodStart', '周期开始'], ['targetValue', '目标值'],
  ],
  'asset-metadata': [
    ['assetCode', '素材编号'], ['displayName', '素材名称'], ['externalMaterialId', '外部素材 ID'], ['durationSeconds', '时长（秒）'], ['sourceType', '素材来源'], ['productName', '产品名称'], ['channel', '渠道'],
  ],
  'asset-performance': [
    ['assetCode', '素材编号'], ['channel', '渠道'], ['statisticsStart', '数据周期开始'], ['spend', '消耗'], ['paidRoi', '支付 ROI'],
  ],
} as const

function ImportCenter({ batches, refresh, notify }: { batches: ImportBatch[]; refresh: () => Promise<void>; notify: (message: string) => void }) {
  const [dataType, setDataType] = useState<keyof typeof importFieldSets>('monthly-goals')
  const [filename, setFilename] = useState('')
  const [parsed, setParsed] = useState<ParsedLocalFile | null>(null)
  const [mapping, setMapping] = useState<Record<string, string>>({})
  const [issues, setIssues] = useState<{ errors: ImportIssue[]; warnings: ImportIssue[] }>({ errors: [], warnings: [] })
  const [status, setStatus] = useState<'idle' | 'parsing' | 'ready' | 'validated' | 'importing' | 'done'>('idle')
  const [message, setMessage] = useState<string | null>(null)

  const fields = importFieldSets[dataType]
  const mappedRows = useMemo(() => parsed?.rows.map((row) => Object.fromEntries(parsed.headers.flatMap((header) => mapping[header] ? [[mapping[header], row[header]]] : []))) || [], [mapping, parsed])
  const chooseFile = async (file: File) => {
    setStatus('parsing')
    setMessage(null)
    setIssues({ errors: [], warnings: [] })
    try {
      const result = await parseLocalImportFile(file)
      const nextMapping = Object.fromEntries(result.headers.map((header) => {
        const english = header.match(/\(([^()]+)\)\s*$/)?.[1]
        const match = fields.find(([key, label]) => key.toLowerCase() === (english || header).trim().toLowerCase() || label === header)
        return [header, match?.[0] || '']
      }))
      setFilename(file.name)
      setParsed(result)
      setMapping(nextMapping)
      setStatus('ready')
      setMessage(`已在浏览器本地解析 ${result.rows.length} 行；文件内容未发送到第三方。`)
    } catch (error) {
      setParsed(null)
      setStatus('idle')
      setMessage(error instanceof Error ? error.message : '文件解析失败')
    }
  }
  const validate = async () => {
    if (!parsed) return
    setStatus('parsing')
    try {
      const result = await localApi.imports.validate({ dataType, rows: mappedRows })
      setIssues({ errors: result.errors, warnings: result.warnings })
      setStatus('validated')
      setMessage(`校验通过：${mappedRows.length} 行可以写入。`)
    } catch (error) {
      const payload = (error as Error & { payload?: { errors?: ImportIssue[]; warnings?: ImportIssue[] } }).payload
      setIssues({ errors: payload?.errors || [{ row: 0, field: 'file', message: error instanceof Error ? error.message : '校验失败' }], warnings: payload?.warnings || [] })
      setStatus('ready')
      setMessage('校验未通过，请根据错误列表修正文件或映射。')
    }
  }
  const commit = async () => {
    if (!parsed || status !== 'validated') return
    setStatus('importing')
    try {
      const result = await localApi.imports.commit({ filename, sourceType: parsed.sourceType, dataType, mapping, rows: mappedRows })
      setStatus('done')
      setMessage(`导入完成：批次 ${result.batchId}，写入 ${result.recordCount} 行。`)
      notify('导入批次已写入 SQLite')
      await refresh()
    } catch (error) {
      setStatus('validated')
      setMessage(error instanceof Error ? error.message : '导入失败')
    }
  }
  const undo = async (batch: ImportBatch) => {
    if (!window.confirm(`确认撤销批次「${batch.filename}」？本批次新建记录将被删除。`)) return
    await localApi.imports.undo(batch.id)
    notify('导入批次已撤销')
    await refresh()
  }

  return <>
    <PageHeader title="数据导入" subtitle="先把表格数据交给系统。CSV/XLSX 在本机解析；预览、映射、口径确认和人工确认后才写入 SQLite。" />
    <div className="steps">{['上传', '预览', '字段映射', '口径确认', '数据校验', '人工确认', '导入报告'].map((step, index) => <div key={step} className={(status === 'idle' ? 0 : status === 'ready' ? 2 : status === 'validated' ? 5 : status === 'done' ? 6 : 1) >= index ? 'current' : ''}><b>{index + 1}</b>{step}</div>)}</div>
    <div className="import-layout">
      <section className="panel import-zone">
        <FileUp size={32} /><h2>选择本地文件</h2><p>支持 CSV、XLSX；最大 50MB、10,000 行、40 列。拒绝公式与隐藏结构。</p>
        <label className="file-button">选择文件<input aria-label="选择导入文件" type="file" accept=".csv,.xlsx,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" onChange={(event) => event.target.files?.[0] && void chooseFile(event.target.files[0])} /></label>
        <label className="compact-field">导入类型<select value={dataType} onChange={(event) => { setDataType(event.target.value as keyof typeof importFieldSets); setParsed(null); setStatus('idle'); setMessage('导入类型已切换，请重新选择文件。') }}><option value="monthly-goals">月度目标</option><option value="asset-metadata">素材元数据</option><option value="asset-performance">素材表现</option><option disabled>逐秒互动（下一阶段）</option></select></label>
        {status === 'parsing' || status === 'importing' ? <div className="busy"><LoaderCircle className="spin" />{status === 'importing' ? '正在写入本地数据库…' : '正在本地解析/校验…'}</div> : null}
        {message && <Notice>{message}</Notice>}
      </section>
      <section className="panel"><div className="section-head"><h2>导入安全</h2><small>本地执行</small></div><ul className="check-list"><li>扩展名、MIME、大小、空文件与超大行数</li><li>非法/重复列、日期、数字、真实 0 与空值</li><li>公式前缀、XLSX 公式、隐藏工作表/行列</li><li>重复素材、无法匹配产品或渠道</li></ul></section>
    </div>
    {parsed && <section className="panel mapping-panel"><div className="section-head"><h2>字段映射</h2><small>{filename} · {parsed.rows.length} 行</small></div><div className="mapping-grid">{parsed.headers.map((header) => <label key={header}><span>{header}</span><select value={mapping[header] || ''} onChange={(event) => { setMapping((current) => ({ ...current, [header]: event.target.value })); setStatus('ready') }}><option value="">忽略此列</option>{fields.map(([key, label]) => <option key={key} value={key}>{label} ({key})</option>)}</select></label>)}</div>
      <div className="preview-table"><table><thead><tr>{parsed.headers.map((header) => <th key={header}>{mapping[header] || '忽略'}</th>)}</tr></thead><tbody>{parsed.rows.slice(0, 5).map((row, index) => <tr key={index}>{parsed.headers.map((header) => <td key={header}>{String(row[header] ?? '—')}</td>)}</tr>)}</tbody></table></div>
      <div className="confirm-row"><EvidenceBadge source="本地文件预览" status="口径待确认" /><button className="outline" onClick={() => void validate()}>校验数据</button><button className="primary" disabled={status !== 'validated'} onClick={() => void commit()}>确认写入</button></div>
      {(issues.errors.length > 0 || issues.warnings.length > 0) && <div className="issue-list">{issues.errors.map((issue, index) => <div className="issue error" key={`e-${index}`}>第 {issue.row || '—'} 行 · {issue.field}：{issue.message}</div>)}{issues.warnings.map((issue, index) => <div className="issue warning" key={`w-${index}`}>第 {issue.row || '—'} 行 · {issue.field}：{issue.message}</div>)}</div>}
    </section>}
    <section className="panel table-panel"><div className="section-head"><h2>导入历史</h2><small>最近 50 个批次</small></div>{batches.length ? <table><thead><tr><th>文件</th><th>类型</th><th>记录数</th><th>状态</th><th>时间</th><th /></tr></thead><tbody>{batches.map((batch) => <tr key={batch.id}><td><strong>{batch.filename}</strong><small>{batch.id}</small></td><td>{batch.dataType}</td><td>{batch.recordCount}</td><td><StatusBadge status={importStatus(batch.status)} /></td><td>{formatDateTime(batch.createdAt)}</td><td>{batch.status === 'IMPORTED' ? <button className="danger-outline compact" onClick={() => void undo(batch)}>撤销批次</button> : <span className="muted">—</span>}</td></tr>)}</tbody></table> : <EmptyState title="还没有导入批次" detail="选择匿名模板完成首次导入。" />}</section>
  </>
}

function Analysis({ assets, channels, navigate }: { assets: Asset[]; channels: Channel[]; navigate: (page: Page, id?: string) => void }) {
  const [channel, setChannel] = useState('全部渠道')
  const filtered = channel === '全部渠道' ? assets : assets.filter((asset) => asset.channels.some((item) => item.channel.name === channel))
  const withSnapshot = filtered.filter((asset) => asset.snapshots[0])
  const spend = withSnapshot.reduce((sum, asset) => sum + (asset.snapshots[0].spend || 0), 0)
  const gmv = withSnapshot.reduce((sum, asset) => sum + (asset.snapshots[0].gmv || 0), 0)
  const roi = spend ? gmv / spend : null
  return <>
    <PageHeader title="素材对比" subtitle="使用已导入快照比较素材表现；不同渠道或口径不一致时不直接给出数值优劣结论。" />
    <div className="filter-bar"><label>渠道<select value={channel} onChange={(event) => setChannel(event.target.value)}><option>全部渠道</option>{channels.map((item) => <option key={item.id}>{item.name}</option>)}</select></label><label>时间<select defaultValue="最近快照"><option>最近快照</option><option disabled>自定义区间（尚未接入）</option></select></label><span><Database size={15} />数据来源：匿名演示 seed</span></div>
    <Notice>阈值与指标口径仍待内部确认；空值不会参与平均或被解释为 0。</Notice>
    <div className="metric-grid"><Metric label="有快照素材" value={String(withSnapshot.length)} /><Metric label="演示 GMV" value={gmv ? gmv.toFixed(0) : '—'} /><Metric label="演示消耗" value={spend ? spend.toFixed(0) : '—'} /><Metric label="演示 ROI" value={roi ? roi.toFixed(2) : '—'} /></div>
    <div className="analysis-grid"><section className="panel"><div className="section-head"><h2>CTR × CVR 象限</h2><small>最近快照</small></div>{withSnapshot.length ? <div className="quadrant">{withSnapshot.map((asset, index) => <button key={asset.id} aria-label={asset.displayName} style={{ left: `${20 + ((asset.snapshots[0].ctr || 0) * 1600) % 65}%`, top: `${20 + ((asset.snapshots[0].cvr || 0) * 1700) % 60}%` }} onClick={() => navigate('asset-detail', asset.id)}><span>{index + 1}</span></button>)}</div> : <EmptyState title="数据不足" detail="当前筛选没有可用于象限的 CTR/CVR 快照。" />}</section><section className="panel table-panel"><div className="section-head"><h2>素材对比</h2><small>点击进入逐秒分析</small></div><AssetTable rows={filtered.slice(0, 6)} navigate={navigate} /></section></div>
  </>
}

function Review({ assets }: { assets: Asset[] }) {
  const [assetId, setAssetId] = useState(assets[0]?.id || '')
  const selected = assets.find((asset) => asset.id === assetId)
  return <>
    <PageHeader title="素材复盘" subtitle="事实、内容观察、待验证假设与下一版动作分开；保存复盘后端尚未接入。" actions={<button className="primary" disabled>生成复盘 · 尚未接入</button>} />
    <label className="wide-select">选择素材<select value={assetId} onChange={(event) => setAssetId(event.target.value)}>{assets.map((asset) => <option key={asset.id} value={asset.id}>{asset.assetCode} · {asset.displayName}</option>)}</select></label>
    <div className="review-grid"><section className="panel"><div className="section-head"><h2>数据事实与证据</h2><EvidenceBadge source={selected?.snapshots[0]?.dataSource || '数据不足'} /></div><div className="insight fact"><b>数据事实</b><p>{selected?.snapshots[0] ? `最近快照消耗 ${selected.snapshots[0].spend ?? '—'}，支付 ROI ${selected.snapshots[0].paidRoi ?? '—'}。` : '尚无经营快照，不能形成量化结论。'}</p></div><div className="insight hypothesis"><b>待验证假设</b><textarea defaultValue="需要结合内容段、样本与投放条件后由人工确认。" /></div></section><section className="panel"><div className="section-head"><h2>下一版修改计划</h2><small>尚未接入</small></div>{['保留内容', '更换开头', '加强 CTA', '继续观察'].map((action) => <button className="review-action" disabled key={action}><RefreshCcw size={16} />{action}<StatusBadge status="尚未接入" /></button>)}</section></div>
  </>
}

function WeeklyReport() {
  const [week, setWeek] = useState('2026-07-06')
  return <>
    <PageHeader title="周度复盘" subtitle="将数据事实、数据口径、表现较好素材、待优化素材和下周验证方向分开记录；保存与导出尚未接入。" actions={<><button className="outline" disabled>导出 · 尚未接入</button><button className="primary" disabled>保存 · 尚未接入</button></>} />
    <div className="filter-bar"><label>自然周<input type="date" value={week} onChange={(event) => setWeek(event.target.value)} /></label><span><TriangleAlert size={15} />会话草稿，刷新后不保留</span></div>
    <div className="report-layout">{reportSections.map((section, index) => <section className="panel report-section" key={section}><span>0{index + 1}</span><div><h2>{section}</h2><textarea aria-label={`${section}内容`} defaultValue={index === 0 ? '月度进度、周度完成、每日趋势、目标差额和风险项。' : '匿名演示 seed · 需要补充数据来源、口径状态和人工结论。'} /></div><StatusBadge status={index === 4 ? '数据不足' : '待确认'} /></section>)}</div>
  </>
}

function Metrics() {
  return <><PageHeader title="指标词典" subtitle="查看每个指标的含义、来源和当前口径状态。支付 ROI、净成交 ROI 与其他 ROI 不会被默认视为同一指标。" /><section className="panel table-panel"><table><thead><tr><th>指标</th><th>渠道</th><th>状态</th><th>来源</th><th>说明</th></tr></thead><tbody>{['GMV', '支付 ROI', 'CTR', 'CVR'].map((metric) => <tr key={metric}><td><strong>{metric}</strong></td><td>全部渠道</td><td><StatusBadge status="待确认" /></td><td><EvidenceBadge source="匿名演示 seed" /></td><td>原始字段、时间范围与流量范围待内部确认</td></tr>)}</tbody></table></section></>
}

function AssetDetail({ asset, edit, refresh, notify }: { asset: Asset; edit: () => void; refresh: () => Promise<void>; notify: (message: string) => void }) {
  const points = asset.timelines[0]?.points || []
  const max = Math.max(...points.map((point) => point.value || 0), 1)
  const [second, setSecond] = useState(points.find((point) => point.isPeak)?.second || 0)
  const [versionOpen, setVersionOpen] = useState(false)
  const snapshot = asset.snapshots[0]
  const archive = async () => {
    if (!window.confirm(`确认归档素材「${asset.displayName}」？`)) return
    await localApi.assets.archive(asset.id)
    notify('素材已归档')
    await refresh()
    window.location.hash = 'assets'
  }
  const newVersion = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    await localApi.assets.createVersion(asset.id, { changeSummary: form.get('changeSummary'), durationSeconds: asset.durationSeconds })
    setVersionOpen(false)
    notify('新版本已创建并关联上一版本')
    await refresh()
  }
  const point = points.find((item) => item.second === second)
  return <>
    <PageHeader title="单条素材分析工作台" subtitle={`${asset.assetCode} · ${channelNames(asset)} · ${asset.durationSeconds ?? '—'}s · ${snapshot ? `${formatDate(snapshot.statisticsStart)} 至 ${formatDate(snapshot.statisticsEnd)}` : '数据周期缺失'}`} actions={<><button className="outline" onClick={edit}><Pencil size={16} />编辑素材</button><button className="primary" onClick={() => setVersionOpen(true)}><Plus size={16} />新建版本</button></>} />
    <section className="asset-hero panel"><div className="video-preview"><Play size={30} /><span>匿名素材占位预览</span></div><div><StatusBadge status={assetStatus(asset.status)} /><h2>{asset.displayName}</h2><p>产品：{asset.product?.name || '未关联'} · 版本：{versionLabel(asset)} · 标签：{asset.tags.join('、') || '待补充'}</p><EvidenceBadge source={snapshot?.dataSource || '素材基础信息已入库'} status={snapshot ? '口径待确认' : '数据不足'} /><div className="version-chain">{asset.versions.map((version, index) => <span key={version.id}>{index > 0 && '→ ' }V{String(version.versionNumber).padStart(2, '0')} · {version.changeSummary || '无说明'}</span>)}</div></div></section>
    <div className="metric-grid"><Metric label="GMV · 最近快照" value={numberOrMissing(snapshot?.gmv)} /><Metric label="消耗 · 最近快照" value={numberOrMissing(snapshot?.spend)} /><Metric label="支付 ROI · 最近快照" value={numberOrMissing(snapshot?.paidRoi)} /><Metric label="CTR · 最近快照" value={snapshot?.ctr === null || snapshot?.ctr === undefined ? '—' : `${(snapshot.ctr * 100).toFixed(2)}%`} /></div>
    <section className="panel timeline-workbench"><div className="timeline-head"><div><h2>视频逐秒分析</h2><p>数据来源：{asset.timelines[0]?.dataSource || '尚未导入逐秒数据'}。</p></div><div className="segmented"><button className="selected">点击</button><button disabled>流失 · 尚未接入</button><button disabled>留存 · 尚未接入</button></div></div>{points.length ? <><div className="chart-row"><div className="chart">{points.map((item) => <button aria-label={`第 ${item.second + 1} 秒`} className={item.second === second ? 'selected' : ''} key={item.second} onClick={() => setSecond(item.second)} style={{ height: `${((item.value || 0) / max) * 170}px` }} />)}</div><aside><StatusBadge status={point?.isPeak ? '峰值' : point?.isDrop ? '流失点' : '待确认'} /><h3>第 {second + 1} 秒</h3><p>互动值：{numberOrMissing(point?.value)}。内容段关联仍需人工确认，不能据此推断因果。</p><EvidenceBadge source={asset.timelines[0]?.dataSource || '数据不足'} /></aside></div><div className="segment-track">{contentSegments.map((segment) => <button className={segment.tone} key={segment.label} style={{ flex: segment.end - segment.start }}>{segment.label}<small>{segment.start}s–{segment.end}s</small></button>)}</div></> : <EmptyState title="逐秒数据不足" detail="数据结构已准备好；interaction-timeline 真实导入安排在下一小阶段。" />}</section>
    <div className="analysis-detail-grid"><section className="panel"><div className="section-head"><h2>AI 诊断区域</h2><small>人工确认前不形成结论</small></div><div className="diagnosis"><b>数据事实</b><p>{points.length ? '存在匿名演示互动曲线。' : '暂无逐秒样本。'}</p><b>可能原因</b><p>尚未接入可信诊断，不推断因果。</p><b>下一版建议</b><p>版本任务已可真实创建；建议内容仍需人工填写。</p></div></section><section className="panel"><div className="section-head"><h2>经营数据与复盘</h2><small>入口状态</small></div><p className="muted">经营快照：{snapshot ? '已连接 SQLite' : '数据不足'}；复盘保存后端尚未接入。</p><button className="outline" disabled>创建复盘 · 尚未接入</button><button className="danger-outline" onClick={() => void archive()}>归档素材</button></section></div>
    {versionOpen && <Modal title="创建素材新版本" close={() => setVersionOpen(false)}><form className="form-grid" onSubmit={(event) => void newVersion(event)}><label className="span-2">修改说明<textarea name="changeSummary" required placeholder="例如：调整开头并缩短 CTA" /></label><div className="modal-actions"><button type="button" className="outline" onClick={() => setVersionOpen(false)}>取消</button><button className="primary">创建版本</button></div></form></Modal>}
  </>
}

function AssetTable({ rows, navigate }: { rows: Asset[]; navigate: (page: Page, id?: string) => void }) {
  return <table><thead><tr><th>素材</th><th>渠道 / 产品</th><th>状态</th><th>数据周期 / 来源</th><th>操作</th></tr></thead><tbody>{rows.map((asset) => <tr key={asset.id}><td><strong>{asset.displayName}</strong><small>{asset.assetCode} · {versionLabel(asset)}</small></td><td>{channelNames(asset)}<small>{asset.product?.name || '未关联产品'}</small></td><td><StatusBadge status={assetStatus(asset.status)} /></td><td>{asset.snapshots[0] ? `${formatDate(asset.snapshots[0].statisticsStart)}–${formatDate(asset.snapshots[0].statisticsEnd)}` : '— 数据不足'}<small>{asset.snapshots[0]?.dataSource || '暂无经营快照'}</small></td><td><button className="link" onClick={() => navigate('asset-detail', asset.id)}>分析 <LineChart size={15} /></button></td></tr>)}</tbody></table>
}

function ProductForm({ product, close, save }: { product: Product | null; close: () => void; save: (payload: unknown) => Promise<void> }) {
  const [error, setError] = useState<string | null>(null)
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const lines = (name: string) => String(form.get(name) || '').split('\n').map((item) => item.trim()).filter(Boolean)
    try {
      await save({
        name: form.get('name'), model: form.get('model'), series: form.get('series'), brand: form.get('brand'),
        status: form.get('status'), colors: String(form.get('colors') || '').split(/[,，]/).map((item) => item.trim()).filter(Boolean),
        confirmedClaims: lines('confirmedClaims'), pendingClaims: lines('pendingClaims'), prohibitedClaims: lines('prohibitedClaims'),
        sourceNote: form.get('sourceNote'), verifiedAt: form.get('verifiedAt') || null, verifiedBy: form.get('verifiedBy'),
      })
    } catch (reason) { setError(reason instanceof Error ? reason.message : '保存失败') }
  }
  return <Modal title={product ? '编辑产品' : '新增产品'} close={close}><form className="form-grid" onSubmit={(event) => void submit(event)}>
    <label>产品名称<input name="name" defaultValue={product?.name} required /></label><label>型号<input name="model" defaultValue={product?.model || ''} /></label>
    <label>品牌<input name="brand" defaultValue={product?.brand || ''} /></label><label>系列<input name="series" defaultValue={product?.series || ''} /></label>
    <label>状态<select name="status" defaultValue={product?.status || 'PENDING_CONFIRMATION'}><option value="PENDING_CONFIRMATION">待确认</option><option value="ACTIVE">已核验/启用</option></select></label><label>产品颜色<input name="colors" defaultValue={product?.colors?.join('，') || ''} placeholder="雾蓝，暖灰" /></label>
    <label className="span-2">已确认卖点（每行一条）<textarea name="confirmedClaims" defaultValue={product?.confirmedClaims?.join('\n') || ''} /></label>
    <label className="span-2">待确认表达（每行一条）<textarea name="pendingClaims" defaultValue={product?.pendingClaims?.join('\n') || ''} /></label>
    <label className="span-2">宣传限制（每行一条）<textarea name="prohibitedClaims" defaultValue={product?.prohibitedClaims?.join('\n') || ''} /></label>
    <label className="span-2">来源说明<textarea name="sourceNote" defaultValue={product?.sourceNote || '本地手动录入'} required /></label>
    <label>核验日期<input name="verifiedAt" type="date" defaultValue={product?.verifiedAt?.slice(0, 10) || ''} /></label><label>核验人<input name="verifiedBy" defaultValue={product?.verifiedBy || ''} placeholder="可留空" /></label>
    {error && <div className="form-error span-2">{error}</div>}<div className="modal-actions"><button type="button" className="outline" onClick={close}>取消</button><button className="primary">保存到本地数据库</button></div>
  </form></Modal>
}

function AssetForm({ asset, products, channels, close, save }: { asset: Asset | null; products: Product[]; channels: Channel[]; close: () => void; save: (payload: unknown) => Promise<void> }) {
  const [error, setError] = useState<string | null>(null)
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    try {
      await save({
        assetCode: form.get('assetCode'), displayName: form.get('displayName'), productId: form.get('productId') || null,
        channelCodes: form.getAll('channelCodes'), sourceType: form.get('sourceType'), status: form.get('status'),
        durationSeconds: form.get('durationSeconds') || null, contentType: form.get('contentType'),
        tags: String(form.get('tags') || '').split(/[,，]/).map((item) => item.trim()).filter(Boolean),
        localFileReference: form.get('localFileReference'), externalMaterialId: form.get('externalMaterialId'),
      })
    } catch (reason) { setError(reason instanceof Error ? reason.message : '保存失败') }
  }
  const selectedChannels = new Set(asset?.channels.map(({ channel }) => channel.code) || [])
  return <Modal title={asset ? '编辑素材基础信息' : '新增素材记录'} close={close}><form className="form-grid" onSubmit={(event) => void submit(event)}>
    <label>素材编号<input name="assetCode" defaultValue={asset?.assetCode || ''} required placeholder="SF-LOCAL-001" /></label><label>素材名称<input name="displayName" defaultValue={asset?.displayName || ''} required /></label>
    <label>关联产品<select name="productId" defaultValue={asset?.productId || ''}><option value="">暂不关联</option>{products.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}</select></label><label>素材来源<select name="sourceType" defaultValue={asset?.sourceType || 'ORIGINAL'}><option value="ORIGINAL">原创</option><option value="ITERATION">迭代</option><option value="CREATOR">达人</option><option value="AI_ASSISTED">AI 辅助</option><option value="REEDIT">二次剪辑</option></select></label>
    <fieldset className="span-2"><legend>渠道关联</legend>{channels.map((channel) => <label className="check" key={channel.id}><input type="checkbox" name="channelCodes" value={channel.code} defaultChecked={selectedChannels.has(channel.code)} />{channel.name}</label>)}</fieldset>
    <label>状态<select name="status" defaultValue={asset?.status || 'DRAFT'}><option value="DRAFT">草稿</option><option value="PENDING_EDIT">待剪辑</option><option value="PENDING_PUBLISH">待发布</option><option value="PUBLISHED">已发布</option><option value="PROMOTING">投流中</option><option value="OBSERVING">数据观察中</option><option value="OPTIMIZE">待优化</option><option value="REPLICABLE">可复刻</option><option value="INSUFFICIENT_DATA">数据不足</option></select></label><label>时长（秒）<input name="durationSeconds" type="number" min="0" max="86400" defaultValue={asset?.durationSeconds ?? ''} /></label>
    <label>内容类型<input name="contentType" defaultValue={asset?.contentType || ''} placeholder="场景表达" /></label><label>标签<input name="tags" defaultValue={asset?.tags.join('，') || ''} placeholder="卖点表达，匿名演示" /></label>
    <label>外部素材 ID<input name="externalMaterialId" defaultValue={asset?.externalMaterialId || ''} /></label><label>安全文件引用<input name="localFileReference" defaultValue={asset?.localFileReference || ''} placeholder="media/demo-001.mp4" /></label>
    <p className="field-help span-2">仅保存工作区内相对引用；绝对路径、协议和 `..` 路径会被拒绝。当前不上传大型视频。</p>
    {error && <div className="form-error span-2">{error}</div>}<div className="modal-actions"><button type="button" className="outline" onClick={close}>取消</button><button className="primary">保存到本地数据库</button></div>
  </form></Modal>
}

function GoalForm({ goal, products, channels, close, save }: { goal: Goal | null; products: Product[]; channels: Channel[]; close: () => void; save: (payload: unknown) => Promise<void> }) {
  const [error, setError] = useState<string | null>(null)
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    try {
      await save({
        name: form.get('name'), category: form.get('category'), periodType: 'MONTHLY',
        periodStart: form.get('periodStart'), periodEnd: form.get('periodEnd'),
        targetValue: form.get('targetValue') || null, currentValue: form.get('currentValue') || null,
        unit: form.get('unit'), priority: form.get('priority'), status: form.get('status'),
        productId: form.get('productId') || null, channelId: form.get('channelId') || null,
        source: form.get('source'), notes: form.get('notes'),
      })
    } catch (reason) { setError(reason instanceof Error ? reason.message : '保存失败') }
  }
  return <Modal title={goal ? '编辑经营目标' : '新建经营目标'} close={close}><form className="form-grid" onSubmit={(event) => void submit(event)}>
    <label className="span-2">目标名称<input name="name" defaultValue={goal?.name || ''} required /></label>
    <label>目标分类<select name="category" defaultValue={goal?.category || 'GMV'}><option value="GMV">GMV</option><option value="ASSET_OUTPUT">素材产量</option><option value="SPEND">消耗</option><option value="ROI">ROI</option><option value="NEW_ASSET_GMV">新素材 GMV</option><option value="SHOOT_COUNT">拍摄次数</option><option value="CUSTOM">自定义</option></select></label><label>优先级<select name="priority" defaultValue={goal?.priority || 'MEDIUM'}><option value="CRITICAL">关键</option><option value="HIGH">高</option><option value="MEDIUM">中</option><option value="LOW">低</option></select></label>
    <label>周期开始<input name="periodStart" type="date" defaultValue={goal?.periodStart.slice(0, 10) || '2026-07-01'} required /></label><label>周期结束<input name="periodEnd" type="date" defaultValue={goal?.periodEnd.slice(0, 10) || '2026-07-31'} required /></label>
    <label>目标值<input name="targetValue" type="number" step="any" defaultValue={goal?.targetValue ?? ''} /></label><label>当前值<input name="currentValue" type="number" step="any" defaultValue={goal?.currentValue ?? ''} /></label>
    <label>单位<input name="unit" defaultValue={goal?.unit || '数值'} required /></label><label>状态<select name="status" defaultValue={goal?.status || 'ON_TRACK'}><option value="ON_TRACK">正常</option><option value="AT_RISK">需关注</option><option value="BLOCKED">受阻</option><option value="COMPLETE">完成</option><option value="PAUSED">暂停</option></select></label>
    <label>产品<select name="productId" defaultValue={goal?.productId || ''}><option value="">全部/未关联</option>{products.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}</select></label><label>渠道<select name="channelId" defaultValue={goal?.channelId || ''}><option value="">全部/未关联</option>{channels.map((channel) => <option key={channel.id} value={channel.id}>{channel.name}</option>)}</select></label>
    <label className="span-2">数据来源<input name="source" defaultValue={goal?.source || '本地手动录入'} required /></label><label className="span-2">备注<textarea name="notes" defaultValue="" /></label>
    {error && <div className="form-error span-2">{error}</div>}<div className="modal-actions"><button type="button" className="outline" onClick={close}>取消</button><button className="primary">保存到本地数据库</button></div>
  </form></Modal>
}

function Modal({ title, close, children }: { title: string; close: () => void; children: ReactNode }) {
  return <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && close()}><section className="modal" role="dialog" aria-modal="true" aria-label={title}><header><h2>{title}</h2><button className="icon-button" aria-label="关闭" onClick={close}><X size={20} /></button></header>{children}</section></div>
}

function versionLabel(asset: Asset) {
  const latest = asset.versions.at(-1)?.versionNumber || 1
  return `V${String(latest).padStart(2, '0')}`
}
function channelNames(asset: Asset) { return asset.channels.map(({ channel }) => channel.name).join(' / ') || '未关联渠道' }
function formatDate(value: string) { return new Intl.DateTimeFormat('zh-CN', { month: '2-digit', day: '2-digit' }).format(new Date(value)) }
function formatDateTime(value: string) { return new Intl.DateTimeFormat('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).format(new Date(value)) }
function numberOrMissing(value: number | null | undefined) { return value === null || value === undefined ? '—' : new Intl.NumberFormat('zh-CN', { maximumFractionDigits: 2 }).format(value) }
function recordStatus(status: string) { return ({ ACTIVE: '已核验', PENDING_CONFIRMATION: '待确认', ARCHIVED: '已归档' } as Record<string, string>)[status] || status }
function assetStatus(status: string) { return ({ DRAFT: '草稿', PENDING_EDIT: '待剪辑', PENDING_PUBLISH: '待发布', PUBLISHED: '已发布', PROMOTING: '投流中', OBSERVING: '数据观察中', REPLICABLE: '可复刻', OPTIMIZE: '待优化', PAUSED: '已暂停', RETIRED: '已归档', INSUFFICIENT_DATA: '数据不足' } as Record<string, string>)[status] || status }
function goalStatus(status: string) { return ({ ON_TRACK: '正常', AT_RISK: '需关注', BLOCKED: '受阻', COMPLETE: '已完成', PAUSED: '已暂停' } as Record<string, string>)[status] || status }
function goalCategory(category: string) { return ({ ASSET_OUTPUT: '素材产量', GMV: 'GMV', SPEND: '消耗', ROI: 'ROI', NEW_ASSET_GMV: '新素材 GMV', SHOOT_COUNT: '拍摄次数', CREATOR_VIDEO: '达人视频', CUSTOM: '自定义' } as Record<string, string>)[category] || category }
function priorityLabel(priority: string) { return ({ CRITICAL: '关键', HIGH: '高优先', MEDIUM: '中优先', LOW: '低优先' } as Record<string, string>)[priority] || priority }
function importStatus(status: string) { return ({ UPLOADED: '已上传', MAPPED: '已映射', VALIDATED: '已校验', CONFIRMED: '已确认', IMPORTED: '已导入', UNDONE: '已撤销', FAILED: '失败' } as Record<string, string>)[status] || status }

export default App
