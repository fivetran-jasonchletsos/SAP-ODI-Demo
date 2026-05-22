export interface Kpi {
  label: string
  value: string
  sublabel?: string | null
}

export interface SummaryData {
  today: string
  last_sync_at: string
  policy_excerpt: string
  kpis: Kpi[]
}

export interface RiskMapEntry {
  risk: string
  claim: string
  answer: string
  link: string
  link_label: string
}

export interface TrialBalanceRow {
  gl_account: string
  gl_account_description: string
  account_class: string
  debit_total: number
  credit_total: number
  net_balance: number
}

export interface DsoTrendPoint {
  period: string
  revenue: number
  ar: number
  dso_days: number | null
}

export interface CloseProgressPoint {
  posting_date: string
  posting_count: number
  cumulative: number
  pct_complete: number
}

export interface FinanceData {
  trial_balance: TrialBalanceRow[]
  dso_trend: DsoTrendPoint[]
  close_progress: CloseProgressPoint[]
  top_gl_postings: Array<{
    document_number: string
    posting_date: string
    gl_account: string
    gl_account_description: string
    signed_local_amount: number
    customer_id?: string | null
    vendor_id?: string | null
  }>
}

export interface SalesOrderRow {
  sales_doc_id: string
  line_item: number
  created_date: string
  customer_id: string
  customer_name: string
  material_id: string
  order_quantity: number
  order_value: number
  plant_id: string
  order_status: string
  days_to_first_bill: number | null
}

export interface O2CData {
  funnel: { created: number; billed: number; open: number }
  on_time_delivery: { on_time: number; total_closed: number; pct: number }
  blocked_orders: SalesOrderRow[]
  customer_ranking: Array<{
    customer_id: string
    customer_name: string
    revenue: number
    open_value: number
    order_count: number
  }>
  o2c_bands: Array<{ band: string; count: number }>
}

export interface SupplierRow {
  vendor_id: string
  vendor_name: string
  po_line_count: number
  total_po_value: number
  total_invoiced: number
  closed: number
  open: number
  partial: number
  three_way_match_pct: number
  supplier_grade: string
}

export interface P2PData {
  supplier_scorecard: SupplierRow[]
  three_way_exceptions: Array<{
    purchase_order_id: string
    line_item: number
    vendor_name: string
    material_id: string
    po_line_value: number
    invoiced_amount: number
    po_line_status: string
  }>
  spend_trend: Array<{ period: string; spend: number }>
  payment_term_compliance: { on_time: number; late: number; early: number }
}

export interface InventoryRow {
  material_id: string
  material_group: string
  plant_id: string
  plant_name: string
  on_hand_quantity: number
  standard_price: number
  inventory_value: number
  ttm_revenue_proxy: number
  turns: number | null
  turn_band: string
}

export interface InventoryData {
  turns_by_material: InventoryRow[]
  slow_movers: InventoryRow[]
  value_by_plant: Array<{ plant_id: string; inventory_value: number }>
  value_by_group: Array<{ material_group: string; inventory_value: number }>
}

export interface IcebergTable {
  schema: string
  table: string
  row_count: number
  format: string
  storage: string
  catalog: string
}

export interface Engine {
  name: string
  use_case: string
  sample_sql: string
}

export interface IcebergData {
  tables: IcebergTable[]
  engines: Engine[]
  lineage: {
    nodes: Array<{ id: string; label: string; group: string }>
    edges: Array<{ from: string; to: string }>
  }
  mds_vs_odi: Array<{ dimension: string; sap_bw: string; odi: string }>
}

export interface PipelineData {
  connector_status: {
    name: string
    fivetran_id: string
    state: string
    last_sync_at: string
    sync_frequency_min: number
    tables_replicated: number
  }
  layer_status: Array<{ layer: string; state: string; rows: number | null; last_run: string }>
  failure_sim: Array<{ id: string; title: string; narrative: string; would_impact: boolean }>
}

export interface AgentData {
  sample_questions: string[]
  policy_callouts: string[]
}
