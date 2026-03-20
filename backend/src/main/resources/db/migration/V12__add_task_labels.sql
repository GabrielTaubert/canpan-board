CREATE TABLE task_labels (
    id UUID PRIMARY KEY,
    task_id UUID NOT NULL,
    label_text VARCHAR(255) NOT NULL,
    color VARCHAR(20) NOT NULL,
    CONSTRAINT fk_task FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
);