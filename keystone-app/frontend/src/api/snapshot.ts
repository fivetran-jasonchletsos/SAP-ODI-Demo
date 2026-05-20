import { useQuery } from '@tanstack/react-query'

const base = import.meta.env.BASE_URL || './'

async function load<T>(name: string): Promise<T> {
  const r = await fetch(`${base}data/${name}`)
  if (!r.ok) throw new Error(`Failed to load ${name}: ${r.status}`)
  return r.json() as Promise<T>
}

async function loadText(name: string): Promise<string> {
  const r = await fetch(`${base}data/${name}`)
  if (!r.ok) throw new Error(`Failed to load ${name}: ${r.status}`)
  return r.text()
}

export function useSnapshot<T>(name: string) {
  return useQuery({
    queryKey: ['snapshot', name],
    queryFn: () => load<T>(name),
  })
}

export function usePolicyMarkdown() {
  return useQuery({
    queryKey: ['policy-markdown'],
    queryFn: () => loadText('sap_api_policy_brief.md'),
  })
}
