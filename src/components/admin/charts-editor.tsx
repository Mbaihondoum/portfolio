'use client'

import { useState } from 'react'
import { BarChart } from '@/components/charts/bar-chart'
import { LineChart } from '@/components/charts/line-chart'
import { Button } from '@/components/ui/button'
import { Input, Select, Textarea } from '@/components/ui/field'
import type { ProjectChart } from '@/lib/types'

const newId = () => `c${Math.random().toString(36).slice(2, 8)}`

function blankChart(): ProjectChart {
  return {
    id: newId(),
    type: 'bar',
    title: { fr: '', en: '' },
    unit: '',
    labels: ['A', 'B', 'C'],
    values: [10, 20, 15],
  }
}

/**
 * Visual editor for the animated charts of a (data) project: type, bilingual
 * title, unit and label/value rows, with a live preview using the site's own
 * chart components. JSON mode kept for import/export.
 */
export function ChartsEditor({
  value,
  onChange,
  error,
}: {
  value: ProjectChart[]
  onChange: (next: ProjectChart[]) => void
  error?: string
}) {
  const [jsonMode, setJsonMode] = useState(false)
  const [jsonText, setJsonText] = useState('')
  const [jsonError, setJsonError] = useState<string | null>(null)
  const nf = new Intl.NumberFormat('fr-FR')

  const updateChart = (index: number, patch: Partial<ProjectChart>) =>
    onChange(value.map((c, i) => (i === index ? { ...c, ...patch } : c)))

  if (jsonMode) {
    return (
      <div className="flex flex-col gap-2">
        <Textarea
          aria-label="Graphiques (JSON)"
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
                const parsed = JSON.parse(jsonText)
                if (!Array.isArray(parsed)) throw new Error()
                onChange(parsed as ProjectChart[])
                setJsonMode(false)
                setJsonError(null)
              } catch {
                setJsonError('JSON invalide : attendu un tableau de graphiques')
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
      {value.map((chart, ci) => {
        const format = (v: number) => `${nf.format(v)}${chart.unit ? ` ${chart.unit}` : ''}`
        const rows = chart.labels.map((label, i) => ({ label, value: chart.values[i] ?? 0 }))
        const setRows = (next: { label: string; value: number }[]) =>
          updateChart(ci, { labels: next.map((r) => r.label), values: next.map((r) => r.value) })
        return (
          <fieldset key={chart.id} className="rounded-xl border border-border bg-background p-4">
            <legend className="px-1 text-xs font-medium text-muted">Graphique {ci + 1}</legend>
            <div className="grid gap-5 lg:grid-cols-2">
              <div className="flex flex-col gap-3">
                <div className="grid gap-2 sm:grid-cols-[8rem_1fr_1fr_5rem]">
                  <Select
                    aria-label={`Type du graphique ${ci + 1}`}
                    value={chart.type}
                    onChange={(e) =>
                      updateChart(ci, { type: e.target.value as ProjectChart['type'] })
                    }
                  >
                    <option value="bar">Barres</option>
                    <option value="line">Courbe</option>
                  </Select>
                  <Input
                    aria-label={`Titre FR du graphique ${ci + 1}`}
                    placeholder="Titre FR"
                    value={chart.title.fr}
                    onChange={(e) =>
                      updateChart(ci, { title: { ...chart.title, fr: e.target.value } })
                    }
                  />
                  <Input
                    aria-label={`Titre EN du graphique ${ci + 1}`}
                    placeholder="Title EN"
                    value={chart.title.en}
                    onChange={(e) =>
                      updateChart(ci, { title: { ...chart.title, en: e.target.value } })
                    }
                  />
                  <Input
                    aria-label={`Unité du graphique ${ci + 1}`}
                    placeholder="Unité"
                    maxLength={12}
                    value={chart.unit ?? ''}
                    onChange={(e) => updateChart(ci, { unit: e.target.value })}
                  />
                </div>
                <ul className="flex flex-col gap-1.5">
                  {rows.map((r, i) => (
                    <li key={i} className="flex gap-2">
                      <Input
                        aria-label={`Libellé ${i + 1}`}
                        value={r.label}
                        maxLength={24}
                        onChange={(e) =>
                          setRows(
                            rows.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)),
                          )
                        }
                      />
                      <Input
                        aria-label={`Valeur ${i + 1}`}
                        type="number"
                        value={r.value}
                        className="w-32"
                        onChange={(e) =>
                          setRows(
                            rows.map((x, j) =>
                              j === i ? { ...x, value: Number(e.target.value) } : x,
                            ),
                          )
                        }
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        aria-label={`Retirer la ligne ${r.label}`}
                        disabled={rows.length <= 2}
                        onClick={() => setRows(rows.filter((_, j) => j !== i))}
                      >
                        ✕
                      </Button>
                    </li>
                  ))}
                </ul>
                <div className="flex flex-wrap gap-2">
                  {rows.length < 24 && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setRows([...rows, { label: '', value: 0 }])}
                    >
                      + Ligne
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => onChange(value.filter((_, i) => i !== ci))}
                  >
                    Supprimer ce graphique
                  </Button>
                </div>
              </div>
              <div className="min-w-0">
                <p className="mb-2 text-xs font-medium text-muted">Aperçu</p>
                {chart.type === 'line' ? (
                  <LineChart
                    title={chart.title.fr || 'Aperçu'}
                    labels={chart.labels}
                    values={chart.values}
                    format={format}
                    height={200}
                  />
                ) : (
                  <BarChart
                    title={chart.title.fr || 'Aperçu'}
                    labels={chart.labels}
                    values={chart.values}
                    format={format}
                    height={200}
                  />
                )}
              </div>
            </div>
          </fieldset>
        )
      })}

      {error && <p className="text-xs text-danger">{error}</p>}

      <div className="flex flex-wrap gap-2">
        {value.length < 6 && (
          <Button size="sm" variant="secondary" onClick={() => onChange([...value, blankChart()])}>
            + Graphique
          </Button>
        )}
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
      </div>
    </div>
  )
}
