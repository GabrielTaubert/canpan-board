package de.uni.canpan.backend.model;


import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "tasks")
public class Task {

    public enum TaskPriority {
        LOW, MEDIUM, HIGH
    }

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "column_id", nullable = false)
    private KanbanColumn column;

    @Column(nullable = false)
    private String title;

    @Column
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, name = "priority")
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    private TaskPriority priority;

    @Column(nullable = false)
    private Integer storypoints;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_to")
    private User assignedTo;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;

    @OneToMany(mappedBy = "task", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<TaskAttachment> attachments = new ArrayList<>();

    @Column(nullable = false)
    private boolean archived = false;

    protected Task() {};

    public Task(
            KanbanColumn column,
            String title,
            String description,
            TaskPriority priority,
            Integer storypoints,
            User assignedTo) {
        this.column = column;
        this.title = title;
        this.description = description;
        this.priority = priority;
        this.storypoints = storypoints;
        this.assignedTo = assignedTo;
    }

    @PrePersist
    protected void onCreate() {
        createdAt = OffsetDateTime.now();
        updatedAt = null;
        if (priority == null) priority = TaskPriority.MEDIUM;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = OffsetDateTime.now();
    }

    public UUID getId() { return id; }

    public KanbanColumn getColumn() { return column; }
    public void setColumn(KanbanColumn column) { this.column = column; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public TaskPriority getPriority() { return priority; }
    public void setPriority(TaskPriority priority) { this.priority = priority; }

    public Integer getStorypoints() {return storypoints;}
    public void setStorypoints(Integer storypoints) { this.storypoints = storypoints;}

    public User getAssignedTo() { return assignedTo; }
    public void setAssignedTo(User assignedTo) { this.assignedTo = assignedTo; }

    public OffsetDateTime getCreatedAt() { return createdAt; }

    public OffsetDateTime getUpdatedAt() { return updatedAt; }

    public List<TaskAttachment> getAttachments() { return attachments; }

    public boolean isArchived() { return archived; }
    public void setArchived(boolean archived) { this.archived = archived; }

}
