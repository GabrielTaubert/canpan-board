package de.uni.canpan.backend.service;

import de.uni.canpan.backend.AbstractPostgresIntegrationTest;
import de.uni.canpan.backend.dto.DashboardProgressDto;
import de.uni.canpan.backend.dto.UserStoryPointSummaryDto;
import de.uni.canpan.backend.model.KanbanColumn;
import de.uni.canpan.backend.model.Project;
import de.uni.canpan.backend.model.Task;
import de.uni.canpan.backend.model.User;
import de.uni.canpan.backend.repository.KanbanColumnRepository;
import de.uni.canpan.backend.repository.ProjectRepository;
import de.uni.canpan.backend.repository.TaskRepository;
import de.uni.canpan.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
class ProjectDashboardServiceTest extends AbstractPostgresIntegrationTest {

    @Autowired
    private ProjectDashboardService dashboardService;

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private KanbanColumnRepository columnRepository;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private UserRepository userRepository;

    private Project project;
    private KanbanColumn todoColumn;
    private KanbanColumn doneColumn;
    private User realUser1;

    @BeforeEach
    void setUp() {
        taskRepository.deleteAll();
        columnRepository.deleteAll();
        projectRepository.deleteAll();
        userRepository.deleteAll();

        project = projectRepository.save(new Project());

        todoColumn = new KanbanColumn(project, "To Do", 0);
        todoColumn.setSystem(true);
        columnRepository.save(todoColumn);

        doneColumn = new KanbanColumn(project, "Done", 1);
        doneColumn.setSystem(true);
        columnRepository.save(doneColumn);

        realUser1 = new User();
        realUser1.setId(UUID.randomUUID());
        realUser1.setEmail("test-user@canpan.de");
        realUser1 = userRepository.save(realUser1);
    }

    @Test
    void getUserStoryPointSummary_returnsCorrectSums_excludingDone() {
        taskRepository.save(new Task(todoColumn, "Task 1", "...", Task.TaskPriority.MEDIUM, 5, realUser1));

        // should be ignored
        taskRepository.save(new Task(doneColumn, "Task 2", "...", Task.TaskPriority.LOW, 10, realUser1));

        // task without user
        taskRepository.save(new Task(todoColumn, "Task 3", "...", Task.TaskPriority.HIGH, 3, null));

        List<UserStoryPointSummaryDto> summary = dashboardService.getUserStoryPointSummary(project.getId());

        assertThat(summary).hasSize(2);

        UserStoryPointSummaryDto user1Stats = summary.stream()
                .filter(s -> realUser1.getId().equals(s.userId())) // Vergleich mit der ID des Objekts
                .findFirst().orElseThrow();

        assertThat(user1Stats.totalStoryPoints()).isEqualTo(5L);
        assertThat(user1Stats.openTasksCount()).isEqualTo(1L);
    }

    @Test
    void longRunningTask_startsAndProvidesStatus() throws InterruptedException {
        taskRepository.save(new Task(todoColumn, "Work", "...", Task.TaskPriority.MEDIUM, 1, null));

        UUID jobId = dashboardService.startCalculation(project.getId());
        assertThat(jobId).isNotNull();

        dashboardService.calculateAsync(project.getId(), jobId);

        Thread.sleep(2500);

        DashboardProgressDto status = dashboardService.getStatus(jobId);

        assertThat(status.status()).isIn("RUNNING", "COMPLETED");
        assertThat(status.progress()).isGreaterThan(0);

        if ("COMPLETED".equals(status.status())) {
            assertThat(status.result()).isNotNull();
        }
    }
}