package de.uni.canpan.backend.model;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "projects")
public class Project {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    public Project() {
    }

    public UUID getId() {
        return id;
    }

}
