package de.uni.canpan.backend.controller;

import de.uni.canpan.backend.dto.CreateColumnRequest;
import de.uni.canpan.backend.dto.KanbanColumnDto;
import de.uni.canpan.backend.dto.MoveColumnRequest;
import de.uni.canpan.backend.dto.RenameColumnRequest;
import de.uni.canpan.backend.model.KanbanColumn;
import de.uni.canpan.backend.service.KanbanColumnService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/projects/{projectId}/columns")
public class KanbanColumnController {

    private final KanbanColumnService columnService;

    public KanbanColumnController(KanbanColumnService columnService) {
        this.columnService = columnService;
    }

    @GetMapping
    public List<KanbanColumnDto> getColumns(@PathVariable UUID projectId) {
        return columnService.getColumns(projectId)
                .stream()
                .map(KanbanColumnDto::from)
                .toList();
    }

    @PostMapping
    public KanbanColumnDto createColumn(
            @PathVariable UUID projectId,
            @RequestBody CreateColumnRequest request
    ) {
        KanbanColumn column = columnService.createColumn(
                projectId,
                request.name(),
                request.position()
        );
        return KanbanColumnDto.from(column);
    }

    @PatchMapping("/{columnId}/rename")
    public KanbanColumnDto renameColumn(
            @PathVariable UUID projectId,
            @PathVariable UUID columnId,
            @RequestBody RenameColumnRequest request
    ) {
        KanbanColumn column = columnService.renameColumn(
                projectId,
                columnId,
                request.name()
        );
        return KanbanColumnDto.from(column);
    }

    @PatchMapping("/{columnId}/move")
    public KanbanColumnDto moveColumn(
            @PathVariable UUID projectId,
            @PathVariable UUID columnId,
            @RequestBody MoveColumnRequest request
    ) {
        KanbanColumn column = columnService.moveColumn(
                projectId,
                columnId,
                request.position()
        );
        return KanbanColumnDto.from(column);
    }

    @DeleteMapping("/{columnId}")
    public void deleteColumn(
            @PathVariable UUID projectId,
            @PathVariable UUID columnId
    ) {
        columnService.deleteColumn(projectId, columnId);
    }
}