CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY,
    name TEXT NOT NULL
    -- admin_id UUID NOT NULL --member_id

--   CONSTRAINT fk_kanban_member
--   FOREIGN KEY (admin_id)
--     REFERENCES member(id)
--     ON DELETE RESTRICT
);