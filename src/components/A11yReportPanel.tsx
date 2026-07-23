import type { Violation } from "../useA11yAudit";

interface Props {
  violations: Violation[];
  isScanning: boolean;
  enabled: boolean;
}

export function A11yReportPanel({ violations, isScanning, enabled }: Props) {
  if (!enabled) return null;

  return (
    <div style={{ position: "fixed", bottom: 16, right: 16, zIndex: 9999 }}>
      <div
        style={{
          background: violations.length > 0 ? "#7a2020" : "#1f2430",
          color: "white",
          padding: "10px 16px",
          borderRadius: 20,
          fontFamily: "sans-serif",
          fontSize: 13,
          boxShadow: "0 4px 14px rgba(0,0,0,0.35)",
          marginBottom: 8,
        }}
      >
        A11y: {violations.length} issue(s) {isScanning ? "(scanning...)" : ""}
      </div>

      <div
        style={{
          maxHeight: "60vh",
          overflowY: "auto",
          width: 340,
        }}
      >
        {/* {violations.map((v) => (
          <div
            key={v.ruleId + v.target}
            style={{
              background: '#1f2430',
              color: '#e7e9ee',
              padding: 10,
              marginBottom: 8,
              borderRadius: 8,
              fontFamily: 'sans-serif',
              fontSize: 12,
            }}
          >
            <strong>{v.ruleId}</strong>
            <p>{v.help}</p>
            <code>{v.target}</code>
          </div>
        ))} */}
        {violations.map((v) => (
          <div
            key={v.ruleId + v.target}
            style={{
              background: "#1f2430",
              color: "#e7e9ee",
              padding: 10,
              marginTop: 8,
              borderRadius: 8,
              fontFamily: "sans-serif",
              fontSize: 12,
              maxWidth: 320,
            }}
          >
            <strong>{v.ruleId}</strong>
            {v.source === "sas-custom" && (
              <span
                style={{
                  marginLeft: 6,
                  fontSize: 10,
                  fontWeight: 700,
                  background: "#2e5a9c",
                  color: "#dbe8ff",
                  borderRadius: 4,
                  padding: "1px 5px",
                }}
              >
                SAS
              </span>
            )}
            <p>{v.help}</p>
            <code>{v.target}</code>
          </div>
        ))}
      </div>
    </div>
  );
}
