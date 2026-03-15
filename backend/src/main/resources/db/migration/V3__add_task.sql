CREATE TYPE task_priority AS ENUM ('LOW', 'MEDIUM', 'HIGH');

CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY,
    column_id UUID NOT NULL,

    title TEXT NOT NULL,
    description TEXT,

    priority task_priority NOT NULL DEFAULT 'MEDIUM',

    storypoints INTEGER DEFAULT 1,

    assigned_to UUID, --Member

    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE,

  CONSTRAINT fk_kanban_can_col
  FOREIGN KEY (column_id)
    REFERENCES kanban_columns(id)
    ON DELETE RESTRICT
);