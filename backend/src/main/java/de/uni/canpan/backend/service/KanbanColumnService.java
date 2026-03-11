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
    public List<KanbanColumn> getColumns(UUID projectId) {
        return columnRepository.findByProjectIdOrderByPosition(projectId);
    }

    @Transactional
    public KanbanColumn createColumn(UUID projectId, String name, Integer position) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow( () -> new IllegalArgumentException("Project not Found"));

        List<KanbanColumn> columns = columnRepository.findByProjectIdOrderByPosition(projectId);
        int size = columns.size();

        int insertPos = 0;

        if (position == null) {
            insertPos = size;
        } else {
            //only positive numbers and smaller number between position and size
            insertPos = Math.max(0, Math.min(position, size));
        }

        KanbanColumn newColumn = new KanbanColumn(project, name, -1);
        columns.add(insertPos, newColumn);

        for (int i = 0; i < columns.size(); i++) {
            columns.get(i).setPosition(-(i + 1));
        }
        columnRepository.saveAll(columns);
        columnRepository.flush();

        for (int i = 0; i < columns.size(); i++) {
            columns.get(i).setPosition(i);
        }
        columnRepository.saveAll(columns);
        columnRepository.flush();

        return newColumn;
    }

    @Transactional
    public KanbanColumn renameColumn(UUID projectId, UUID columnId, String newName) {
        KanbanColumn column = columnRepository.findByIdAndProjectId(columnId, projectId)
                .orElseThrow(() -> new IllegalArgumentException("Column not found"));

        column.setName(newName);
        return column;
    }

    @Transactional
    public KanbanColumn moveColumn(UUID projectId, UUID columnId, Integer position) {

        KanbanColumn column = columnRepository.findByIdAndProjectId(columnId, projectId)
                .orElseThrow(() -> new IllegalArgumentException("Column not found"));

        List<KanbanColumn> columns = columnRepository.findByProjectIdOrderByPosition(projectId);
        int size = columns.size();

        int oldPosition = column.getPosition();
        int newPosition = Math.max(0, Math.min(position, size - 1));

        if (newPosition == oldPosition) {
            return column;
        }

        //removes column from list to add it at new position
        columns.removeIf(c -> c.getId().equals(columnId));
        columns.add(newPosition, column);

        //temporary put position on unused index
        for (int i = 0; i < columns.size(); i++) {
            columns.get(i).setPosition(-(i+1));
        }
        columnRepository.saveAll(columns);
        columnRepository.flush();

        for (int i = 0; i < columns.size(); i++) {
           columns.get(i).setPosition(i);
        }
        columnRepository.saveAll(columns);
        columnRepository.flush();

        return column;
    }

    @Transactional
    public void deleteColumn(UUID projectId, UUID columnId) {
        KanbanColumn column = columnRepository.findByIdAndProjectId(columnId, projectId)
                .orElseThrow(() -> new IllegalArgumentException("Column not found"));

        List<KanbanColumn> columns = columnRepository.findByProjectIdOrderByPosition(projectId);

        columns.removeIf(c -> c.getId().equals(columnId));

        columnRepository.delete(column);
        columnRepository.flush();

        for (int i = 0; i < columns.size(); i++) {
            columns.get(i).setPosition(-(i + 1));
        }
        columnRepository.saveAll(columns);
        columnRepository.flush();

        for (int i = 0; i < columns.size(); i++) {
            columns.get(i).setPosition(i);
        }
        columnRepository.saveAll(columns);
        columnRepository.flush();
    }
}
