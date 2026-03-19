package de.uni.canpan.backend.model;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "task_comments")
public class TaskComment {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "task_id", nullable = false)
    private Task task;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    protected TaskComment() {}

    public TaskComment(Task task, UUID userId, String content) {
        this.task = task;
        this.userId = userId;
        this.content = content;
    }

    @PrePersist
    protected void onCreate() {
        createdAt = OffsetDateTime.now();
    }

    public UUID getId() { return id; }
    public Task getTask() { return task; }
    public UUID getUserId() { return userId; }
    public String getContent() { return content; }
    public OffsetDateTime getCreatedAt() { return createdAt; }

    public void setContent(String content) { this.content = content; }
}