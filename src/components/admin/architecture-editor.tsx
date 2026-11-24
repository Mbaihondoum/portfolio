'use client'

import { useState } from 'react'
import { ArchitectureDiagram } from '@/components/projects/architecture-diagram'
import { Button } from '@/components/ui/button'
import { Input, Select, Textarea } from '@/components/ui/field'
import {
  ARCHITECTURE_LAYERS,
  type ArchitectureDiagram as Diagram,
  type ArchitectureLayer,
} from '@/lib/types'

export const LAYER_LABELS_FR: Record<ArchitectureLayer, string> = {
  client: 'Client',
  api: 'API & logique',
  data: 'Données',
  infra: 'Infra',
  external: 'Externe',
}

const newId = () => `n${Math.random().toString(36).slice(2, 8)}`

const STARTER: Diagram = {
  nodes: [
    { id: 'web', label: 'Application web', layer: 'client' },
    { id: 'api', label: 'API', layer: 'api' },
    { id: 'db', label: 'Base de données', layer: 'data' },
  ],
  edges: [
    { from: 'web', to: 'api', label: 'HTTPS' },
    { from: 'api', to: 'db' },
  ],
}

/**
 * Visual editor for the project architecture diagram: nodes (label + layer)
 * and links, with a live preview rendered by the same component as the site.
 * A JSON mode stays available for import/export.
 */
export function ArchitectureEditor({
  value,
  onChange,
  error,
}: {
  value: Diagram | null
  onChange: (next: Diagram | null) => void
  error?: string
}) {
  const [jsonMode, setJsonMode] = useState(false)
  const [jsonText, setJsonText] = useState('')
  const [jsonError, setJsonError] = useState<string | null>(null)

  if (!value) {
    return (
      <div className="flex flex-wrap items-center gap-3">
        <p className="text-sm text-muted">Aucun schéma d’architecture.</p>
        <Button size="sm" variant="secondary" onClick={() => onChange(STARTER)}>
          + Créer un schéma
        </Button>
      </div>
    )
  }

  const nodes = value.nodes
  const update = (patch: Partial<Diagram>) => onChange({ ...value, ...patch })
  const nodeLabel = (id: string) => nodes.find((n) => n.id === id)?.label ?? id

  if (jsonMode) {
    return (
      <div className="flex flex-col gap-2">
        <Textarea
          aria-label="Schéma d’architecture (JSON)"
          rows={10}
          className="font-mono text-xs"
          value={jsonText}
          onChange={(e) => setJsonText(e.target.value)}
        />
        {jsonError && <p className="text-xs text-danger">{jsonError}</p>}
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={() => {
              try {
                const parsed = JSON.parse(jsonText) as Diagram
                if (!Array.isArray(parsed?.nodes) || !Array.isArray(parsed?.edges))
                  throw new Error()
                onChange(parsed)
                setJsonMode(false)
                setJsonError(null)
              } catch {
                setJsonError('JSON invalide : attendu { "nodes": [...], "edges": [...] }')
              }
            }}
          >
            Appliquer
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setJsonMode(false)}>
            Annuler
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="grid gap-5 lg:grid-cols-2">
        <div>
          <p className="mb-2 text-xs font-medium text-muted">Blocs</p>
          <ul className="flex flex-col gap-2">
            {nodes.map((n, i) => (
              <li key={n.id} className="flex gap-2">
                <Input
                  aria-label={`Libellé du bloc ${i + 1}`}
                  value={n.label}
                  maxLength={60}
                  onChange={(e) =>
                    update({
                      nodes: nodes.map((x) =>
                        x.id === n.id ? { ...x, label: e.target.value } : x,
                      ),
                    })
                  }
                />
                <Select
                  aria-label={`Couche du bloc ${i + 1}`}
                  value={n.layer}
                  className="w-40"
                  onChange={(e) =>
                    update({
                      nodes: nodes.map((x) =>
                        x.id === n.id ? { ...x, layer: e.target.value as ArchitectureLayer } : x,
                      ),
                    })
                  }
                >
                  {ARCHITECTURE_LAYERS.map((l) => (
                    <option key={l} value={l}>
                      {LAYER_LABELS_FR[l]}
                    </option>
                  ))}
                </Select>
                <Button
                  size="sm"
                  variant="ghost"
                  aria-label={`Retirer le bloc ${n.label}`}
                  onClick={() =>
                    update({
                      nodes: nodes.filter((x) => x.id !== n.id),
                      edges: value.edges.filter((e) => e.from !== n.id && e.to !== n.id),
                    })
                  }
                >
                  ✕
                </Button>
              </li>
            ))}
          </ul>
          {nodes.length < 20 && (
            <Button
              size="sm"
              variant="secondary"
              className="mt-2"
              onClick={() =>
                update({ nodes: [...nodes, { id: newId(), label: 'Nouveau bloc', layer: 'api' }] })
              }
            >
              + Bloc
            </Button>
          )}
        </div>

        <div>
          <p className="mb-2 text-xs font-medium text-muted">Liens (flux de données)</p>
          <ul className="flex flex-col gap-2">
            {value.edges.map((e, i) => (
              <li key={i} className="flex gap-2">
                {(['from', 'to'] as const).map((side) => (
                  <Select
                    key={side}
                    aria-label={`${side === 'from' ? 'Origine' : 'Destination'} du lien ${i + 1}`}
                    value={e[side]}
                    onChange={(ev) =>
                      update({
                        edges: value.edges.map((x, j) =>
                          j === i ? { ...x, [side]: ev.target.value } : x,
                        ),
                      })
                    }
                  >
                    {nodes.map((n) => (
                      <option key={n.id} value={n.id}>
                        {n.label}
                      </option>
                    ))}
                  </Select>
                ))}
                <Input
                  aria-label={`Libellé du lien ${i + 1}`}
                  placeholder="ex. HTTPS"
                  maxLength={40}
                  value={e.label ?? ''}
                  onChange={(ev) =>
                    update({
                      edges: value.edges.map((x, j) =>
                        j === i ? { ...x, label: ev.target.value || undefined } : x,
                      ),
                    })
                  }
                  className="w-28"
                />
                <Button
                  size="sm"
                  variant="ghost"
                  aria-label={`Retirer le lien ${nodeLabel(e.from)} → ${nodeLabel(e.to)}`}
                  onClick={() => update({ edges: value.edges.filter((_, j) => j !== i) })}
                >
                  ✕
                </Button>
              </li>
            ))}
          </ul>
          {nodes.length >= 2 && value.edges.length < 40 && (
            <Button
              size="sm"
              variant="secondary"
              className="mt-2"
              onClick={() =>
                update({ edges: [...value.edges, { from: nodes[0]!.id, to: nodes[1]!.id }] })
              }
            >
              + Lien
            </Button>
          )}
        </div>
      </div>

      {error && <p className="text-xs text-danger">{error}</p>}

      <div>
        <p className="mb-2 text-xs font-medium text-muted">Aperçu</p>
        <div className="rounded-xl border border-border bg-background p-3">
          {nodes.length ? (
            <ArchitectureDiagram
              diagram={value}
              layerLabels={LAYER_LABELS_FR}
              title="Aperçu du schéma"
            />
          ) : (
            <p className="py-6 text-center text-sm text-subtle">Ajoutez un bloc.</p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            setJsonText(JSON.stringify(value, null, 2))
            setJsonMode(true)
          }}
        >
          Mode JSON (import / export)
        </Button>
        <Button size="sm" variant="danger" onClick={() => onChange(null)}>
          Supprimer le schéma
        </Button>
      </div>
    </div>
  )
}
