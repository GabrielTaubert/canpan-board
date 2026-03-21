ALTER TABLE tasks
    ADD CONSTRAINT fk_tasks_assigned_to
        FOREIGN KEY (assigned_to)
            REFERENCES users(id)
            ON DELETE SET NULL;