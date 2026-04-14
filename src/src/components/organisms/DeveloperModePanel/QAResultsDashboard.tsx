import { useState } from 'react'
import { QARunResult, QATestResult } from '../../../api/qa_suite'

interface QAResultsDashboardProps {
  results: QARunResult
  onFixIssue: (testName: string, message: string, details?: string) => void
}

export default function QAResultsDashboard({ results, onFixIssue }: QAResultsDashboardProps) {
  const [expandedTest, setExpandedTest] = useState<number | null>(null)

  const toggleExpand = (index: number) => {
    setExpandedTest(prev => (prev === index ? null : index))
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {/* Summary bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '6px 10px',
          borderRadius: 6,
          background: results.total_failed === 0 ? 'rgba(34,197,94,0.05)' : 'rgba(220,38,38,0.05)',
          border: `1px solid ${results.total_failed === 0 ? 'rgba(34,197,94,0.15)' : 'rgba(220,38,38,0.15)'}`,
          fontSize: 11,
        }}
      >
        <span style={{ fontWeight: 600 }}>
          {results.status === 'running' ? 'Running...' : results.total_failed === 0 ? 'All tests passed' : `${results.total_failed} issue${results.total_failed !== 1 ? 's' : ''} found`}
        </span>
        <span style={{ color: '#999' }}>
          {results.results.length} test{results.results.length !== 1 ? 's' : ''} run
        </span>
      </div>

      {/* Individual results */}
      {results.results.map((test: QATestResult, idx: number) => (
        <div
          key={idx}
          style={{
            padding: '6px 10px',
            borderRadius: 6,
            background: test.passed ? '#fafafa' : 'rgba(220,38,38,0.03)',
            border: `1px solid ${test.passed ? '#eee' : 'rgba(220,38,38,0.12)'}`,
          }}
        >
          <div
            onClick={() => toggleExpand(idx)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11 }}>
              <span>{test.passed ? '\u2705' : '\u274C'}</span>
              <span style={{ fontWeight: 600 }}>{test.name}</span>
              <span
                style={{
                  fontSize: 9,
                  padding: '1px 4px',
                  borderRadius: 3,
                  background: '#f0f0f0',
                  color: '#888',
                }}
              >
                {test.test_type}
              </span>
            </div>
            {!test.passed && (
              <button
                onClick={e => {
                  e.stopPropagation()
                  onFixIssue(test.name, test.message, test.details)
                }}
                style={{
                  fontSize: 10,
                  padding: '2px 8px',
                  border: '1px solid #7c3aed',
                  borderRadius: 4,
                  background: '#fff',
                  color: '#7c3aed',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                Fix This
              </button>
            )}
          </div>

          {/* Message */}
          {!test.passed && (
            <div
              style={{
                marginTop: 4,
                fontSize: 10,
                color: '#dc2626',
                fontFamily: "'SF Mono', 'Fira Code', monospace",
              }}
            >
              {test.message}
            </div>
          )}

          {/* Expandable details */}
          {expandedTest === idx && test.details && (
            <div
              style={{
                marginTop: 6,
                fontSize: 10,
                color: '#666',
                background: '#f8f8f8',
                padding: '6px 8px',
                borderRadius: 4,
                maxHeight: 150,
                overflowY: 'auto',
                whiteSpace: 'pre-wrap',
                fontFamily: "'SF Mono', 'Fira Code', monospace",
              }}
            >
              {test.details}
            </div>
          )}

          {/* Screenshot */}
          {expandedTest === idx && test.screenshot_base64 && (
            <div style={{ marginTop: 6 }}>
              <img
                src={`data:image/png;base64,${test.screenshot_base64}`}
                alt={`Screenshot for ${test.name}`}
                style={{
                  maxWidth: '100%',
                  borderRadius: 4,
                  border: '1px solid #eee',
                }}
              />
            </div>
          )}
        </div>
      ))}

      {/* Summary text */}
      {results.summary && (
        <div
          style={{
            fontSize: 10,
            color: '#666',
            padding: '6px 10px',
            background: '#fafafa',
            borderRadius: 6,
            lineHeight: 1.5,
          }}
        >
          {results.summary}
        </div>
      )}
    </div>
  )
}
