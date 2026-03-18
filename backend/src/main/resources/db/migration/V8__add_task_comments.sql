CREATE TABLE task_comments (
   id UUID PRIMARY KEY,
   task_id UUID NOT NULL,
   user_id UUID NOT NULL,
   content TEXT NOT NULL,
   created_at TIMESTAMP WITH TIME ZONE NOT NULL,
   CONSTRAINT fk_task_comments_task FOREIGN KEY (task_id) REFERENCES tasks (id) ON DELETE CASCADE
);