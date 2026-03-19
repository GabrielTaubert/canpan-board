CREATE TABLE IF NOT EXISTS project_members (
    project_id UUID NOT NULL,
    user_id    UUID NOT NULL,
    PRIMARY KEY (project_id, user_id),
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE CASCADE
);
