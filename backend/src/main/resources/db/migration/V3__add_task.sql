CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY,
    project_id UUID NOT NULL,
    column_id UUID NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    assigned_to UUID, --Member

  CONSTRAINT fk_kanban_project
  FOREIGN KEY (project_id)
    REFERENCES projects(id)
    ON DELETE RESTRICT,

  CONSTRAINT fk_kanban_can_col
  FOREIGN KEY (column_id)
    REFERENCES kanban_columns(id)
    ON DELETE RESTRICT
);