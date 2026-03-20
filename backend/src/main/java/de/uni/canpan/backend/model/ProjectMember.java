package de.uni.canpan.backend.model;

import jakarta.persistence.*;

@Entity
@Table(name = "project_members")
public class ProjectMember {

    @EmbeddedId
    private ProjectMemberId id;

    @ManyToOne
    @MapsId("projectId")
    @JoinColumn(name = "project_id")
    private Project project;

    @ManyToOne
    @MapsId("userId")
    @JoinColumn(name = "user_id")
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false)
    private MemberRole role;

    public ProjectMember() {}

    public ProjectMember(Project project, User user, MemberRole role) {
        this.id = new ProjectMemberId(project.getId(), user.getId());
        this.project = project;
        this.user = user;
        this.role = role;
    }

    public ProjectMemberId getId() { return id; }
    public Project getProject() { return project; }
    public User getUser() { return user; }
    public MemberRole getRole() { return role; }
    public void setRole(MemberRole role) { this.role = role; }
}
