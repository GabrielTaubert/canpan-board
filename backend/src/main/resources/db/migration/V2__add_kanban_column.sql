CREATE TABLE IF NOT EXISTS kanban_columns (
  id UUID PRIMARY KEY,
  project_id UUID NOT NULL,
  name TEXT NOT NULL,
  position INT NOT NULL,

  CONSTRAINT fk_kanban_project
  FOREIGN KEY (project_id)
    REFERENCES projects(id)
    ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS ux_kanban_columns_position
    ON kanban_columns( project_id, position);