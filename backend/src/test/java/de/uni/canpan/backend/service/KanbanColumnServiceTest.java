package de.uni.canpan.backend.service;

import de.uni.canpan.backend.AbstractPostgresIntegrationTest;
import de.uni.canpan.backend.model.KanbanColumn;
import de.uni.canpan.backend.model.Project;
import de.uni.canpan.backend.repository.KanbanColumnRepository;
import de.uni.canpan.backend.repository.ProjectRepository;
import de.uni.canpan.backend.repository.TaskRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
class KanbanColumnServiceTest extends AbstractPostgresIntegrationTest {

    @Autowired
    private KanbanColumnService service;

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private KanbanColumnRepository columnRepository;

    @Autowired
    private ProjectRepository projectRepository;

    private Project project;

    @BeforeEach
    void setUp() {
        taskRepository.deleteAll();
        columnRepository.deleteAll();
        projectRepository.deleteAll();

        project = projectRepository.save(new Project());
        // WICHTIG: Jedes Projekt startet mit To-Do (0) und Done (1)
        service.initializeProject(project);
    }

    @Test
    void createColumn_insertsBetweenTodoAndDone_whenPositionIsNull() {
        // Todo (0) und Done (1) existieren bereits. Neue Spalte soll auf Position 1
        // (zwischen beide).
        KanbanColumn created = service.createColumn(project.getId(), "In Progress", null);

        List<KanbanColumn> columns = columnRepository.findByProjectIdOrderByPosition(project.getId());

        assertThat(columns).hasSize(3);
        assertThat(columns.get(0).getName()).isEqualTo("To-Do");
        assertThat(columns.get(1).getName()).isEqualTo("In Progress");
        assertThat(columns.get(2).getName()).isEqualTo("Done");

        assertThat(columns.get(1).getPosition()).isEqualTo(1);
        assertThat(columns.get(1).isSystem()).isFalse();
    }

    @Test
    void createColumn_enforcesMinimumPositionOne_whenPositionIsZeroOrNegative() {
        // Versuch, vor To-Do einzufügen (-5) wird auf 1 korrigiert
        service.createColumn(project.getId(), "First User Column", -5);

        List<KanbanColumn> columns = columnRepository.findByProjectIdOrderByPosition(project.getId());

        assertThat(columns.get(0).getName()).isEqualTo("To-Do");
        assertThat(columns.get(1).getName()).isEqualTo("First User Column");
    }

    @Test
    void createColumn_enforcesMaximumPositionBeforeDone_whenPositionIsTooLarge() {
        // To-Do(0), Done(1). Versuch auf Position 99 einzufügen.
        // Muss auf Index 1 landen (vor Done), Done rutscht auf 2.
        service.createColumn(project.getId(), "Last User Column", 99);

        List<KanbanColumn> columns = columnRepository.findByProjectIdOrderByPosition(project.getId());

        assertThat(columns.get(columns.size() - 2).getName()).isEqualTo("Last User Column");
        assertThat(columns.get(columns.size() - 1).getName()).isEqualTo("Done");
    }

    @Test
    void renameColumn_throwsException_whenColumnIsSystem() {
        List<KanbanColumn> columns = columnRepository.findByProjectIdOrderByPosition(project.getId());
        KanbanColumn todo = columns.get(0); // To-Do ist System

        assertThatThrownBy(() -> service.renameColumn(project.getId(), todo.getId(), "New Name"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("System columns cannot be renamed");
    }

    @Test
    void moveColumn_cannotMoveBeforeTodo() {
        // Stand: To-Do (0), Dev (1), Done (2)
        KanbanColumn dev = service.createColumn(project.getId(), "Dev", 1);

        // Versuch, Dev auf 0 zu schieben -> wird auf 1 korrigiert
        service.moveColumn(project.getId(), dev.getId(), 0);

        List<KanbanColumn> columns = columnRepository.findByProjectIdOrderByPosition(project.getId());
        assertThat(columns.get(0).getName()).isEqualTo("To-Do");
        assertThat(columns.get(1).getName()).isEqualTo("Dev");
    }

    @Test
    void moveColumn_cannotMoveAfterDone() {
        // Stand: To-Do (0), Dev (1), Done (2)
        KanbanColumn dev = service.createColumn(project.getId(), "Dev", 1);

        // Versuch, Dev auf 5 zu schieben -> wird auf columns.size() - 2 = 1 korrigiert
        service.moveColumn(project.getId(), dev.getId(), 5);

        List<KanbanColumn> columns = columnRepository.findByProjectIdOrderByPosition(project.getId());
        assertThat(columns.get(1).getName()).isEqualTo("Dev");
        assertThat(columns.get(2).getName()).isEqualTo("Done");
    }

    @Test
    void moveColumn_throwsException_whenMovingSystemColumn() {
        List<KanbanColumn> columns = columnRepository.findByProjectIdOrderByPosition(project.getId());
        KanbanColumn done = columns.get(1);

        assertThatThrownBy(() -> service.moveColumn(project.getId(), done.getId(), 1))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("System columns cannot be moved");
    }

    @Test
    void deleteColumn_throwsException_whenDeletingSystemColumn() {
        List<KanbanColumn> columns = columnRepository.findByProjectIdOrderByPosition(project.getId());
        KanbanColumn todo = columns.get(0);

        assertThatThrownBy(() -> service.deleteColumn(project.getId(), todo.getId()))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("System columns cannot be deleted");
    }

    @Test
    void deleteColumn_worksForUserColumns() {
        KanbanColumn dev = service.createColumn(project.getId(), "Dev", 1);
        service.deleteColumn(project.getId(), dev.getId());

        List<KanbanColumn> columns = columnRepository.findByProjectIdOrderByPosition(project.getId());
        assertThat(columns).hasSize(2);
        assertThat(columns.get(0).getName()).isEqualTo("To-Do");
        assertThat(columns.get(1).getName()).isEqualTo("Done");
    }

    @Test
    void initializeProject_createsTwoSystemColumns() {
        // Ein neues Projekt ohne Spalten
        Project newProject = projectRepository.save(new Project());
        service.initializeProject(newProject);

        List<KanbanColumn> columns = columnRepository.findByProjectIdOrderByPosition(newProject.getId());

        assertThat(columns).hasSize(2);
        assertThat(columns.get(0).getName()).isEqualTo("To-Do");
        assertThat(columns.get(0).isSystem()).isTrue();
        assertThat(columns.get(1).getName()).isEqualTo("Done");
        assertThat(columns.get(1).isSystem()).isTrue();
    }
}
