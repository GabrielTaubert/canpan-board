CREATE TABLE notifications (
   id UUID PRIMARY KEY,
   user_id UUID NOT NULL,
   message TEXT NOT NULL,
   is_read BOOLEAN DEFAULT FALSE,
   created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
   CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);