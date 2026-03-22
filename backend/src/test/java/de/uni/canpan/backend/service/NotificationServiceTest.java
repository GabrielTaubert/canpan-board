package de.uni.canpan.backend.service;

import de.uni.canpan.backend.AbstractPostgresIntegrationTest;
import de.uni.canpan.backend.dto.NotificationDto;
import de.uni.canpan.backend.model.Notification;
import de.uni.canpan.backend.model.User;
import de.uni.canpan.backend.repository.NotificationRepository;
import de.uni.canpan.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
class NotificationServiceTest extends AbstractPostgresIntegrationTest {

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;

    private User testUser;

    @BeforeEach
    void setUp() {
        notificationRepository.deleteAll();
        userRepository.deleteAll();

        testUser = new User();
        testUser.setId(UUID.randomUUID());
        testUser.setEmail("notify@example.com");
        testUser = userRepository.save(testUser);
    }

    @Test
    void sendNotification_savesCorrectly() {
        String message = "Test Message";

        notificationService.sendNotification(testUser, message);

        List<Notification> all = notificationRepository.findAll();
        assertThat(all).hasSize(1);
        assertThat(all.get(0).getMessage()).isEqualTo(message);
        assertThat(all.get(0).getRecipient().getId()).isEqualTo(testUser.getId());
    }

    @Test
    void getUnreadNotifications_returnsOnlyUnread() {
        // unread message
        notificationService.sendNotification(testUser, "Unread 1");

        // manuel notification set read
        Notification readNote = new Notification(testUser, "Already Read");
        readNote.setRead(true);
        notificationRepository.save(readNote);

        List<NotificationDto> unread = notificationService.getUnreadNotifications(testUser.getId());

        assertThat(unread).hasSize(1);
        assertThat(unread.get(0).message()).isEqualTo("Unread 1");
    }

    @Test
    void markAsRead_updatesStatusCorrectly() {
        notificationService.sendNotification(testUser, "Mark me");
        Notification note = notificationRepository.findAll().get(0);
        UUID noteId = note.getId();

        // mark as read
        notificationService.markAsRead(noteId);

        List<NotificationDto> unreadAfter = notificationService.getUnreadNotifications(testUser.getId());
        assertThat(unreadAfter).isEmpty();

        Notification updatedNote = notificationRepository.findById(noteId).orElseThrow();

        assertThat(updatedNote.isRead()).isTrue();
    }

    @Test
    void sendNotification_doesNothing_whenUserIsNull() {
        notificationService.sendNotification(null, "Should not be saved");

        assertThat(notificationRepository.count()).isEqualTo(0);
    }
}