package de.uni.canpan.backend.service;

import de.uni.canpan.backend.AbstractPostgresIntegrationTest;
import de.uni.canpan.backend.model.KanbanColumn;
import de.uni.canpan.backend.model.Project;
import de.uni.canpan.backend.repository.KanbanColumnRepository;
import de.uni.canpan.backend.repository.ProjectRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
class KanbanColumnServiceTest extends AbstractPostgresIntegrationTest {

    @Autowired
    private KanbanColumnService service;

    @Autowired
    private KanbanColumnRepository columnRepository;

    @Autowired
    private ProjectRepository projectRepository;

    private Project project;

    @BeforeEach
    void setUp() {
        columnRepository.deleteAll();
        projectRepository.deleteAll();

        project = projectRepository.save(new Project("Test Project"));
    }

    @Test
    void createColumn_appendsToEnd_whenPositionIsNull() {
        KanbanColumn created = service.createColumn(project.getId(), "Todo", null);

        List<KanbanColumn> columns =
                columnRepository.findByProjectIdOrderByPosition(project.getId());

        assertThat(created.getName()).isEqualTo("Todo");
        assertThat(created.getPosition()).isEqualTo(0);
        assertThat(columns).hasSize(1);
        assertThat(columns.get(0).getName()).isEqualTo("Todo");
        assertThat(columns.get(0).getPosition()).isEqualTo(0);
    }

    @Test
    void createColumn_shiftsExistingColumns_whenInsertedInMiddle() {
        columnRepository.save(new KanbanColumn(project, "Todo", 0));
        columnRepository.save(new KanbanColumn(project, "Doing", 1));

        service.createColumn(project.getId(), "Review", 1);

        List<KanbanColumn> columns =
                columnRepository.findByProjectIdOrderByPosition(project.getId());

        assertThat(columns).hasSize(3);
        assertThat(columns.get(0).getName()).isEqualTo("Todo");
        assertThat(columns.get(0).getPosition()).isEqualTo(0);

        assertThat(columns.get(1).getName()).isEqualTo("Review");
        assertThat(columns.get(1).getPosition()).isEqualTo(1);

        assertThat(columns.get(2).getName()).isEqualTo("Doing");
        assertThat(columns.get(2).getPosition()).isEqualTo(2);
    }

    @Test
    void createColumn_insertsAtBeginning_whenPositionIsNegative() {
        columnRepository.save(new KanbanColumn(project, "Doing", 0));
        columnRepository.save(new KanbanColumn(project, "Done", 1));

        service.createColumn(project.getId(), "Todo", -5);

        List<KanbanColumn> columns =
                columnRepository.findByProjectIdOrderByPosition(project.getId());

        assertThat(columns).hasSize(3);
        assertThat(columns.get(0).getName()).isEqualTo("Todo");
        assertThat(columns.get(0).getPosition()).isEqualTo(0);

        assertThat(columns.get(1).getName()).isEqualTo("Doing");
        assertThat(columns.get(1).getPosition()).isEqualTo(1);

        assertThat(columns.get(2).getName()).isEqualTo("Done");
        assertThat(columns.get(2).getPosition()).isEqualTo(2);
    }

    @Test
    void createColumn_appendsToEnd_whenPositionIsGreaterThanSize() {
        columnRepository.save(new KanbanColumn(project, "Todo", 0));
        columnRepository.save(new KanbanColumn(project, "Doing", 1));

        service.createColumn(project.getId(), "Done", 99);

        List<KanbanColumn> columns =
                columnRepository.findByProjectIdOrderByPosition(project.getId());

        assertThat(columns).hasSize(3);
        assertThat(columns.get(0).getName()).isEqualTo("Todo");
        assertThat(columns.get(0).getPosition()).isEqualTo(0);

        assertThat(columns.get(1).getName()).isEqualTo("Doing");
        assertThat(columns.get(1).getPosition()).isEqualTo(1);

        assertThat(columns.get(2).getName()).isEqualTo("Done");
        assertThat(columns.get(2).getPosition()).isEqualTo(2);
    }

    @Test
    void createColumn_throwsException_whenProjectDoesNotExist() {
        UUID unknownProjectId = UUID.randomUUID();

        assertThatThrownBy(() -> service.createColumn(unknownProjectId, "Todo", null))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Project not Found");
    }

    @Test
    void renameColumn_changesName() {
        KanbanColumn column = columnRepository.save(new KanbanColumn(project, "Todo", 0));

        KanbanColumn renamed = service.renameColumn(project.getId(), column.getId(), "Backlog");

        assertThat(renamed.getName()).isEqualTo("Backlog");

        KanbanColumn reloaded = columnRepository.findById(column.getId()).orElseThrow();
        assertThat(reloaded.getName()).isEqualTo("Backlog");
    }

    @Test
    void renameColumn_throwsException_whenColumnDoesNotExist() {
        UUID unknownColumnId = UUID.randomUUID();

        assertThatThrownBy(() -> service.renameColumn(project.getId(), unknownColumnId, "Backlog"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Column not found");
    }

    @Test
    void moveColumn_movesColumnToFront() {
        KanbanColumn todo = columnRepository.save(new KanbanColumn(project, "Todo", 0));
        KanbanColumn doing = columnRepository.save(new KanbanColumn(project, "Doing", 1));
        KanbanColumn done = columnRepository.save(new KanbanColumn(project, "Done", 2));

        service.moveColumn(project.getId(), done.getId(), 0);

        List<KanbanColumn> columns =
                columnRepository.findByProjectIdOrderByPosition(project.getId());

        assertThat(columns).hasSize(3);
        assertThat(columns.get(0).getName()).isEqualTo("Done");
        assertThat(columns.get(0).getPosition()).isEqualTo(0);

        assertThat(columns.get(1).getName()).isEqualTo("Todo");
        assertThat(columns.get(1).getPosition()).isEqualTo(1);

        assertThat(columns.get(2).getName()).isEqualTo("Doing");
        assertThat(columns.get(2).getPosition()).isEqualTo(2);
    }

    @Test
    void moveColumn_movesColumnToBack() {
        KanbanColumn todo = columnRepository.save(new KanbanColumn(project, "Todo", 0));
        KanbanColumn doing = columnRepository.save(new KanbanColumn(project, "Doing", 1));
        KanbanColumn done = columnRepository.save(new KanbanColumn(project, "Done", 2));

        service.moveColumn(project.getId(), todo.getId(), 2);

        List<KanbanColumn> columns =
                columnRepository.findByProjectIdOrderByPosition(project.getId());

        assertThat(columns).hasSize(3);
        assertThat(columns.get(0).getName()).isEqualTo("Doing");
        assertThat(columns.get(0).getPosition()).isEqualTo(0);

        assertThat(columns.get(1).getName()).isEqualTo("Done");
        assertThat(columns.get(1).getPosition()).isEqualTo(1);

        assertThat(columns.get(2).getName()).isEqualTo("Todo");
        assertThat(columns.get(2).getPosition()).isEqualTo(2);
    }

    @Test
    void moveColumn_keepsOrder_whenPositionIsSame() {
        KanbanColumn todo = columnRepository.save(new KanbanColumn(project, "Todo", 0));
        KanbanColumn doing = columnRepository.save(new KanbanColumn(project, "Doing", 1));

        KanbanColumn moved = service.moveColumn(project.getId(), doing.getId(), 1);

        List<KanbanColumn> columns =
                columnRepository.findByProjectIdOrderByPosition(project.getId());

        assertThat(moved.getPosition()).isEqualTo(1);
        assertThat(columns).hasSize(2);
        assertThat(columns.get(0).getName()).isEqualTo("Todo");
        assertThat(columns.get(1).getName()).isEqualTo("Doing");
    }

    @Test
    void moveColumn_movesToZero_whenPositionIsNegative() {
        KanbanColumn todo = columnRepository.save(new KanbanColumn(project, "Todo", 0));
        KanbanColumn doing = columnRepository.save(new KanbanColumn(project, "Doing", 1));
        KanbanColumn done = columnRepository.save(new KanbanColumn(project, "Done", 2));

        service.moveColumn(project.getId(), done.getId(), -10);

        List<KanbanColumn> columns =
                columnRepository.findByProjectIdOrderByPosition(project.getId());

        assertThat(columns.get(0).getName()).isEqualTo("Done");
        assertThat(columns.get(0).getPosition()).isEqualTo(0);

        assertThat(columns.get(1).getName()).isEqualTo("Todo");
        assertThat(columns.get(1).getPosition()).isEqualTo(1);

        assertThat(columns.get(2).getName()).isEqualTo("Doing");
        assertThat(columns.get(2).getPosition()).isEqualTo(2);
    }

    @Test
    void moveColumn_movesToLastPosition_whenPositionIsTooLarge() {
        KanbanColumn todo = columnRepository.save(new KanbanColumn(project, "Todo", 0));
        KanbanColumn doing = columnRepository.save(new KanbanColumn(project, "Doing", 1));
        KanbanColumn done = columnRepository.save(new KanbanColumn(project, "Done", 2));

        service.moveColumn(project.getId(), todo.getId(), 99);

        List<KanbanColumn> columns =
                columnRepository.findByProjectIdOrderByPosition(project.getId());

        assertThat(columns.get(0).getName()).isEqualTo("Doing");
        assertThat(columns.get(0).getPosition()).isEqualTo(0);

        assertThat(columns.get(1).getName()).isEqualTo("Done");
        assertThat(columns.get(1).getPosition()).isEqualTo(1);

        assertThat(columns.get(2).getName()).isEqualTo("Todo");
        assertThat(columns.get(2).getPosition()).isEqualTo(2);
    }

    @Test
    void moveColumn_throwsException_whenColumnDoesNotExist() {
        UUID unknownColumnId = UUID.randomUUID();

        assertThatThrownBy(() -> service.moveColumn(project.getId(), unknownColumnId, 0))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Column not found");
    }

    @Test
    void deleteColumn_removesColumnAndShiftsFollowingPositions() {
        KanbanColumn todo = columnRepository.save(new KanbanColumn(project, "Todo", 0));
        KanbanColumn doing = columnRepository.save(new KanbanColumn(project, "Doing", 1));
        KanbanColumn done = columnRepository.save(new KanbanColumn(project, "Done", 2));

        service.deleteColumn(project.getId(), doing.getId());

        List<KanbanColumn> columns =
                columnRepository.findByProjectIdOrderByPosition(project.getId());

        assertThat(columns).hasSize(2);

        assertThat(columns.get(0).getName()).isEqualTo("Todo");
        assertThat(columns.get(0).getPosition()).isEqualTo(0);

        assertThat(columns.get(1).getName()).isEqualTo("Done");
        assertThat(columns.get(1).getPosition()).isEqualTo(1);

        assertThat(columnRepository.findById(doing.getId())).isEmpty();
    }

    @Test
    void deleteColumn_throwsException_whenColumnDoesNotExist() {
        UUID unknownColumnId = UUID.randomUUID();

        assertThatThrownBy(() -> service.deleteColumn(project.getId(), unknownColumnId))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Column not found");
    }
}