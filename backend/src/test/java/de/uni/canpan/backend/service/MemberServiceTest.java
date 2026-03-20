package de.uni.canpan.backend.service;

import de.uni.canpan.backend.AbstractPostgresIntegrationTest;
import de.uni.canpan.backend.dto.MemberDto;
import de.uni.canpan.backend.exception.ForbiddenException;
import de.uni.canpan.backend.model.MemberRole;
import de.uni.canpan.backend.model.Project;
import de.uni.canpan.backend.model.ProjectMember;
import de.uni.canpan.backend.model.User;
import de.uni.canpan.backend.repository.KanbanColumnRepository;
import de.uni.canpan.backend.repository.ProjectMemberRepository;
import de.uni.canpan.backend.repository.ProjectRepository;
import de.uni.canpan.backend.repository.TaskRepository;
import de.uni.canpan.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
class MemberServiceTest extends AbstractPostgresIntegrationTest {

    @Autowired
    private MemberService memberService;

    @Autowired
    private ProjectMemberRepository projectMemberRepository;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private KanbanColumnRepository kanbanColumnRepository;

    private Project project;
    private User owner;
    private User regularMember;
    private User outsider;

    @BeforeEach
    void setUp() {
        taskRepository.deleteAll();
        kanbanColumnRepository.deleteAll();
        projectMemberRepository.deleteAll();
        projectRepository.deleteAll();
        userRepository.deleteAll();

        owner = userRepository.save(new User(UUID.randomUUID(), "owner@example.com"));
        regularMember = userRepository.save(new User(UUID.randomUUID(), "member@example.com"));
        outsider = userRepository.save(new User(UUID.randomUUID(), "outsider@example.com"));

        project = projectRepository.save(new Project("Test Project"));
        projectMemberRepository.save(new ProjectMember(project, owner, MemberRole.OWNER));
        projectMemberRepository.save(new ProjectMember(project, regularMember, MemberRole.MEMBER));
    }

    @Test
    void getMembers_returnsAllMembers_whenCalledByMember() {
        List<MemberDto> members = memberService.getMembers(project.getId(), owner.getId());
        assertThat(members).hasSize(2);
    }

    @Test
    void getMembers_throwsForbidden_whenCalledByNonMember() {
        assertThatThrownBy(() -> memberService.getMembers(project.getId(), outsider.getId()))
                .isInstanceOf(ForbiddenException.class);
    }

    @Test
    void addMember_addsMemberWithMemberRole_whenCalledByOwner() {
        MemberDto added = memberService.addMember(project.getId(), outsider.getEmail(), owner.getId());
        assertThat(added.email()).isEqualTo(outsider.getEmail());
        assertThat(added.role()).isEqualTo(MemberRole.MEMBER);
    }

    @Test
    void addMember_throwsForbidden_whenCalledByNonOwner() {
        assertThatThrownBy(() -> memberService.addMember(project.getId(), outsider.getEmail(), regularMember.getId()))
                .isInstanceOf(ForbiddenException.class);
    }

    @Test
    void addMember_throwsException_whenAlreadyMember() {
        assertThatThrownBy(() -> memberService.addMember(project.getId(), regularMember.getEmail(), owner.getId()))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("already a member");
    }

    @Test
    void removeMember_removesMember_whenCalledByOwner() {
        memberService.removeMember(project.getId(), regularMember.getId(), owner.getId());
        assertThat(projectMemberRepository.existsByProjectIdAndUserId(project.getId(), regularMember.getId())).isFalse();
    }

    @Test
    void removeMember_throwsForbidden_whenCalledByNonOwner() {
        assertThatThrownBy(() -> memberService.removeMember(project.getId(), owner.getId(), regularMember.getId()))
                .isInstanceOf(ForbiddenException.class);
    }

    @Test
    void removeMember_throwsException_whenRemovingLastOwner() {
        assertThatThrownBy(() -> memberService.removeMember(project.getId(), owner.getId(), owner.getId()))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("last OWNER");
    }

    @Test
    void updateRole_promotesToOwner_whenCalledByOwner() {
        MemberDto updated = memberService.updateRole(project.getId(), regularMember.getId(), MemberRole.OWNER, owner.getId());
        assertThat(updated.role()).isEqualTo(MemberRole.OWNER);
    }

    @Test
    void updateRole_throwsException_whenDemotingLastOwner() {
        assertThatThrownBy(() -> memberService.updateRole(project.getId(), owner.getId(), MemberRole.MEMBER, owner.getId()))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("last OWNER");
    }
}
