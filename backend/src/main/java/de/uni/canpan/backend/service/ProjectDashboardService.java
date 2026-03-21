package de.uni.canpan.backend.service;

import de.uni.canpan.backend.dto.ColumnStatsDto;
import de.uni.canpan.backend.dto.DashboardProgressDto;
import de.uni.canpan.backend.dto.UserStoryPointSummaryDto;
import de.uni.canpan.backend.model.KanbanColumn;
import de.uni.canpan.backend.model.Task;
import de.uni.canpan.backend.repository.KanbanColumnRepository;
import de.uni.canpan.backend.repository.TaskRepository;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Service
public class ProjectDashboardService {

    private final Map<UUID, Integer> progresses = new ConcurrentHashMap<>();
    private final Map<UUID, List<ColumnStatsDto>> results = new ConcurrentHashMap<>();

    private final TaskRepository taskRepository;
    private final KanbanColumnRepository columnRepository;

    public ProjectDashboardService(TaskRepository taskRepository, KanbanColumnRepository columnRepository) {
        this.taskRepository = taskRepository;
        this.columnRepository = columnRepository;
    }

    @Transactional(readOnly = true)
    public List<UserStoryPointSummaryDto> getUserStoryPointSummary(UUID projectId) {

        List<Object[]> rawResults = taskRepository.getUserStoryPointRawStats(projectId);

        return rawResults.stream()
                .map(UserStoryPointSummaryDto::fromRaw)
                .collect(Collectors.toList());
    }

    public UUID startCalculation(UUID projectId) {
        UUID jobId = UUID.randomUUID();
        progresses.put(jobId, 0);
        return jobId;
    }

    @Async
    public void calculateAsync(UUID projectId, UUID jobId) {
        try {
            List<KanbanColumn> columns = columnRepository.findByProjectIdOrderByPosition(projectId);
            List<ColumnStatsDto> statsList = new ArrayList<>();

            for (int i = 0; i < columns.size(); i++) {
                // simulates 2 seconds calculation
                Thread.sleep(2000);

                KanbanColumn col = columns.get(i);

                // get active tasks
                List<Task> tasksInCol = taskRepository.findActiveByColumnId(col.getId());

                // calculate stats
                int count = tasksInCol.size();
                long spSum = tasksInCol.stream()
                        .mapToLong(t -> t.getStorypoints() != null ? t.getStorypoints() : 0)
                        .sum();

                statsList.add(new ColumnStatsDto(col.getName(), count, spSum));

                // calculate progress in % and safe in map
                int percent = (int) (((double) (i + 1) / columns.size()) * 100);
                progresses.put(jobId, percent);
            }

            // safe results
            results.put(jobId, statsList);
            progresses.put(jobId, 100);

        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }

    public DashboardProgressDto getStatus(UUID jobId) {
        int progress = progresses.getOrDefault(jobId, 0);
        String status = (progress == 100) ? "COMPLETED" : "RUNNING";
        return new DashboardProgressDto(progress, status, results.get(jobId));
    }
}