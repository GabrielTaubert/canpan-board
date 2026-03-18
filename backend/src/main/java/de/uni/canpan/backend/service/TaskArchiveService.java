package de.uni.canpan.backend.service;

import de.uni.canpan.backend.model.KanbanColumn;
import de.uni.canpan.backend.model.Task;
import de.uni.canpan.backend.repository.KanbanColumnRepository;
import de.uni.canpan.backend.repository.TaskRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;

@Service
public class TaskArchiveService {

    private final TaskRepository taskRepository;
    private final KanbanColumnRepository columnRepository;

    public TaskArchiveService(TaskRepository taskRepository, KanbanColumnRepository columnRepository) {
        this.taskRepository = taskRepository;
        this.columnRepository = columnRepository;
    }

    // runs on midnight
    @Scheduled(cron = "0 0 0 * * *")
    @Transactional
    public void archiveOldDoneTasks() {
        OffsetDateTime threshold = OffsetDateTime.now().minusDays(30);

        List<Task> tasksToArchive = taskRepository.findTasksToArchive(threshold);

        if (!tasksToArchive.isEmpty()) {
            tasksToArchive.forEach(t -> t.setArchived(true));
            taskRepository.saveAll(tasksToArchive);
        }
    }
}