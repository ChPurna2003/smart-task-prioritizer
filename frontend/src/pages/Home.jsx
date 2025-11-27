import React, { useState } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import Select from "react-select";
import "react-datepicker/dist/react-datepicker.css";

/* ---------------------------------------
   SHARED UI STYLES
----------------------------------------- */

const inputStyle = {
  padding: "12px 14px",
  borderRadius: "10px",
  border: "1px solid #b4c6f0",
  fontSize: "15px",
  background: "#ffffff",
  color: "#12263a",
  outline: "none",
  width: "100%",
  boxSizing: "border-box",
};

const primaryButton = {
  padding: "12px 18px",
  background: "#0d5dc0",
  color: "white",
  border: "none",
  borderRadius: "10px",
  fontSize: "15px",
  cursor: "pointer",
};

const secondaryButton = {
  padding: "10px 16px",
  background: "white",
  color: "#145da0",
  border: "1px solid #c5d3f5",
  borderRadius: "10px",
  fontSize: "14px",
  cursor: "pointer",
};

const chip = {
  padding: "10px 14px",
  borderRadius: "10px",
  background: "#eef2ff",
  border: "1px solid #cdd6ff",
  fontSize: "14px",
  fontWeight: 500,
  color: "#1b2f52",
  boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
};

/* ---------------------------------------
   MAIN HOME (3-STEP FLOW)
----------------------------------------- */

export default function Home() {
  const [step, setStep] = useState(1); // 1 = Guide, 2 = Add Tasks, 3 = Results
  const [tasks, setTasks] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const [taskInput, setTaskInput] = useState({
    id: "",
    title: "",
    importance: "",
    estimated_hours: "",
    due_date: "",
    dependencies: [],
  });

  /* ---------------- ADD TASK ---------------- */

  const addTask = () => {
    if (!taskInput.id || !taskInput.title) {
      alert("Please enter Task ID and Title.");
      return;
    }

    setTasks((prev) => [
      ...prev,
      {
        id: taskInput.id.trim(),
        title: taskInput.title.trim(),
        importance: Number(taskInput.importance),
        estimated_hours: taskInput.estimated_hours
          ? Number(taskInput.estimated_hours)
          : null,
        due_date: taskInput.due_date || null,
        dependencies: taskInput.dependencies,
      },
    ]);

    setTaskInput({
      id: "",
      title: "",
      importance: "",
      estimated_hours: "",
      due_date: "",
      dependencies: [],
    });
  };

  /* ---------------- ANALYZE TASKS ---------------- */

  const analyzeTasks = async () => {
    if (tasks.length === 0) {
      alert("Add at least one task!");
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post(
        https://smart-task-prioritizer.onrender.com/api/tasks/analyze/,
        tasks
      );
      setResults(res.data);
      setStep(3); // go to results page
    } catch (err) {
      console.error(err);
      alert("Backend error — check your backend terminal.");
    }

    setLoading(false);
  };

  /* ---------------- LAYOUT WRAPPER ---------------- */

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100vw",
        background: "#f3f5fb",
        display: "flex",
        justifyContent: "center",
        padding: "40px 20px",
        boxSizing: "border-box",
      }}
    >
      <div style={{ width: "100%", maxWidth: "960px" }}>
        {/* HEADER */}
        <header style={{ marginBottom: "24px" }}>
          <h1
            style={{
              margin: 0,
              fontSize: "32px",
              color: "#12355b",
              textAlign: "left",
            }}
          >
            Smart Task Prioritizer
          </h1>
          <p style={{ color: "#6a7b99", marginTop: "6px", fontSize: "14px" }}>
            A small decision engine to score tasks by importance, effort and
            deadlines.
          </p>
        </header>

        {/* STEP INDICATOR */}
        <StepIndicator step={step} />

        {/* WHITE CARD */}
        <div
          style={{
            marginTop: "16px",
            background: "white",
            borderRadius: "20px",
            padding: "28px 26px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
            border: "1px solid rgba(210,220,255,0.7)",
          }}
        >
          {step === 1 && (
            <GuideStep
              onNext={() => setStep(2)}
            />
          )}

          {step === 2 && (
            <TaskInputStep
              taskInput={taskInput}
              setTaskInput={setTaskInput}
              tasks={tasks}
              addTask={addTask}
              onBack={() => setStep(1)}
              onAnalyze={analyzeTasks}
              loading={loading}
            />
          )}

          {step === 3 && (
            <ResultsStep
              results={results}
              tasks={tasks}
              onBack={() => setStep(2)}
            />
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------
   STEP INDICATOR
----------------------------------------- */

function StepIndicator({ step }) {
  const steps = [
    { id: 1, label: "Guide" },
    { id: 2, label: "Add Tasks" },
    { id: 3, label: "Analyze Results" },
  ];

  return (
    <div
      style={{
        display: "flex",
        gap: "10px",
        fontSize: "13px",
        color: "#6b7a99",
      }}
    >
      {steps.map((s, index) => {
        const isActive = s.id === step;
        const isCompleted = s.id < step;

        return (
          <div
            key={s.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <div
              style={{
                width: 26,
                height: 26,
                borderRadius: "999px",
                border: isActive
                  ? "2px solid #145da0"
                  : "1px solid #c5d3f5",
                background: isCompleted
                  ? "#145da0"
                  : isActive
                  ? "#e3edff"
                  : "white",
                color: isCompleted ? "white" : "#145da0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 600,
                fontSize: "13px",
              }}
            >
              {s.id}
            </div>
            <span
              style={{
                fontWeight: isActive ? 600 : 500,
                color: isActive ? "#12355b" : "#6b7a99",
              }}
            >
              {s.label}
            </span>
            {index < steps.length - 1 && (
              <div
                style={{
                  flex: 1,
                  height: 1,
                  background:
                    step > s.id ? "#145da0" : "rgba(197,211,245,0.8)",
                  margin: "0 6px",
                  minWidth: 40,
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ---------------------------------------
   STEP 1 — GUIDE
----------------------------------------- */

function GuideStep({ onNext }) {
  return (
    <div>
      <h2 style={{ color: "#12355b", marginTop: 0, marginBottom: "16px" }}>
        1. How to rate your tasks
      </h2>

      <p
        style={{
          color: "#6b7a99",
          marginBottom: "22px",
          fontSize: "14px",
          maxWidth: "620px",
        }}
      >
        Use this once to understand the scoring. In the next step you’ll add
        your real tasks and the system will calculate a priority score for
        each one.
      </p>

      <GuideSection title="Importance (1–10)">
        <div style={chip}>1–3 • Low importance</div>
        <div style={chip}>4–6 • Medium importance</div>
        <div style={chip}>7–8 • High importance</div>
        <div style={chip}>9–10 • Critical importance</div>
      </GuideSection>

      <GuideSection title="Estimated Hours">
        <div style={chip}>0–2 hrs • Quick win</div>
        <div style={chip}>3–6 hrs • Moderate task</div>
        <div style={chip}>6+ hrs • Large task</div>
      </GuideSection>

      <GuideSection title="Urgency by Due Date">
        <div style={chip}>Overdue • Highest urgency</div>
        <div style={chip}>Due today • Critical</div>
        <div style={chip}>0–3 days • Urgent</div>
        <div style={chip}>This week • Medium</div>
        <div style={chip}>&gt; 1 week • Lower urgency</div>
      </GuideSection>

      <div
        style={{
          marginTop: "26px",
          display: "flex",
          justifyContent: "flex-end",
        }}
      >
        <button
          style={primaryButton}
          onClick={onNext}
        >
          Next → Add Tasks
        </button>
      </div>
    </div>
  );
}

function GuideSection({ title, children }) {
  return (
    <div style={{ marginBottom: "24px" }}>
      <h3 style={{ color: "#23406a", marginBottom: "10px" }}>{title}</h3>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "10px",
        }}
      >
        {children}
      </div>
    </div>
  );
}

/* ---------------------------------------
   STEP 2 — TASK INPUT
----------------------------------------- */

function TaskInputStep({
  taskInput,
  setTaskInput,
  addTask,
  tasks,
  onBack,
  onAnalyze,
  loading,
}) {
  return (
    <div>
      <div
        style={{
          marginBottom: "16px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: "12px",
        }}
      >
        <div>
          <h2
            style={{
              color: "#12355b",
              marginTop: 0,
              marginBottom: "6px",
            }}
          >
            2. Add your tasks
          </h2>
          <p
            style={{
              color: "#6b7a99",
              fontSize: "14px",
              margin: 0,
            }}
          >
            Create individual tasks with ID, title, importance, effort and
            optional dependencies.
          </p>
        </div>

        <button style={secondaryButton} onClick={onBack}>
          ← Back to Guide
        </button>
      </div>

      {/* ADD TASK FORM */}
      <div
        style={{
          border: "1px solid #e0e5f2",
          padding: "18px",
          borderRadius: "14px",
          marginBottom: "24px",
        }}
      >
        <h3 style={{ marginBottom: "14px", color: "#23406a", marginTop: 0 }}>
          + Add Task
        </h3>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "12px",
          }}
        >
          {/* Task ID */}
          <input
            style={inputStyle}
            placeholder="Task ID (e.g. T1)"
            value={taskInput.id}
            onChange={(e) =>
              setTaskInput({ ...taskInput, id: e.target.value })
            }
          />

          {/* Title */}
          <input
            style={inputStyle}
            placeholder="Task Title"
            value={taskInput.title}
            onChange={(e) =>
              setTaskInput({ ...taskInput, title: e.target.value })
            }
          />

          {/* Importance */}
          <input
            type="number"
            style={inputStyle}
            placeholder="Importance (1–10)"
            value={taskInput.importance}
            onChange={(e) =>
              setTaskInput({ ...taskInput, importance: e.target.value })
            }
          />

          {/* Hours */}
          <input
            type="number"
            style={inputStyle}
            placeholder="Estimated Hours"
            value={taskInput.estimated_hours}
            onChange={(e) =>
              setTaskInput({
                ...taskInput,
                estimated_hours: e.target.value,
              })
            }
          />

          {/* Date Picker */}
          <div style={{ width: "100%" }}>
            <DatePicker
              selected={
                taskInput.due_date ? new Date(taskInput.due_date) : null
              }
              onChange={(date) =>
                setTaskInput({
                  ...taskInput,
                  due_date: date
                    ? date.toISOString().split("T")[0]
                    : "",
                })
              }
              placeholderText="Select due date"
              className="date-input"
              dateFormat="yyyy-MM-dd"
              wrapperClassName="date-picker-wrapper"
            />
          </div>

          {/* Dependencies Multiselect */}
          <div style={{ width: "100%" }}>
            <Select
              isMulti
              options={tasks.map((t) => ({
                value: t.id,
                label: `${t.id} — ${t.title}`,
              }))}
              value={taskInput.dependencies.map((id) => ({
                value: id,
                label: `${id} — ${
                  tasks.find((t) => t.id === id)?.title || ""
                }`,
              }))}
              onChange={(selected) =>
                setTaskInput({
                  ...taskInput,
                  dependencies: selected ? selected.map((s) => s.value) : [],
                })
              }
              placeholder="Select dependencies (optional)"
              styles={{
                control: (base) => ({
                  ...base,
                  borderRadius: "10px",
                  borderColor: "#b4c6f0",
                  padding: "2px",
                  fontSize: "14px",
                  "&:hover": {
                    borderColor: "#8aa8e0",
                  },
                }),
                multiValue: (base) => ({
                  ...base,
                  backgroundColor: "#eef2ff",
                  borderRadius: "8px",
                }),
                multiValueLabel: (base) => ({
                  ...base,
                  color: "#1b2f52",
                  fontWeight: 500,
                }),
              }}
            />
          </div>
        </div>

        <div style={{ marginTop: "16px" }}>
          <button style={primaryButton} onClick={addTask}>
            Add Task
          </button>
        </div>
      </div>

      {/* TASK LIST */}
      {tasks.length > 0 && (
        <div
          style={{
            border: "1px solid #e0e5f2",
            padding: "18px",
            borderRadius: "14px",
            marginBottom: "24px",
          }}
        >
          <h3 style={{ marginBottom: "12px", marginTop: 0 }}>
            📋 Current Tasks ({tasks.length})
          </h3>
          {tasks.map((t) => (
            <div
              key={t.id}
              style={{
                padding: "10px 0",
                borderBottom: "1px solid #edf0f7",
              }}
            >
              <strong>{t.title}</strong> <span>· {t.id}</span>
              <div style={{ fontSize: "13px", color: "#6b7a99" }}>
                Importance {t.importance || "?"} ·{" "}
                {t.estimated_hours || "?"} hrs ·{" "}
                {t.due_date || "No date"} ·{" "}
                {t.dependencies.length > 0
                  ? `Depends on ${t.dependencies.join(", ")}`
                  : "No dependencies"}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ANALYZE CTA */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: "10px",
          alignItems: "center",
        }}
      >
        <span
          style={{
            fontSize: "12px",
            color: "#6b7a99",
          }}
        >
          When you’re done adding tasks, run the analyzer.
        </span>
        <button
          onClick={onAnalyze}
          style={primaryButton}
          disabled={loading}
        >
          {loading ? "Analyzing..." : "🚀 Analyze & View Results"}
        </button>
      </div>
    </div>
  );
}

/* ---------------------------------------
   STEP 3 — RESULTS
----------------------------------------- */

function ResultsStep({ results, tasks, onBack }) {
  return (
    <div>
      <div
        style={{
          marginBottom: "16px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: "12px",
        }}
      >
        <div>
          <h2
            style={{
              color: "#12355b",
              marginTop: 0,
              marginBottom: "6px",
            }}
          >
            3. Recommended execution order
          </h2>
          <p
            style={{
              color: "#6b7a99",
              fontSize: "14px",
              margin: 0,
            }}
          >
            Tasks are sorted by the priority score computed by the backend
            (urgency, importance, effort, dependencies).
          </p>
        </div>

        <button style={secondaryButton} onClick={onBack}>
          ← Back to Tasks
        </button>
      </div>

      {results.length === 0 ? (
        <div
          style={{
            border: "1px dashed #c5d3f5",
            padding: "20px",
            borderRadius: "14px",
            textAlign: "center",
            color: "#6b7a99",
            fontSize: "14px",
          }}
        >
          No results yet. Go back, add tasks and click{" "}
          <b>“Analyze &amp; View Results”</b>.
        </div>
      ) : (
        <div>
          {results.map((r, index) => {
            // Simple visual priority indicator
            let badgeColor = "#d1e7ff";
            let badgeText = "Medium";

            if (r.score >= 60) {
              badgeColor = "#ffe1e1";
              badgeText = "High";
            } else if (r.score <= 30) {
              badgeColor = "#e3fbe3";
              badgeText = "Low";
            }

            const original = tasks.find((t) => t.id === r.id);

            return (
              <div
                key={r.id}
                style={{
                  border: "1px solid #e0e5f2",
                  padding: "16px",
                  borderRadius: "12px",
                  background: "#f9fbff",
                  marginBottom: "12px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "6px",
                  }}
                >
                  <div>
                    <strong>
                      {index + 1}. {r.title}
                    </strong>{" "}
                    <span style={{ color: "#7b879a", fontSize: "13px" }}>
                      · {r.id}
                    </span>
                  </div>

                  <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    <span
                      style={{
                        padding: "4px 10px",
                        borderRadius: "999px",
                        background: badgeColor,
                        fontSize: "12px",
                        fontWeight: 600,
                        color: "#25324b",
                      }}
                    >
                      {badgeText} priority
                    </span>
                    <span
                      style={{
                        color: "#0d5dc0",
                        fontWeight: 600,
                        fontSize: "14px",
                      }}
                    >
                      Score: {r.score}
                    </span>
                  </div>
                </div>

                {/* details row */}
                <div
                  style={{
                    fontSize: "12px",
                    color: "#6b7a99",
                    marginBottom: "6px",
                  }}
                >
                  Importance: {original?.importance ?? "?"} · Effort:{" "}
                  {original?.estimated_hours ?? "?"} hrs · Due:{" "}
                  {original?.due_date || "No date"} ·{" "}
                  {original?.dependencies?.length
                    ? `Depends on ${original.dependencies.join(", ")}`
                    : "No dependencies"}
                </div>

                <div
                  style={{
                    color: "#5d6b89",
                    fontSize: "13px",
                    lineHeight: 1.4,
                  }}
                >
                  {r.explanation}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
