package de.uni.canpan.backend.service;

import de.uni.canpan.backend.model.KanbanColumn;
import de.uni.canpan.backend.model.Project;
import de.uni.canpan.backend.repository.KanbanColumnRepository;
import de.uni.canpan.backend.repository.ProjectRepository;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class KanbanColumnService {

    private final KanbanColumnRepository columnRepository;
    private final ProjectRepository projectRepository;

    public KanbanColumnService(KanbanColumnRepository columnRepository,
                               ProjectRepository projectRepository) {
        this.columnRepository = columnRepository;
        this.projectRepository = projectRepository;
    }

    @Transactional
    public void initializeProject(Project project) {
        KanbanColumn todo = new KanbanColumn(project, "To-Do", 0);
        todo.setSystem(true);

        KanbanColumn done = new KanbanColumn(project, "Done", 1);
        done.setSystem(true);

        columnRepository.saveAll(List.of(todo, done));
    }

    @Transactional
    public List<KanbanColumn> getColumns(UUID projectId) {
        return columnRepository.findByProjectIdOrderByPosition(projectId);
    }

    @Transactional
    public KanbanColumn createColumn(UUID projectId, String name, Integer position) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("Project not Found"));

        List<KanbanColumn> columns = columnRepository.findByProjectIdOrderByPosition(projectId);

        // new columns are added between to-do (0) and done (end)
        // for new entries the lower border is 1 and the maximum is size - 1
        int insertPos;
        if (position == null) {
            insertPos = Math.max(1, columns.size() - 1);
        } else {
            insertPos = Math.max(1, Math.min(position, columns.size() - 1));
        }

        //temporary save at unused position
        KanbanColumn newColumn = new KanbanColumn(project, name, -1);
        newColumn.setSystem(false);
        columns.add(insertPos, newColumn);

        reindexColumns(columns);
        return newColumn;
    }

    @Transactional
    public KanbanColumn renameColumn(UUID projectId, UUID columnId, String newName) {
        KanbanColumn column = columnRepository.findByIdAndProjectId(columnId, projectId)
                .orElseThrow(() -> new IllegalArgumentException("Column not found"));

        if (column.isSystem()) {
            throw new IllegalArgumentException("System columns cannot be renamed");
        }

        column.setName(newName);
        return column;
    }

    @Transactional
    public KanbanColumn moveColumn(UUID projectId, UUID columnId, Integer position) {
        KanbanColumn column = columnRepository.findByIdAndProjectId(columnId, projectId)
                .orElseThrow(() -> new IllegalArgumentException("Column not found"));

        if (column.isSystem()) {
            throw new IllegalArgumentException("System columns cannot be moved");
        }

        List<KanbanColumn> columns = columnRepository.findByProjectIdOrderByPosition(projectId);

        // limit target position: bigger than to-do and lower than done
        int newPosition = Math.max(1, Math.min(position, columns.size() - 2));

        columns.removeIf(c -> c.getId().equals(columnId));
        columns.add(newPosition, column);

        reindexColumns(columns);
        return column;
    }

    @Transactional
    public void deleteColumn(UUID projectId, UUID columnId) {
        KanbanColumn column = columnRepository.findByIdAndProjectId(columnId, projectId)
                .orElseThrow(() -> new IllegalArgumentException("Column not found"));

        if (column.isSystem()) {
            throw new IllegalArgumentException("System columns cannot be deleted");
        }

        List<KanbanColumn> columns = columnRepository.findByProjectIdOrderByPosition(projectId);
        columns.removeIf(c -> c.getId().equals(columnId));

        columnRepository.delete(column);
        columnRepository.flush();

        reindexColumns(columns);
    }

    private void reindexColumns(List<KanbanColumn> columns) {
        //temporary set on unused position to avoid db unique position constraint
        for (int i = 0; i < columns.size(); i++) {
            columns.get(i).setPosition(-(i + 1));
        }
        columnRepository.saveAll(columns);
        columnRepository.flush();

        //set final position
        for (int i = 0; i < columns.size(); i++) {
            columns.get(i).setPosition(i);
        }
        columnRepository.saveAll(columns);
        columnRepository.flush();
    }
}
