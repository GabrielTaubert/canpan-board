CREATE TYPE task_status AS ENUM ('TODO', 'IN_PROGRESS', 'DONE');
CREATE TYPE task_priority AS ENUM ('LOW', 'MEDIUM', 'HIGH');

CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY,
    column_id UUID NOT NULL,

    title TEXT NOT NULL,
    description TEXT,

    status task_status NOT NULL DEFAULT 'TODO',
    priority task_priority NOT NULL DEFAULT 'MEDIUM',

    assigned_to UUID, --Member

    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP,

  CONSTRAINT fk_kanban_can_col
  FOREIGN KEY (column_id)
    REFERENCES kanban_columns(id)
    ON DELETE RESTRICT
);