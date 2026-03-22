package de.uni.canpan.backend.controller;

import de.uni.canpan.backend.dto.NotificationDto;
import de.uni.canpan.backend.service.NotificationService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = {"http://localhost", "http://localhost:4200"})
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping("/user/{userId}")
    public List<NotificationDto> getUnreadNotifications(@PathVariable UUID userId) {
        return notificationService.getUnreadNotifications(userId);
    }

    // marks notification as read
    @PatchMapping("/{id}/read")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void markAsRead(@PathVariable UUID id) {
        notificationService.markAsRead(id);
    }
}