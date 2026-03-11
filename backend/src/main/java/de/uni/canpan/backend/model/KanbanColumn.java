package de.uni.canpan.backend.model;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "kanban_columns",
        uniqueConstraints = @UniqueConstraint(columnNames = {"project_id", "position"}))
public class KanbanColumn {

    @Id
    @GeneratedValue
    private UUID id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @Column
    private String name;

    @Column
    private int position; //index from 0

    protected KanbanColumn() {}

    public KanbanColumn(Project project, String name, int position){
        this.project = project;
        this.name = name;
        this.position = position;
    }

    public UUID getId() { return id; }
    public Project getProject() { return project; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public int getPosition() { return position; }
    public void setPosition(int position) { this.position = position; }

}
