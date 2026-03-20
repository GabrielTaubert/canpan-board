package de.uni.canpan.backend.model;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "task_labels")
public class TaskLabel {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "task_id", nullable = false)
    private Task task;

    @Column(name = "label_text", nullable = false)
    private String labelText;

    @Column(nullable = false)
    private String color;

    protected TaskLabel() {}

    public TaskLabel(Task task, String labelText, String color) {
        this.task = task;
        this.labelText = labelText;
        this.color = color;
    }

    public UUID getId() { return id; }
    public Task getTask() { return task; }
    public String getLabelText() { return labelText; }
    public void setLabelText(String labelText) { this.labelText = labelText; }
    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }
}