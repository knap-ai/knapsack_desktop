import { useCallback, useEffect, useRef, useState } from 'react'
import { runQASuite, getQAResults, QARunResult, QATestType } from '../../../api/qa_suite'
import QAResultsDashboard from './QAResultsDashboard'

interface QASuitePanelProps {
  onInitiateSession: (prompt: string) => void
}

const TEST_TYPES: { type: QATestType; label: string; description: string }[] = [
  { type: 'smoke', label: 'Smoke Tests', description: 'AI explores key user flows' },
  { type: 'visual_regression', label: 'Visual Regression', description: 'Screenshot comparison' },
  { type: 'accessibility', label: 'Accessibility', description: 'ARIA, contrast, keyboard' },
  { type: 'console_errors', label: 'Console Errors', description: 'Browser error monitoring' },
]

export default function QASuitePanel({ onInitiateSession }: QASuitePanelProps) {
  const [devUrl, setDevUrl] = useState('http://localhost:3000')
  const [selectedTests, setSelectedTests] = useState<Set<QATestType>>(
    new Set(['smoke', 'accessibility', 'console_errors']),
  )
  const [running, setRunning] = useState(false)
  const [runId, setRunId] = useState<string | null>(null)
  const [results, setResults] = useState<QARunResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Poll for QA results
  useEffect(() => {
    if (!runId) return

    const poll = async () => {
      try {
        const result = await getQAResults(runId)
        if (result.ok && result.result) {
          setResults(result.result)
          if (['complete', 'failed'].includes(result.result.status)) {
            setRunning(false)
            if (pollRef.current) {
              clearInterval(pollRef.current)
              pollRef.current = null
            }
          }
        }
      } catch {
        // Ignore poll errors
      }
    }

    poll()
    pollRef.current = setInterval(poll, 3000)

    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current)
        pollRef.current = null
      }
    }
  }, [runId])

  const toggleTest = useCallback((type: QATestType) => {
    setSelectedTests(prev => {
      const next = new Set(prev)
      if (next.has(type)) {
        next.delete(type)
      } else {
        next.add(type)
      }
      return next
    })
  }, [])

  const handleRunQA = useCallback(async () => {
    if (!devUrl.trim() || selectedTests.size === 0) return

    setRunning(true)
    setError(null)
    setResults(null)

    try {
      const result = await runQASuite({
        dev_url: devUrl,
        test_types: Array.from(selectedTests),
      })

      if (result.ok && result.run_id) {
        setRunId(result.run_id)
      } else {
        setError(result.message || 'Failed to start QA suite')
        setRunning(false)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Network error')
      setRunning(false)
    }
  }, [devUrl, selectedTests])

  const handleFixIssue = useCallback(
    (testName: string, message: string, details?: string) => {
      const prompt = `A QA test failed on ${devUrl}:\n\nTest: ${testName}\nError: ${message}\n${details ? `\nDetails:\n${details}` : ''}\n\nPlease fix this issue.`
      onInitiateSession(prompt)
    },
    [devUrl, onInitiateSession],
  )

  return (
    <div className="DevModePanel__section">
      <div className="DevModePanel__sectionHeader" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ fontSize: 14 }}>&#128270;</span>
        <span style={{ fontWeight: 700, fontSize: 13 }}>Automated QA</span>
        {results && (
          <span
            style={{
              fontSize: 10,
              fontWeight: 600,
              padding: '2px 6px',
              borderRadius: 4,
              background:
                results.total_failed === 0
                  ? 'rgba(34,197,94,0.1)'
                  : 'rgba(220,38,38,0.1)',
              color: results.total_failed === 0 ? '#16a34a' : '#dc2626',
            }}
          >
            {results.total_passed} passed, {results.total_failed} failed
          </span>
        )}
      </div>

      {/* Dev server URL */}
      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        <input
          type="text"
          value={devUrl}
          onChange={e => setDevUrl(e.target.value)}
          placeholder="http://localhost:3000"
          style={{
            flex: 1,
            fontSize: 11,
            padding: '5px 8px',
            border: '1px solid #e0e0e0',
            borderRadius: 6,
          }}
        />
      </div>

      {/* Test type selection */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {TEST_TYPES.map(t => (
          <label
            key={t.type}
            title={t.description}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              fontSize: 10,
              cursor: 'pointer',
              padding: '3px 8px',
              borderRadius: 6,
              background: selectedTests.has(t.type)
                ? 'rgba(139,92,246,0.1)'
                : '#f5f5f5',
              color: selectedTests.has(t.type) ? '#7c3aed' : '#888',
              border: `1px solid ${selectedTests.has(t.type) ? 'rgba(139,92,246,0.2)' : '#e0e0e0'}`,
            }}
          >
            <input
              type="checkbox"
              checked={selectedTests.has(t.type)}
              onChange={() => toggleTest(t.type)}
              style={{ display: 'none' }}
            />
            {t.label}
          </label>
        ))}
      </div>

      {/* Run button */}
      <button
        onClick={handleRunQA}
        disabled={running || !devUrl.trim() || selectedTests.size === 0}
        style={{
          fontSize: 12,
          fontWeight: 600,
          padding: '8px 16px',
          border: 'none',
          borderRadius: 8,
          background:
            !running && devUrl.trim() && selectedTests.size > 0
              ? '#7c3aed'
              : '#e0e0e0',
          color:
            !running && devUrl.trim() && selectedTests.size > 0
              ? '#fff'
              : '#999',
          cursor:
            !running && devUrl.trim() && selectedTests.size > 0
              ? 'pointer'
              : 'default',
        }}
      >
        {running ? 'Running QA Suite...' : `Run ${selectedTests.size} Test${selectedTests.size !== 1 ? 's' : ''}`}
      </button>

      {error && <div className="DevModePanel__error">{error}</div>}

      {/* Results */}
      {results && (
        <QAResultsDashboard results={results} onFixIssue={handleFixIssue} />
      )}
    </div>
  )
}
