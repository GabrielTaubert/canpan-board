package de.uni.canpan.backend.controller;

import de.uni.canpan.backend.dto.DashboardProgressDto;
import de.uni.canpan.backend.dto.JobIdDto;
import de.uni.canpan.backend.dto.UserStoryPointSummaryDto;
import de.uni.canpan.backend.service.ProjectDashboardService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/projects/{projectId}/dashboard")
public class ProjectDashboardController {

    private final ProjectDashboardService dashboardService;

    public ProjectDashboardController(ProjectDashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    /**
     * sends all users with open storypoints (except done)
     */
    @GetMapping("/user-stats")
    public List<UserStoryPointSummaryDto> getUserStats(@PathVariable UUID projectId) {
        return dashboardService.getUserStoryPointSummary(projectId);
    }

    // start calculation
    @PostMapping("/calculate")
    public JobIdDto startCalculation(@PathVariable UUID projectId) {
        UUID jobId = dashboardService.startCalculation(projectId);
        dashboardService.calculateAsync(projectId, jobId);
        return new JobIdDto(jobId);
    }

    // status ping
    @GetMapping("/jobs/{jobId}")
    public DashboardProgressDto getJobStatus(@PathVariable UUID jobId) {
        return dashboardService.getStatus(jobId);
    }
}