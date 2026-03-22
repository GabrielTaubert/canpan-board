package de.uni.canpan.backend.service;

import de.uni.canpan.backend.dto.*;
import de.uni.canpan.backend.model.*;
import de.uni.canpan.backend.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class NotificationService {
    private final NotificationRepository notificationRepository;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    @Transactional
    public void sendNotification(User recipient, String message) {
        if (recipient == null) return;
        Notification notification = new Notification(recipient, message);
        notificationRepository.save(notification);
    }

    @Transactional(readOnly = true)
    public List<NotificationDto> getUnreadNotifications(UUID userId) {
        return notificationRepository.findByRecipientIdAndReadFalseOrderByCreatedAtDesc(userId)
                .stream()
                .map(NotificationDto::from)
                .toList();
    }

    @Transactional
    public void markAsRead(UUID notificationId) {
        notificationRepository.findById(notificationId)
                .ifPresent(n -> n.setRead(true));
    }
}
