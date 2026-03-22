package de.uni.canpan.backend.repository;

import de.uni.canpan.backend.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface NotificationRepository extends JpaRepository<Notification, UUID> {
    List<Notification> findByRecipientIdAndReadFalseOrderByCreatedAtDesc(UUID userId);
}