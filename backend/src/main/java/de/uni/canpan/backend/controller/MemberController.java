package de.uni.canpan.backend.controller;

import de.uni.canpan.backend.dto.AddMemberRequest;
import de.uni.canpan.backend.dto.MemberDto;
import de.uni.canpan.backend.dto.UpdateMemberRoleRequest;
import de.uni.canpan.backend.security.UserPrincipal;
import de.uni.canpan.backend.service.MemberService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/projects/{projectId}/members")
public class MemberController {

    private final MemberService memberService;

    public MemberController(MemberService memberService) {
        this.memberService = memberService;
    }

    @GetMapping
    public List<MemberDto> getMembers(
            @PathVariable UUID projectId,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        UUID userId = UUID.fromString(principal.getUserId());
        return memberService.getMembers(projectId, userId);
    }

    @PostMapping
    public MemberDto addMember(
            @PathVariable UUID projectId,
            @Valid @RequestBody AddMemberRequest request,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        UUID userId = UUID.fromString(principal.getUserId());
        return memberService.addMember(projectId, request.email(), userId);
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<Void> removeMember(
            @PathVariable UUID projectId,
            @PathVariable UUID userId,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        UUID requestingUserId = UUID.fromString(principal.getUserId());
        memberService.removeMember(projectId, userId, requestingUserId);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{userId}/role")
    public MemberDto updateRole(
            @PathVariable UUID projectId,
            @PathVariable UUID userId,
            @Valid @RequestBody UpdateMemberRoleRequest request,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        UUID requestingUserId = UUID.fromString(principal.getUserId());
        return memberService.updateRole(projectId, userId, request.role(), requestingUserId);
    }
}
