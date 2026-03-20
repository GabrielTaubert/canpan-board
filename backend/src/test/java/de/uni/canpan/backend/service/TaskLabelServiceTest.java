package de.uni.canpan.backend.service;

import de.uni.canpan.backend.AbstractPostgresIntegrationTest;
import de.uni.canpan.backend.dto.TaskLabelRequest;
import de.uni.canpan.backend.model.KanbanColumn;
import de.uni.canpan.backend.model.Project;
import de.uni.canpan.backend.model.Task;
import de.uni.canpan.backend.model.TaskLabel;
import de.uni.canpan.backend.repository.KanbanColumnRepository;
import de.uni.canpan.backend.repository.ProjectRepository;
import de.uni.canpan.backend.repository.TaskLabelRepository;
import de.uni.canpan.backend.repository.TaskRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
class TaskLabelServiceTest extends AbstractPostgresIntegrationTest {

    @Autowired
    private TaskLabelService taskLabelService;

    @Autowired
    private TaskLabelRepository taskLabelRepository;

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private KanbanColumnRepository columnRepository;

    @Autowired
    private ProjectRepository projectRepository;

    private Task testTask;

    @BeforeEach
    void setUp() {
        taskLabelRepository.deleteAll();
        taskRepository.deleteAll();
        columnRepository.deleteAll();
        projectRepository.deleteAll();

        Project project = projectRepository.save(new Project());
        KanbanColumn column = columnRepository.save(new KanbanColumn(project, "Column", 0));
        testTask = taskRepository.save(new Task(column, "Task", "Desc", Task.TaskPriority.MEDIUM, 1, null));
    }

    @Test
    void setLabel_createsNewLabel_whenNoneExists() {
        TaskLabelRequest request = new TaskLabelRequest("Bug", "#FF0000");

        TaskLabel savedLabel = taskLabelService.setLabel(testTask.getId(), request);

        assertThat(savedLabel.getId()).isNotNull();
        assertThat(savedLabel.getLabelText()).isEqualTo("Bug");
        assertThat(savedLabel.getColor()).isEqualTo("#FF0000");
        assertThat(savedLabel.getTask().getId()).isEqualTo(testTask.getId());

        assertThat(taskLabelRepository.findByTaskId(testTask.getId())).isPresent();
    }

    @Test
    void setLabel_updatesExistingLabel() {
        // Zuerst ein Label erstellen
        taskLabelRepository.save(new TaskLabel(testTask, "Old Label", "#000000"));

        TaskLabelRequest updateRequest = new TaskLabelRequest("Feature", "#00FF00");

        TaskLabel updatedLabel = taskLabelService.setLabel(testTask.getId(), updateRequest);

        assertThat(updatedLabel.getLabelText()).isEqualTo("Feature");
        assertThat(updatedLabel.getColor()).isEqualTo("#00FF00");

        // Sicherstellen, dass nicht ein zweites Label für denselben Task erstellt wurde
        assertThat(taskLabelRepository.count()).isEqualTo(1);
    }

    @Test
    void setLabel_throwsException_whenTaskNotFound() {
        TaskLabelRequest request = new TaskLabelRequest("Label", "#FFF");
        UUID randomId = UUID.randomUUID();

        assertThatThrownBy(() -> taskLabelService.setLabel(randomId, request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Task not found");
    }

    @Test
    void deleteLabel_removesLabelByTaskId() {
        // 1. Label für den Test-Task erstellen
        taskLabelRepository.save(new TaskLabel(testTask, "High Prio", "#FF0000"));

        // 2. Löschen über die TASK-ID (nicht Label-ID)
        taskLabelService.deleteLabel(testTask.getId());

        // 3. Verifizieren, dass das Label weg ist
        assertThat(taskLabelRepository.findByTaskId(testTask.getId())).isEmpty();
    }

    @Test
    void deleteLabel_throwsException_whenNoLabelExistsForTask() {
        // testTask hat in der setUp() Methode kein Label bekommen
        UUID taskId = testTask.getId();

        assertThatThrownBy(() -> taskLabelService.deleteLabel(taskId))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Label not found");
    }
}