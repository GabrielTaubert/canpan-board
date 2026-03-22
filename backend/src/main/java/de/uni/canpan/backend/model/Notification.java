package de.uni.canpan.backend.model;

import jakarta.persistence.*;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "notifications")
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User recipient;

    @Column(nullable = false)
    private String message;

    @Column(name = "is_read")
    private boolean read = false;

    @Column(name = "created_at")
    private OffsetDateTime createdAt = OffsetDateTime.now();

    protected Notification() {};

    public Notification(
            User recipient,
            String message
    ) {
        this.recipient = recipient;
        this.message = message;
    }

    @PrePersist
    protected void onCreate() {
        createdAt = OffsetDateTime.now();
    }

    public void setRead(boolean read) { this.read = read; }
    public String getMessage() {return this.message;}
    public User getRecipient() {return this.recipient;}
    public UUID  getId() {return  this.id;}
    public OffsetDateTime getCreatedAt() {return  this.createdAt;}
}
