package de.uni.canpan.backend.model;

import jakarta.persistence.*;

import java.util.UUID;

@Entity
@Table(name = "task_attachments")
public class TaskAttachment {

    @Id
    @GeneratedValue
    private UUID id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "task_id", nullable = false)
    private Task task;

    @Column(name = "file_url", nullable = false)
    private String fileUrl;

    protected TaskAttachment() {};

    public TaskAttachment(Task task, String fileUrl) {
        this.task = task;
        this.fileUrl = fileUrl;
    }

    public UUID getId() {return id;}
    public Task getTask() {return task;}
    public String getFileUrl() {return fileUrl;}

}
