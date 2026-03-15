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

    @Column(name = "file_name", nullable = false)
    private String fileName;

    @Column(name = "file_path", nullable = false)
    private String filePath;

    protected TaskAttachment() {};

    public TaskAttachment(Task task, String fileName, String filePath) {
        this.task = task;
        this.fileName = fileName;
        this.filePath = filePath;
    }

    public UUID getId() {return id;}
    public Task getTask() {return task;}
    public String getFileName() {return fileName;}
    public String getFilePath() {return filePath;}

}
