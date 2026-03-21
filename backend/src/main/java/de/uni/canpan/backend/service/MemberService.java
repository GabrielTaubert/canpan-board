package de.uni.canpan.backend.service;

import de.uni.canpan.backend.dto.MemberDto;
import de.uni.canpan.backend.exception.ForbiddenException;
import de.uni.canpan.backend.exception.ResourceNotFoundException;
import de.uni.canpan.backend.model.MemberRole;
import de.uni.canpan.backend.model.ProjectMember;
import de.uni.canpan.backend.model.Task;
import de.uni.canpan.backend.model.User;
import de.uni.canpan.backend.repository.ProjectMemberRepository;
import de.uni.canpan.backend.repository.ProjectRepository;
import de.uni.canpan.backend.repository.TaskRepository;
import de.uni.canpan.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class MemberService {

    private final ProjectMemberRepository projectMemberRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final TaskRepository taskRepository;

    public MemberService(ProjectMemberRepository projectMemberRepository,
                         ProjectRepository projectRepository,
                         UserRepository userRepository,
                         TaskRepository taskRepository) {
        this.projectMemberRepository = projectMemberRepository;
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
        this.taskRepository = taskRepository;
    }

    @Transactional(readOnly = true)
    public List<MemberDto> getMembers(UUID projectId, UUID requestingUserId) {
        if (!projectMemberRepository.existsByProjectIdAndUserId(projectId, requestingUserId)) {
            throw new ForbiddenException("User is not a member of this project");
        }
        return projectMemberRepository.findByProjectId(projectId)
                .stream()
                .map(MemberDto::from)
                .toList();
    }

    @Transactional
    public MemberDto addMember(UUID projectId, String email, UUID requestingUserId) {
        requireOwner(projectId, requestingUserId);

        var project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project", "id", projectId));

        User newUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));

        if (projectMemberRepository.existsByProjectIdAndUserId(projectId, newUser.getId())) {
            throw new IllegalArgumentException("User is already a member of this project");
        }

        ProjectMember newMember = new ProjectMember(project, newUser, MemberRole.MEMBER);
        return MemberDto.from(projectMemberRepository.save(newMember));
    }

    @Transactional
    public void removeMember(UUID projectId, UUID targetUserId, UUID requestingUserId) {
        requireOwner(projectId, requestingUserId);

        ProjectMember target = projectMemberRepository.findByProjectIdAndUserId(projectId, targetUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Member", "userId", targetUserId));

        if (target.getRole() == MemberRole.OWNER && countOwners(projectId) <= 1) {
            throw new IllegalArgumentException("Cannot remove the last OWNER of the project");
        }

        //find all task of this user
        List<Task> memberTasks = taskRepository.findByProjectIdAndAssignedToId(projectId, targetUserId);

        //set all task assigned to this user to null
        for (Task task : memberTasks) {
            task.setAssignedTo(null);
        }

        taskRepository.saveAll(memberTasks);

        projectMemberRepository.delete(target);
    }

    @Transactional
    public MemberDto updateRole(UUID projectId, UUID targetUserId, MemberRole role, UUID requestingUserId) {
        requireOwner(projectId, requestingUserId);

        ProjectMember target = projectMemberRepository.findByProjectIdAndUserId(projectId, targetUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Member", "userId", targetUserId));

        if (target.getRole() == MemberRole.OWNER && role != MemberRole.OWNER && countOwners(projectId) <= 1) {
            throw new IllegalArgumentException("Cannot demote the last OWNER of the project");
        }

        target.setRole(role);
        return MemberDto.from(projectMemberRepository.save(target));
    }

    private void requireOwner(UUID projectId, UUID userId) {
        ProjectMember member = projectMemberRepository.findByProjectIdAndUserId(projectId, userId)
                .orElseThrow(() -> new ForbiddenException("User is not a member of this project"));
        if (member.getRole() != MemberRole.OWNER) {
            throw new ForbiddenException("Only project owners can perform this action");
        }
    }

    private long countOwners(UUID projectId) {
        return projectMemberRepository.findByProjectId(projectId)
                .stream()
                .filter(m -> m.getRole() == MemberRole.OWNER)
                .count();
    }
}
