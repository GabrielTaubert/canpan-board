ALTER TABLE task_comments
    ADD CONSTRAINT fk_task_comments_user
        FOREIGN KEY (user_id)
            REFERENCES users(id)
            ON DELETE CASCADE;