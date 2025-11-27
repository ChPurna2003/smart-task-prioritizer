import React, { useState } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import Select from "react-select";

/* ---------------------------------------
   UI STYLES
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
  marginTop: "16px",
  padding: "12px 18px",
  background: "#0d5dc0",
  color: "white",
  border: "none",
  borderRadius: "10px",
  fontSize: "15px",
  cursor: "pointer",
  width: "100%",
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
   MAIN PAGE
----------------------------------------- */

export default function Home() {
  const [activeTab, setActiveTab] = useState("guide");
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

  /* ---------------------------------------
      ADD TASK
  ----------------------------------------- */
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

  /* ---------------------------------------
      ANALYZE TASKS
  ----------------------------------------- */
  const analyzeTasks = async () => {
    if (tasks.length === 0) {
      alert("Add at least one task!");
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post(
        "http://127.0.0.1:8000/api/tasks/analyze/?mode=smart_balance",
        tasks
      );
      setResults(res.data);
      setActiveTab("app");
    } catch (err) {
      console.log(err);
      alert("Backend error — check your backend terminal.");
    }

    setLoading(false);
  };

  /* ---------------------------------------
      MAIN CONTAINER
  ----------------------------------------- */
  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100vw",
        background: "#f3f5fb",
        display: "flex",
        justifyContent: "center",
        padding: "40px 20px",
      }}
    >
      <div style={{ width: "100%", maxWidth: "900px" }}>
        {/* HEADER */}
        <header style={{ textAlign: "center", marginBottom: "28px" }}>
          <h1 style={{ margin: 0, fontSize: "32px", color: "#12355b" }}>
            Smart Task Prioritizer
          </h1>
          <p style={{ color: "#6a7b99", marginTop: "6px" }}>
            Rate tasks → Get a smart execution order.
          </p>
        </header>

        {/* TABS */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}>
          <TabButton
            label="Guide"
            active={activeTab === "guide"}
            onClick={() => setActiveTab("guide")}
          />
          <TabButton
            label="Task Prioritizer"
            active={activeTab === "app"}
            onClick={() => setActiveTab("app")}
          />
        </div>

        {/* CARD */}
        <div
          style={{
            background: "white",
            borderRadius: "20px",
            padding: "32px 28px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
            border: "1px solid rgba(210,220,255,0.6)",
          }}
        >
          {activeTab === "guide" ? (
            <GuidePage />
          ) : (
            <TaskPage
              taskInput={taskInput}
              setTaskInput={setTaskInput}
              addTask={addTask}
              tasks={tasks}
              analyzeTasks={analyzeTasks}
              results={results}
              loading={loading}
            />
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------
   TAB BUTTON
----------------------------------------- */

function TabButton({ active, label, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "12px 26px",
        background: "transparent",
        border: "none",
        borderBottom: active ? "3px solid #145da0" : "3px solid transparent",
        color: active ? "#145da0" : "#6b7a99",
        cursor: "pointer",
        fontSize: "15px",
        fontWeight: active ? 700 : 500,
      }}
    >
      {label}
    </button>
  );
}

/* ---------------------------------------
   GUIDE PAGE
----------------------------------------- */

function GuidePage() {
  return (
    <div>
      <h2 style={{ color: "#12355b" }}>Task Rating Guide</h2>

      <GuideSection title="Importance (1–10)">
        <div style={chip}>1–3 • Low importance</div>
        <div style={chip}>4–6 • Medium</div>
        <div style={chip}>7–8 • High</div>
        <div style={chip}>9–10 • Critical</div>
      </GuideSection>

      <GuideSection title="Estimated Hours">
        <div style={chip}>0–2 hrs • Quick win</div>
        <div style={chip}>3–6 hrs • Moderate</div>
        <div style={chip}>6+ hrs • Large task</div>
      </GuideSection>

      <GuideSection title="Urgency by Due Date">
        <div style={chip}>Overdue • Highest urgency</div>
        <div style={chip}>Due today • Critical</div>
        <div style={chip}>0–3 days • Urgent</div>
        <div style={chip}>This week • Medium</div>
        <div style={chip}>&gt; 1 week • Lower urgency</div>
      </GuideSection>
    </div>
  );
}

function GuideSection({ title, children }) {
  return (
    <div style={{ marginBottom: "26px" }}>
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
   TASK PAGE
----------------------------------------- */

function TaskPage({
  taskInput,
  setTaskInput,
  addTask,
  tasks,
  analyzeTasks,
  results,
  loading,
}) {
  return (
    <div>
      <h2 style={{ color: "#12355b" }}>Task Prioritizer</h2>

      <p style={{ color: "#6b7a99", marginBottom: "20px" }}>
        Add tasks → Click <b>Analyze</b> → See smart ordering.
      </p>

      {/* ADD TASK FORM */}
      <div
        style={{
          border: "1px solid #e0e5f2",
          padding: "18px",
          borderRadius: "14px",
          marginBottom: "24px",
        }}
      >
        <h3 style={{ marginBottom: "14px", color: "#23406a" }}>+ Add Task</h3>

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
            placeholder="Task ID"
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

          {/* DATE PICKER */}
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
            />
          </div>

          {/* DEPENDENCIES MULTISELECT */}
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
              placeholder="Select dependencies"
              styles={{
                control: (base) => ({
                  ...base,
                  borderRadius: "10px",
                  borderColor: "#b4c6f0",
                  padding: "4px",
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
                multiValueRemove: (base) => ({
                  ...base,
                  color: "#1b2f52",
                  ":hover": {
                    backgroundColor: "#0d5dc0",
                    color: "white",
                  },
                }),
              }}
            />
          </div>
        </div>

        <button style={primaryButton} onClick={addTask}>
          Add Task
        </button>
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
          <h3 style={{ marginBottom: "12px" }}>
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
                Importance {t.importance} · {t.estimated_hours || "?"} hrs ·{" "}
                {t.due_date || "No date"}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ANALYZE BUTTON */}
      <button onClick={analyzeTasks} style={primaryButton} disabled={loading}>
        {loading ? "Analyzing..." : "🚀 Analyze Tasks"}
      </button>

      {/* RESULTS */}
      {results.length > 0 && (
        <div style={{ marginTop: "20px" }}>
          <h3>📊 Prioritized Results</h3>
          {results.map((r, index) => (
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
                  marginBottom: "6px",
                }}
              >
                <strong>
                  {index + 1}. {r.title}
                </strong>
                <span style={{ color: "#0d5dc0" }}>Score: {r.score}</span>
              </div>
              <div style={{ color: "#6b7a99", fontSize: "13px" }}>
                {r.explanation}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
