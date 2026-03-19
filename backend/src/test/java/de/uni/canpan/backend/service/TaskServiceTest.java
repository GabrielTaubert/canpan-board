package de.uni.canpan.backend.service;

import de.uni.canpan.backend.AbstractPostgresIntegrationTest;
import de.uni.canpan.backend.dto.MoveTaskRequest;
import de.uni.canpan.backend.dto.TaskDetailDto;
import de.uni.canpan.backend.dto.TaskRequest;
import de.uni.canpan.backend.model.KanbanColumn;
import de.uni.canpan.backend.model.Project;
import de.uni.canpan.backend.model.Task;
import de.uni.canpan.backend.repository.KanbanColumnRepository;
import de.uni.canpan.backend.repository.ProjectRepository;
import de.uni.canpan.backend.repository.TaskRepository;
import jakarta.transaction.Transactional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
class TaskServiceTest extends AbstractPostgresIntegrationTest {

    @Autowired
    private TaskService taskService;

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private KanbanColumnRepository columnRepository;

    @Autowired
    private ProjectRepository projectRepository;

    private KanbanColumn column;
    private Project project;

    @BeforeEach
    void setUp() {
        taskRepository.deleteAll();
        columnRepository.deleteAll();
        projectRepository.deleteAll();

        project = projectRepository.save(new Project());
        column = columnRepository.save(new KanbanColumn(project, "To Do", 0));
    }

    @Test
    void createTask_savesTaskCorrectly() {
        TaskRequest request = new TaskRequest(
                "New Task",
                "Description",
                Task.TaskPriority.MEDIUM,
                5,
                null,
                column.getId()
        );

        Task created = taskService.createTask(column.getId(), request);

        assertThat(created.getId()).isNotNull();
        assertThat(created.getTitle()).isEqualTo("New Task");
        assertThat(created.getColumn().getId()).isEqualTo(column.getId());

        assertThat(taskRepository.findById(created.getId())).isPresent();
    }

    @Test
    void createTask_throwsException_whenColumnNotFound() {
        TaskRequest request = new TaskRequest("Title", "Desc", Task.TaskPriority.LOW, 1, null, UUID.randomUUID());
        UUID randomId = UUID.randomUUID();

        assertThatThrownBy(() -> taskService.createTask(randomId, request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Column not found");
    }

    @Test
    @Transactional
    void moveTask_updatesColumn() {
        Task task = taskRepository.save(new Task(column, "Task", "Desc", Task.TaskPriority.HIGH, 3, null));
        KanbanColumn targetColumn = columnRepository.save(new KanbanColumn(project, "Done", 1));
        MoveTaskRequest moveRequest = new MoveTaskRequest(targetColumn.getId());

        Task movedTask = taskService.moveTask(task.getId(), moveRequest);

        assertThat(movedTask.getColumn().getId()).isEqualTo(targetColumn.getId());

        Task reloaded = taskRepository.findById(task.getId()).orElseThrow();
        assertThat(reloaded.getColumn().getName()).isEqualTo("Done");
    }

    @Test
    void getTaskDetail_returnsCorrectData() {
        Task task = taskRepository.save(new Task(column, "Detail Task", "Check this", Task.TaskPriority.MEDIUM, 8, null));

        TaskDetailDto detail = taskService.getTaskDetail(task.getId());

        assertThat(detail.title()).isEqualTo("Detail Task");
        assertThat(detail.columnName()).isEqualTo("To Do");
        assertThat(detail.priority()).isEqualTo(Task.TaskPriority.MEDIUM);
    }

    @Test
    void editTask_updatesFields() {
        Task task = taskRepository.save(new Task(column, "Old Title", "Old Desc", Task.TaskPriority.LOW, 1, null));
        TaskRequest updateRequest = new TaskRequest(
                "New Title",
                "New Desc",
                Task.TaskPriority.HIGH,
                13,
                null,
                column.getId()
        );

        Task updated = taskService.editTask(task.getId(), updateRequest);

        assertThat(updated.getTitle()).isEqualTo("New Title");
        assertThat(updated.getPriority()).isEqualTo(Task.TaskPriority.HIGH);
        assertThat(updated.getStorypoints()).isEqualTo(13);
    }

    @Test
    void deleteTask_removesFromDatabase() {
        Task task = taskRepository.save(new Task(column, "Delete Me", "...", Task.TaskPriority.LOW, 0, null));
        UUID taskId = task.getId();

        taskService.deleteTask(taskId);

        assertThat(taskRepository.findById(taskId)).isEmpty();
    }

    @Test
    void getProjectTasks_returnsAllTasksOfProject() {
        // task in project A
        taskRepository.save(new Task(column, "Task 1", "...", Task.TaskPriority.LOW, 1, null));

        // task in project B
        Project projectB = projectRepository.save(new Project());
        KanbanColumn columnB = columnRepository.save(new KanbanColumn(projectB, "Other Column", 0));
        taskRepository.save(new Task(columnB, "Task 2", "...", Task.TaskPriority.LOW, 1, null));

        List<Task> projectATasks = taskService.getProjectTasks(project.getId());

        assertThat(projectATasks).hasSize(1);
        assertThat(projectATasks.get(0).getTitle()).isEqualTo("Task 1");
    }

    @Test
    void getColumnTasks_excludesArchivedTasks() {

        taskRepository.save(new Task(column, "Active Task", "...", Task.TaskPriority.LOW, 1, null));

        Task archivedTask = new Task(column, "Archived Task", "...", Task.TaskPriority.LOW, 1, null);
        archivedTask.setArchived(true);
        taskRepository.save(archivedTask);

        List<Task> activeTasks = taskService.getColumnTasks(column.getId());

        assertThat(activeTasks).hasSize(1);
        assertThat(activeTasks.get(0).getTitle()).isEqualTo("Active Task");
    }

    @Test
    void getProjectTasks_excludesArchivedTasks() {
        taskRepository.save(new Task(column, "Active Project Task", "...", Task.TaskPriority.LOW, 1, null));

        Task archivedTask = new Task(column, "Archived Project Task", "...", Task.TaskPriority.LOW, 1, null);
        archivedTask.setArchived(true);
        taskRepository.save(archivedTask);

        List<Task> activeTasks = taskService.getProjectTasks(project.getId());

        assertThat(activeTasks).hasSize(1);
        assertThat(activeTasks.get(0).getTitle()).isEqualTo("Active Project Task");
    }

    @Test
    void searchTasksInProject_returnsFilteredTasks_includingCaseInsensitive() {
        taskRepository.save(new Task(column, "Frontend Bugfix", "Fix CSS", Task.TaskPriority.HIGH, 3, null));
        taskRepository.save(new Task(column, "Backend Refactoring", "Clean Code", Task.TaskPriority.MEDIUM, 5, null));

        // normal search
        List<Task> results = taskService.searchTasksInProject(project.getId(), "Bugfix");
        assertThat(results).hasSize(1);
        assertThat(results.get(0).getTitle()).isEqualTo("Frontend Bugfix");

        // case insensitive search
        List<Task> caseResults = taskService.searchTasksInProject(project.getId(), "backend");
        assertThat(caseResults).hasSize(1);
        assertThat(caseResults.get(0).getTitle()).isEqualTo("Backend Refactoring");
    }

    @Test
    void searchTasksInProject_returnsAllTasks_whenSearchTextIsBlankOrNull() {

        taskRepository.save(new Task(column, "Task 1", "Desc 1", Task.TaskPriority.LOW, 1, null));
        taskRepository.save(new Task(column, "Task 2", "Desc 2", Task.TaskPriority.LOW, 1, null));

        // search with blank string
        List<Task> blankResults = taskService.searchTasksInProject(project.getId(), "   ");
        assertThat(blankResults).hasSize(2);

        //search with null
        List<Task> nullResults = taskService.searchTasksInProject(project.getId(), null);
        assertThat(nullResults).hasSize(2);
    }
}