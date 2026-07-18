import type { ReactNode } from 'react'
import { AlertTriangle, CheckCircle2, CircleHelp, Database, FileWarning, Info } from 'lucide-react'

export function EvidenceBadge({ source = '演示数据', status = '待确认' }: { source?: string; status?: string }) {
  return <span className="evidence"><Database size={13} /> {source} · {status}</span>
}

export function StatusBadge({ status }: { status: string }) {
  const danger = /阻断|异常|失败|权限/.test(status)
  const warning = /待|观察|不足|优化|关注/.test(status)
  const Icon = danger ? AlertTriangle : warning ? CircleHelp : CheckCircle2
  return <span className={`status ${danger ? 'danger' : warning ? 'warning' : 'success'}`}><Icon size={13} />{status}</span>
}

export function EmptyState({ title, detail }: { title: string; detail: string }) {
  return <div className="empty"><FileWarning size={22} /><strong>{title}</strong><span>{detail}</span></div>
}

export function Notice({ children }: { children: ReactNode }) {
  return <div className="notice"><Info size={16} />{children}</div>
}

export function Metric({ label, value, note = '数据待确认', tone = 'blue' }: { label: ReactNode; value: string; note?: string; tone?: string }) {
  return <div className="metric"><span>{label}</span><strong className={tone}>{value}</strong><small>{note}</small></div>
}
